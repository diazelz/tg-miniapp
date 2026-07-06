"""
Telegram-бот, который открывает Mini App во весь экран.

Запуск:
    1. pip install -r requirements.txt
    2. Создай бота в @BotFather, скопируй токен.
    3. Пропиши переменные окружения BOT_TOKEN и WEBAPP_URL
       (или отредактируй значения ниже по умолчанию).
    4. python bot.py
"""

import asyncio
import logging
import os

from dotenv import load_dotenv
from aiogram import Bot, Dispatcher

# Читаем токен и адрес из файла .env (лежит рядом с bot.py)
load_dotenv()
from aiogram.filters import CommandStart
from aiogram.types import (
    Message,
    MenuButtonWebApp,
    WebAppInfo,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
)

# --- Настройки -------------------------------------------------------------
# Токен от @BotFather. Лучше задать через переменную окружения BOT_TOKEN.
BOT_TOKEN = os.getenv("BOT_TOKEN", "ВСТАВЬ_СЮДА_ТОКЕН")

# HTTPS-адрес твоего Mini App (например, https://твой-проект.netlify.app).
# Telegram открывает Mini App ТОЛЬКО по https, локальный http не подойдёт.
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://example.netlify.app")
# ---------------------------------------------------------------------------

logging.basicConfig(level=logging.INFO)

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


@dp.message(CommandStart())
async def start(message: Message) -> None:
    """На /start показываем кнопку, открывающую Mini App на весь экран."""
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🚀 Launch",
                    web_app=WebAppInfo(url=WEBAPP_URL),
                )
            ]
        ]
    )
    await message.answer(
        "Привет! Нажми кнопку ниже, чтобы открыть приложение 👇",
        reply_markup=keyboard,
    )


async def set_menu_button() -> None:
    """Кнопка-меню слева от поля ввода тоже открывает Mini App."""
    await bot.set_chat_menu_button(
        menu_button=MenuButtonWebApp(
            text="Launch",
            web_app=WebAppInfo(url=WEBAPP_URL),
        )
    )


async def main() -> None:
    await set_menu_button()
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
