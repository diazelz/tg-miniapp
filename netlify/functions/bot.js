// Netlify-функция = webhook Telegram. Работает 24/7 без постоянного процесса:
// Telegram сам присылает сюда POST при каждом сообщении пользователю бота.
// Токен берётся из переменной окружения BOT_TOKEN (задаётся в настройках Netlify).

const WEBAPP_URL = process.env.WEBAPP_URL || "https://d1-miniapp.netlify.app/";

exports.handler = async (event) => {
  // Telegram шлёт только POST. На всё остальное отвечаем "ok", чтобы не падать.
  if (event.httpMethod !== "POST") {
    return { statusCode: 200, body: "ok" };
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
