# Жаратылыстану · 2-сынып — оқулық көмекшісі

Серверсіз статикалық сайт. GitHub Pages-те немесе компьютерде `index.html` арқылы ашылады.

## Құрылымы
- `index.html`, `css/`, `js/` — сайттың өзі
- `data/content.js` — барлық сабақ материалы (оқулық бойынша, бет нөмірлерімен)
- `data/booktext.js` — оқулықтың автоматты танылған мәтіні (іздеу үшін)
- `img/` — оқулықтан қиылған суреттер, `pages/` — оқулық беттері
- `files/kmj/` — ҚМЖ (Word), `files/ppt/` — презентациялар (PowerPoint)

## GitHub Pages-ке орналастыру
1. github.com → **New repository** → атауы, мысалы `jaratylystanu-2` → **Public** → Create.
2. **Add file → Upload files** → осы папканың ішіндегі барлық файл мен папканы сүйреп әкеліп, **Commit changes**.
3. **Settings → Pages** → Source: **Deploy from a branch**, Branch: **main**, папка: **/(root)** → Save.
4. 1–2 минуттан кейін сайт ашылады: `https://<атыңыз>.github.io/jaratylystanu-2/`

## Жаңарту
Өзгерген файлдарды қайта жүктейсіз, сілтеме өзгермейді.
