
## Юридичний помічник — Frontend
Багатосторінковий застосунок на React + Vite для юридичного асистента: генерація правових документів (DOCX), калькулятори, база законів, словник, тренажер і інтерфейс для ІІ-чату.

### Технології
- React 19, React Router 6
- Vite 7
- docx (експорт .docx), marked + DOMPurify (безпечний рендер Markdown)
- Tailwind (утилітарні стилі) + кастомні CSS-змінні теми

### Швидкий старт
Потрібен Node.js 18+.

```bash
npm install
npm run dev
```

Відкрийте `http://localhost:5173`.

### Скрипти
- `npm run dev` — запуск у режимі розробки
- `npm run build` — збірка продакшн (у `dist/`)
- `npm run preview` — попередній перегляд зібраної версії
- `npm run lint` — перевірка коду ESLint

### Основні розділи та маршрути
Маршрутизація визначена в `src/App.jsx`:
- `/` — посадкова сторінка (`Landing`)
- `/home` — домашня
- `/ui` — список шаблонів документів
- `/ui/template` — форма заповнення шаблону
- `/ui/generated` — список згенерованих файлів
- `/ui/calculators` та підшляхи: `fees`, `interest`, `penalty`, `esv`, `alimony`
- `/ui/ai` — інтерфейс ІІ‑чату
- `/ui/dictionary` — словник
- `/ui/database` — база законів (пошук)
- `/ui/database/results`, `/ui/database/read` — результати пошуку та перегляд документа
- `/ui/account` — акаунт
- `/ui/auth/*` — логін/реєстрація/відновлення пароля
- `/ui/trainer/*` — тренажер (тести та результати)

### Структура проєкту (головне)
```
lawbot/
  public/
    codes/             # HTML/JSON тексти законів для розділу «База»
  src/
    lib/
      templates.js     # Опис шаблонів документів і форматування
      docxGen.js       # Генерація .docx через бібліотеку docx
      generatedStore.js# Локальне сховище (localStorage) для готових файлів
      theme.js         # Керування темою (light/dark)
    pages/
      landing/         # Посадкова, компоненти та утиліти
      ...              # AIChat, Templates, Calculators, Database, Trainer тощо
```

### Генерація документів (.docx)
- Конфігурація шаблонів і полів — `src/lib/templates.js`.
- Рендеринг тексту за заповненими полями — `formatTemplate()`.
- Експорт у файл `.docx` — `src/lib/docxGen.js` (`generateDocxFile`).
- Збереження посилань на готові файли — `src/lib/generatedStore.js` (localStorage).

Як додати новий шаблон:
1) Додайте категорію до `TEMPLATE_CATEGORIES`.
2) Опишіть шаблон у `TEMPLATES` з `fields` і `body` (використовуйте плейсхолдери `{key}`).

### База законів
У `public/codes/` містяться HTML і JSON версії актів (напр., `1618-15.*`). Розділ Бази читає ці дані для пошуку/відображення. За потреби додавайте нові файли до цієї директорії.

### ІІ‑чат (UI)
Компонент `src/pages/AIChat.jsx` відповідає за інтерфейс чату та коректно рендерить відповіді Markdown (через marked + DOMPurify). Зв’язок із моделлю/бекендом не входить до цього репозиторію — компонент можна підключити до будь‑якого сервера.

### Стилі та тема
Посадкова сторінка використовує кастомні CSS‑змінні теми та утиліти Tailwind. Перемикач теми і змінні — у `src/lib/theme.js` та компонентах лендингу.

### Збірка і деплой
```bash
npm run build
npm run preview
```
Вміст `dist/` можна розміщувати на будь‑якому статичному хостингу (Nginx, Vercel, Netlify, GitHub Pages тощо).

---


## Legal Assistant — Frontend
Multi‑page React + Vite application for a legal assistant: document generation (DOCX), calculators, law database, dictionary, trainer, and an AI chat UI.

### Tech Stack
- React 19, React Router 6
- Vite 7
- docx (export .docx), marked + DOMPurify (safe Markdown rendering)
- Tailwind (utility CSS) + custom theme CSS variables

### Quick Start
Requires Node.js 18+.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

### Scripts
- `npm run dev` — development server
- `npm run build` — production build (to `dist/`)
- `npm run preview` — preview the built app
- `npm run lint` — run ESLint

### Main Sections & Routes
Routes are defined in `src/App.jsx`:
- `/` — landing (`Landing`)
- `/home` — home
- `/ui` — document templates list
- `/ui/template` — template fill form
- `/ui/generated` — generated files list
- `/ui/calculators` and subpaths: `fees`, `interest`, `penalty`, `esv`, `alimony`
- `/ui/ai` — AI chat UI
- `/ui/dictionary` — dictionary
- `/ui/database` — laws database (search)
- `/ui/database/results`, `/ui/database/read` — results and document view
- `/ui/account` — account
- `/ui/auth/*` — login/register/reset
- `/ui/trainer/*` — trainer (quizzes and results)

### Project Structure (highlights)
```
lawbot/
  public/
    codes/             # HTML/JSON law texts used by Database pages
  src/
    lib/
      templates.js     # Document templates and formatting
      docxGen.js       # .docx generation using docx library
      generatedStore.js# Local storage for generated files
      theme.js         # Theme management (light/dark)
    pages/
      landing/         # Landing components and utilities
      ...              # AIChat, Templates, Calculators, Database, Trainer, etc.
```

### Document generation (.docx)
- Templates and fields are defined in `src/lib/templates.js`.
- Text rendering from answers — `formatTemplate()`.
- Export to `.docx` — `src/lib/docxGen.js` (`generateDocxFile`).
- Persist generated items — `src/lib/generatedStore.js` (localStorage).

To add a new template:
1) Add a category to `TEMPLATE_CATEGORIES`.
2) Add an entry in `TEMPLATES` with `fields` and `body` (placeholders `{key}`).

### Laws database
`public/codes/` contains HTML/JSON acts (e.g., `1618-15.*`). Database pages read from here for search/rendering. Add new files to the same directory as needed.

### AI chat (UI)
`src/pages/AIChat.jsx` renders the chat UI and safely displays Markdown answers (marked + DOMPurify). Backend/model integration is not part of this repo and can be wired to any server.

### Styles and theme
The landing uses custom CSS variables and Tailwind utilities. Theme toggling and variables are in `src/lib/theme.js` and landing components.

### Build & Deploy
```bash
npm run build
npm run preview
```
Serve `dist/` on any static hosting (Nginx, Vercel, Netlify, GitHub Pages, etc.).


