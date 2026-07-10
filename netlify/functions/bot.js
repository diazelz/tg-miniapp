// Netlify-функция = webhook Telegram. Работает 24/7 без постоянного процесса:
// Telegram сам присылает сюда POST при каждом сообщении пользователю бота.
// Токен берётся из переменной окружения BOT_TOKEN (задаётся в настройках Netlify).

const WEBAPP_URL = process.env.WEBAPP_URL || "https://d1-miniapp.netlify.app/";

exports.handler = async (event) => {
  // GET — health-check: показывает, видит ли функция токен (сам токен не раскрываем).
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, hasToken: Boolean(process.env.BOT_TOKEN) }),
    };
  }

  const TOKEN = process.env.BOT_TOKEN;
  if (!TOKEN) {
    return { statusCode: 200, body: "no token" };
  }

  let update;
  try {
    update = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 200, body: "ok" };
  }

  const msg = update.message;
  const api = (method, body) =>
    fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  // Оплата Stars: pre_checkout_query нужно подтвердить в течение 10 секунд.
  if (update.pre_checkout_query) {
    await api("answerPreCheckoutQuery", { pre_checkout_query_id: update.pre_checkout_query.id, ok: true });
    return { statusCode: 200, body: "ok" };
  }

  // Успешная оплата звёздами — продлеваем подписку Pro на 30 дней в БД.
  if (msg && msg.successful_payment) {
    try {
      const { getStore } = require("@netlify/blobs");
      const store = getStore("users");
      const uid = String(msg.from.id);
      const now = Date.now();
      const rec = (await store.get(uid, { type: "json" })) || {
        user_id: msg.from.id, created_at: now, trial_start: now,
      };
      const base = rec.sub_expires && rec.sub_expires > now ? rec.sub_expires : now;
      rec.sub_expires = base + 30 * 86400000;
      rec.plan = "pro";
      rec.first_name = msg.from.first_name || rec.first_name || "";
      await store.setJSON(uid, rec);
    } catch (e) {}
    await api("sendMessage", { chat_id: msg.chat.id, text: "Спасибо за покупку! ⭐ Подписка Pro активна на 30 дней." });
    return { statusCode: 200, body: "ok" };
  }

  // На /start (и на любой первый контакт) — показываем кнопку Launch.
  if (msg && msg.text && msg.text.startsWith("/start")) {
    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: msg.chat.id,
        text: "Привет! Нажми кнопку ниже, чтобы открыть приложение 👇",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🚀 Launch", web_app: { url: WEBAPP_URL } }],
          ],
        },
      }),
    });
  }

  // Всегда отвечаем 200 — иначе Telegram будет повторять запрос.
  return { statusCode: 200, body: "ok" };
};
