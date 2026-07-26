# syzygy3d — 3D Product Animation Portfolio

Портфолио 3D-художника и аниматора. Тёмный минимализм, сетка работ с превью
и лайтбоксом, self-hosted видео (без YouTube-брендинга).

**Живая версия:** _добавь ссылку GitHub Pages сюда после публикации_

## Структура
```
index.html          — разметка
styles.css          — стили (акцентный цвет = переменная --accent)
script.js           — сетка проектов, фильтры, лайтбокс, анимации
assets/videos/      — ролики (.mp4)
assets/images/      — картинки
```

## Как редактировать
- **Проекты** — массив `PROJECTS` в начале `script.js` (название / категория / файл).
- **Акцентный цвет** — переменная `--accent` в начале `styles.css` (один раз).
- **Имя/бренд** — `syzygy3d` в `index.html` (nav, footer, title).
- **Контакты** — секция `#contact` в `index.html` (email + соцсети).

## Добавить новый ролик
1. Положи `.mp4` в `assets/videos/` (до 100 МБ — лимит GitHub).
2. Добавь объект в массив `PROJECTS` в `script.js`.

## Локальный запуск
Открой `index.html` в браузере, либо подними локальный сервер:
```bash
python -m http.server 8000
```
Затем зайди на http://localhost:8000

## Деплой
Хостится на GitHub Pages (ветка `main`, папка `/root`).
Файл `.nojekyll` отключает обработку Jekyll.
