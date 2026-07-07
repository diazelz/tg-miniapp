// Создаёт invoice-ссылку для оплаты подписки звёздами Telegram (currency XTR).
// Mini App вызывает POST { name } -> возвращаем { link } -> tg.openInvoice(link).
// Сумму берём НА СЕРВЕРЕ по названию пакета, не доверяя клиенту.

const PLANS = {
  "Старт": 100,
  "Про": 150,
  "Максимум": 200,
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "method not allowed" }) };
  }
  const TOKEN = process.env.BOT_TOKEN;
  if (!TOKEN) return { statusCode: 500, body: JSON.stringify({ error: "no token" }) };

  let data;
  try { data = JSON.parse(event.body || "{}"); } catch { data = {}; }

  const name = data.name;
  const amount = PLANS[name];
  if (!amount) return { statusCode: 400, body: JSON.stringify({ error: "unknown plan" }) };

  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/createInvoiceLink`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: `Lingo ${name}`,
      description: `Подписка «${name}» на 1 месяц — открывает все функции приложения.`,
      payload: `sub_${name}_${Date.now()}`,
      currency: "XTR",
      prices: [{ label: `${name} · 1 месяц`, amount }],
    }),
  });

  const json = await res.json();
  if (!json.ok) {
    return { statusCode: 200, body: JSON.stringify({ error: json.description || "createInvoiceLink failed" }) };
  }
  return { statusCode: 200, body: JSON.stringify({ link: json.result }) };
};
