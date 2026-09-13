# FrFr — CSS Grid Генератор

Визуальный генератор CSS Grid: выделяйте области мышкой, настраивайте сетку и получайте готовый CSS- и HTML-код. Задача — рабочий layout за несколько секунд, без глубокого погружения в CSS Grid.

## Демо

Приложение задеплоено на Vercel: **[frfr-grid.vercel.app](https://frfr-grid.vercel.app/)**

Откройте ссылку, выделите клетки сетки мышкой — и готовый CSS-код сразу появится в правой панели.

## Возможности

- **Визуальный редактор** — сетка до 12 × 12, выделение областей мышью или касанием (Pointer Events)
- **Grid areas** — создание, переименование, дублирование и удаление областей; быстрое переименование двойным кликом по области
- **Растягивание** областей за круглую ручку с умным ограничением по занятым ячейкам
- **Перетаскивание** областей на свободные места с зелёной/красной индикацией валидности
- **Размеры треков** — `fr`, `px`, `%`, `rem`, `em`, `auto`, `min-content`, `max-content` + пресеты («Равные», `1fr 2fr`, `repeat(n, 1fr)`)
- **Gap** — единое значение или раздельные `column-gap` / `row-gap`, быстрые пресеты
- **Живой код** — генерация CSS и HTML в реальном времени с подсветкой синтаксиса и копированием в один клик
- **Шаблоны** — готовые лейауты: sidebar + content, header/main/footer, дашборд, блог, карточки
- **Предпросмотр** — чистая сетка без служебных подсказок
- **Поделиться** — конфигурация сериализуется в URL
- **Undo / Redo** — история на 100 шагов
- **Автосохранение** текущей сетки в `localStorage`
- **Валидация** — перекрытия, прямоугольность областей, уникальность и корректность имён
- **Тёмная тема** с автоматическим определением по системным настройкам
- **Доступность** — semantic HTML, `aria-label`, фокус-состояния, `prefers-reduced-motion`

## Технологии

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, TypeScript (strict) |
| Стили | Tailwind CSS 4 |
| Иконки | Heroicons |

Без других рантайм-зависимостей: перетаскивание, валидация, сериализация и подсветка реализованы нативно.

## Запуск

```bash
npm install
npm run dev      # dev-сервер на http://localhost:3000
npm run build    # production-сборка
npm start        # запуск production-сервера
```

## Структура проекта

```
app/
  layout.tsx            # метаданные, тема, шрифты
  page.tsx              # единственная страница с генератором
  globals.css           # Tailwind 4, @theme, анимации логотипа
  not-found.tsx         # страница 404
  robots.ts             # /robots.txt
  sitemap.ts            # /sitemap.xml
  manifest.ts           # /manifest.webmanifest (PWA-манифест)
components/grid-generator/
  GridGenerator.tsx     # корневой компонент: состояние и обработчики
  GridEditor.tsx        # интерактивная сетка: выделение, resize, move
  GridSettings.tsx      # панель настроек (колонки, строки, gap, пресеты)
  GridToolbar.tsx       # верхняя панель
  CodePanel.tsx         # вывод CSS/HTML с подсветкой
  AreaEditor.tsx        # контекстные действия выбранной области
  TemplatePicker.tsx    # выбор шаблона
  InstructionsModal.tsx # краткая инструкция
  ShortcutsModal.tsx    # горячие клавиши
  RenameAreaModal.tsx   # переименование области
hooks/
  useGridHistory.ts     # undo / redo
  useGridSelection.ts   # drag selection
  useKeyboardShortcuts.ts
  useLocalStorage.ts
lib/
  generate-css.ts       # чистый генератор CSS
  generate-html.ts      # генератор HTML
  validate-grid.ts      # валидация конфигурации
  serialize-grid.ts     # сериализация в URL и localStorage
  templates.ts          # готовые шаблоны
types/
  grid.ts               # модель данных
scripts/
  generate-seo-images.mjs # генерация favicon/OG-изображений из favicon.svg (sharp)
public/
  favicon.ico, favicon.svg, favicon-16x16.png, favicon-32x32.png
  apple-touch-icon.png, icon-192.png, icon-512.png
  og-image.png          # Open Graph, 1200×630
```

## Горячие клавиши

| Комбинация | Действие |
|---|---|
| `Ctrl/Cmd + Z` | Отменить |
| `Ctrl/Cmd + Shift + Z` | Повторить |
| `Ctrl/Cmd + Y` | Повторить |
| `↑ ↓ ← →` | Сдвинуть выбранную область |
| `Delete` | Удалить выбранную область |
| `Escape` | Снять выделение |
| `?` | Справка по горячим клавишам |

## Модель данных

```ts
type GridConfig = {
  columns: number;            // 1–12
  rows: number;               // 1–12
  columnSizes: GridTrack[];   // { value, unit } | auto | min-content | max-content
  rowSizes: GridTrack[];
  columnGap: string;          // например "16px"
  rowGap: string;
  areas: GridArea[];          // координаты включительные: start..end
  containerClass: string;     // имя класса контейнера в генерируемом коде
};
```

Генерация CSS — чистая функция `generateGridCSS(config)`, независимая от React; сериализация (`serialize-grid.ts`) используется и для share-ссылки (`?config=...`), и для автосохранения.

## Лицензия

MIT
