# Telegram Mini App — стартовый шаблон

Бот показывает кнопку **🚀 Launch**, которая открывает сайт (`webapp/index.html`)
во весь экран телефона внутри Telegram.

## Что внутри
- `bot/bot.py` — бот на Python (aiogram 3), для локального запуска. Кнопка + кнопка-меню, открывающие Mini App.
- `netlify/functions/bot.js` — serverless-вебхук бота (для продакшена на Netlify, работает 24/7 без сервера).
- `webapp/index.html` — само приложение (полноэкранная страница внутри Telegram).
- `netlify.toml` — конфиг деплоя: статика из `webapp/` + функции из `netlify/functions`.

## Как запустить (по шагам)

### 1. Создать бота
1. Открой в Telegram [@BotFather](https://t.me/BotFather).
2. Отправь `/newbot`, придумай имя и username → получишь **токен** вида `123456:ABC...`.

### 2. Захостить webapp (нужен HTTPS)
Telegram открывает Mini App только по `https`. Проще всего — Netlify:
- Подключи этот репозиторий к Netlify (GitHub → Netlify), она сама задеплоит `webapp/`
  и `netlify/functions/bot.js` при каждом пуше.
- В настройках сайта на Netlify задай переменные окружения `BOT_TOKEN` и `WEBAPP_URL`.
- В BotFather (или через Telegram Bot API `setWebhook`) укажи адрес
  `https://твой-проект.netlify.app/.netlify/functions/bot` как webhook бота —
  тогда бот будет работать 24/7 без своего сервера.

### 3. Локальный запуск бота (альтернатива вебхуку)
```powershell
cd tg-miniapp
pip install -r bot/requirements.txt

$env:BOT_TOKEN = "СЮДА_ТОКЕН_ОТ_BOTFATHER"
$env:WEBAPP_URL = "https://твой-проект.netlify.app"

python bot/bot.py
```

### 4. Проверить
Открой своего бота в Telegram → `/start` → нажми **🚀 Launch**.
Приложение откроется во весь экран.

## Что дальше
- Меняй `webapp/index.html` — это обычный сайт, можно любой дизайн/логику.
- Данные пользователя доступны через `window.Telegram.WebApp.initDataUnsafe.user`.
- Документация: https://core.telegram.org/bots/webapps
