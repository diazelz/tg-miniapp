"""Генерирует иконку Lingo в PNG 512x512 (для аватара бота в BotFather).
Два варианта: с тремя точками и с буквой L. Фон — диагональный градиент малина->бирюза
(Telegram обрежет аватар в круг, поэтому заливаем весь квадрат)."""
from PIL import Image, ImageDraw

S = 512
MALINA = (255, 78, 138)
TEAL = (159, 231, 219)
DOT_TEAL = (34, 184, 166)
WHITE = (255, 255, 255, 255)

def gradient_bg():
    g = Image.new("RGB", (2, 2))
    mid = tuple((MALINA[i] + TEAL[i]) // 2 for i in range(3))
    g.putpixel((0, 0), MALINA)   # верх-лево
    g.putpixel((1, 0), mid)
    g.putpixel((0, 1), mid)
    g.putpixel((1, 1), TEAL)     # низ-право
    return g.resize((S, S), Image.BICUBIC).convert("RGBA")

def draw_bubble(d, s):
    # Речевой пузырь: скруглённый прямоугольник + хвостик
    d.rounded_rectangle([6*s, 8*s, 42*s, 35*s], radius=12*s, fill=WHITE)
    d.polygon([(16*s, 31*s), (16*s, 44*s), (31*s, 33*s)], fill=WHITE)

def make_dots():
    img = gradient_bg(); d = ImageDraw.Draw(img); s = S/48
    draw_bubble(d, s)
    for cx, color in [(18, MALINA), (24, DOT_TEAL), (30, MALINA)]:
        r = 2.7*s; cy = 21.5*s
        d.ellipse([cx*s-r, cy-r, cx*s+r, cy+r], fill=color)
    img.save("logo-icon-dots.png")

def make_letter():
    img = gradient_bg(); d = ImageDraw.Draw(img); s = S/48
    draw_bubble(d, s)
    # Буква L из двух скруглённых прямоугольников
    d.rounded_rectangle([20*s, 13.5*s, 24.6*s, 29*s], radius=1.8*s, fill=MALINA)
    d.rounded_rectangle([20*s, 24.4*s, 31.5*s, 29*s], radius=1.8*s, fill=MALINA)
    img.save("logo-icon-L.png")

make_dots()
make_letter()
print("Готово: logo-icon-dots.png, logo-icon-L.png")
