// Серверный трекинг пользователей + статус подписки (Netlify Blobs).
// Mini App присылает подписанную Telegram-строку initData -> проверяем HMAC,
// достаём user_id, заводим запись, стартуем 30-дневный триал, отдаём доступ.
const crypto = require("crypto");
const { getStore } = require("@netlify/blobs");

const TRIAL_DAYS = 30;
const DAY = 86400000;

// Проверка подписи Telegram WebApp initData (защита от подделки user_id)
function validateInitData(initData, botToken) {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");
  const pairs = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  const secret = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const check = crypto.createHmac("sha256", secret).update(pairs).digest("hex");
  if (check !== hash) return null;
  const userRaw = params.get("user");
  if (!userRaw) return null;
  try { return JSON.parse(userRaw); } catch { return null; }
}

function computeStatus(rec) {
  const now = Date.now();
  if (rec.sub_expires && rec.sub_expires > now) {
    return { access: "pro", source: "sub", daysLeft: Math.ceil((rec.sub_expires - now) / DAY) };
  }
  if (rec.trial_start && now < rec.trial_start + TRIAL_DAYS * DAY) {
    return { access: "pro", source: "trial", daysLeft: Math.ceil((rec.trial_start + TRIAL_DAYS * DAY - now) / DAY) };
  }
  return { access: "locked", source: "none", daysLeft: 0 };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: JSON.stringify({ error: "method" }) };
  const TOKEN = process.env.BOT_TOKEN;
  if (!TOKEN) return { statusCode: 500, body: JSON.stringify({ error: "no token" }) };

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch { body = {}; }

  const user = validateInitData(body.initData || "", TOKEN);
  if (!user || !user.id) return { statusCode: 401, body: JSON.stringify({ error: "invalid initData" }) };

  const store = getStore("users");
  const key = String(user.id);
  let rec = await store.get(key, { type: "json" });
  let isNew = false;
  const now = Date.now();

  if (!rec) {
    isNew = true;
    rec = {
      user_id: user.id, first_name: user.first_name || "", username: user.username || "",
      created_at: now, trial_start: now, plan: "trial", sub_expires: null,
    };
  }
  if (body.calibration) {
    const c = body.calibration;
    ["lang", "goal", "level", "daily"].forEach((k) => { if (c[k] != null) rec[k] = c[k]; });
  }

  const status = computeStatus(rec);
  rec.plan = status.source === "sub" ? "pro" : (status.source === "trial" ? "trial" : "free");
  await store.setJSON(key, rec);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ok: true, isNew, access: status.access, source: status.source, daysLeft: status.daysLeft,
      profile: { lang: rec.lang || null, goal: rec.goal || null, level: rec.level || null, daily: rec.daily || null },
    }),
  };
};
