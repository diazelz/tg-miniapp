# Telegram Mini App — стартовый шаблон

Бот показывает кнопку **🚀 Launch**, которая открывает сайт (`webapp/index.html`)
во весь экран телефона внутри Telegram.

## Что внутри
- `bot.py` — бот на Python (aiogram 3). Кнопка + кнопка-меню, открывающие Mini App.
- `webapp/index.html` — само приложение (полноэкранная страница с темой Telegram).
- `requirements.txt` — зависимости.

## Как запустить (по шагам)

### 1. Создать бота
1. Открой в Telegram [@BotFather](https://t.me/BotFather).
2. Отправь `/newbot`, придумай имя и username → получишь **токен** вида `123456:ABC...`.

### 2. Захостить webapp (нужен HTTPS)
Telegram открывает Mini App только по `https`. Проще всего — Netlify (у тебя уже есть аккаунт):
- Перетащи папку `webapp` на https://app.netlify.com/drop → получишь адрес вида
  `https://твой-проект.netlify.app`.

### 3. Запустить бота
```powershell
cd tg-miniapp
pip install -r requirements.txt

# задать токен и адрес приложения (в этом окне PowerShell)
$env:BOT_TOKEN = "СЮДА_ТОКЕН_ОТ_BOTFATHER"
$env:WEBAPP_URL = "https://твой-проект.netlify.app"

python bot.py
```

### 4. Проверить
Открой своего бота в Telegram → `/start` → нажми **🚀 Launch**.
Приложение откроется во весь экран.

## Что дальше
- Меняй `webapp/index.html` — это обычный сайт, можно любой дизайн/логику.
- Данные пользователя доступны через `window.Telegram.WebApp.initDataUnsafe.user`.
- Документация: https://core.telegram.org/bots/webapps
