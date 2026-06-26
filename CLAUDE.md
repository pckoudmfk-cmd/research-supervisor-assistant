# Research Supervisor Assistant — Claude Code Rules

## Project Overview

**VS Production** — AI-driven education platform. Web service: КТП → Тема → План → Литература → Итоговый документ.

- **Frontend:** React 19 + TypeScript + Vite → GitHub Pages (`/research-supervisor-assistant/`)
- **Backend:** FastAPI + Python → Vercel (free tier)
- **AI:** Google Gemini 2.0 Flash (free tier, user supplies key via env var)
- **State:** Zustand with localStorage persistence (key: `rsa-v2`)

---

## Design System

### Themes

Three themes set via `data-theme` attribute on `<html>`. Switched in `Header.tsx`, persisted via Zustand.

| Theme | Trigger |
|-------|---------|
| `dark` | default (glowing blue) |
| `light` | user toggle |
| `gold` | user toggle (gold + glowing sky-blue) |

**Token file:** `frontend/src/styles/themes.css`

### Color Tokens (CSS Custom Properties)

All components reference these — never hardcode hex values.

```css
/* Core surfaces */
--bg-primary      /* page background */
--bg-secondary    /* input fields, dropzones */
--bg-card         /* card backgrounds */
--bg-hover        /* hover state fills */
--border          /* all borders */

/* Typography */
--text-primary    /* headings, body */
--text-secondary  /* labels, subtitles */
--text-muted      /* disabled, meta */

/* Accent (blue in dark/light, sky-blue in gold) */
--accent          /* buttons, active states, links */
--accent-hover    /* button hover */
--accent-light    /* selected item backgrounds */

/* Semantic */
--success  --warning  --error

/* Effects */
--shadow          /* card box-shadow */
--glow            /* glowing blue effect on active elements */
--radius          /* 12px — all border-radius */
```

### Dark Theme Palette (Primary)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#070912` | Page bg |
| `--bg-card` | `#101527` | Cards |
| `--accent` | `#3d8ef8` | Buttons, active |
| `--text-primary` | `#dce8ff` | Headings |
| `--text-secondary` | `#6b8ccc` | Body |
| `--glow` | `0 0 18px rgba(61,142,248,0.35)` | Active elements |

### Gold Theme Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#090701` | Page bg |
| `--bg-card` | `#17120a` | Cards |
| `--text-primary` | `#fef3d0` | Warm cream |
| `--text-secondary` | `#c49a2a` | Gold tone |
| `--accent` | `#38bdf8` | Sky blue (contrast with gold) |

---

## Typography

No webfonts — system geometric sans stack:

```css
font-family: 'Futura', 'Century Gothic', 'Trebuchet MS', system-ui, sans-serif;
```

### Type Scale

| Role | Size | Weight | Notes |
|------|------|--------|-------|
| Page title | 26px | 800 | `letter-spacing: -0.02em` |
| Card title | 17px | 700 | `letter-spacing: -0.01em` |
| Body | 14px | 400 | `line-height: 1.6–1.7` |
| Label/meta | 11–12px | 600–700 | `text-transform: uppercase; letter-spacing: 0.05–0.1em` |
| Button | 14px | 600 | `letter-spacing: 0.01em` |

---

## Component Architecture

**Styling:** CSS Modules (`.module.css` per component). All class names are local.

**Utility:** `clsx` for conditional class merging.

### UI Components — `frontend/src/components/ui/`

| Component | Props |
|-----------|-------|
| `Button` | `variant: primary\|secondary\|ghost`, `size: sm\|md\|lg`, `loading: boolean` |
| `Card` | `title?: string`, `subtitle?: string`, `className?: string` |
| `Select` | `label?: string`, `options: {value, label}[]` |
| `Textarea` | `label?: string` + all textarea attrs |

**Button pattern:**
```tsx
<Button variant="primary" size="md" loading={isLoading} onClick={handler}>
  <IconName size={16} /> Label
</Button>
```

**Card pattern:**
```tsx
<Card title="Заголовок" subtitle="Подзаголовок">
  {/* content */}
</Card>
```

### Layout Components — `frontend/src/components/layout/`

- `Layout` — wraps all pages: `<Header /> + <Sidebar /> + <main>`
- `Header` — sticky top bar, brand + 3 theme toggle buttons
- `Sidebar` — 220px left nav, 5 steps with `NavLink` active states

**Sidebar nav items:**
```
1 → /           Загрузка КТП
2 → /topic      Тема и новизна
3 → /plan       План работы
4 → /literature Литература
5 → /summary    Итоговый документ
```

---

## Icon System

Library: **lucide-react** (`^1.21.0`)

```tsx
import { Wand2, ArrowRight, CheckCircle2 } from 'lucide-react';
// Usage:
<Wand2 size={16} />
```

Standard sizes: `14` (badge/label), `16` (inline button), `22–28` (card icons).

Icons used per page:

| Page | Icons |
|------|-------|
| KtpPage | Upload, Wand2, ArrowRight, CheckCircle2, FileText, BookOpen, GraduationCap, Briefcase, Newspaper |
| TopicPage | Wand2, ArrowRight, Edit3, Check |
| PlanPage | Wand2, ArrowRight, Target, ListTodo, Tag, BookOpen |
| LiteraturePage | Wand2, ArrowRight, Copy, Check, Globe, BookOpen, ExternalLink |
| SummaryPage | Copy, Check, Download, FileText |

---

## State Management

**Store:** `frontend/src/store/appStore.ts` — Zustand with `persist` middleware.

Persisted fields (localStorage `rsa-v2`): `theme`, `workType`, `level`

### Store Shape

```typescript
// Step 1 — КТП
ktpText: string
ktpTopics: string[]
selectedKtpTopic: string

// Step 2 — Тема
workType: WorkType     // 'article'|'thesis'|'coursework'|'vkr'|'practical'
level: Level           // 'spo'|'vuz'
direction: string      // направление подготовки
subjectArea: string    // дисциплина
topicFormulation: string
relevance: string
novelty: string

// Step 3 — План
goal: string
objectives: string[]
keywords: string[]
chapters: Chapter[]    // { number, title, description }

// Step 4 — Литература
literature: LiteratureSource[]  // { title, authors[], year, source, doi, url, language }

// Loading flags
loadingKtp / loadingFormulation / loadingPlan / loadingLiterature: boolean
```

---

## API Layer

**File:** `frontend/src/utils/api.ts`
**Base URL:** `import.meta.env.VITE_API_URL` (GitHub Secret) → Vercel backend

| Endpoint | Function | Input | Output |
|----------|----------|-------|--------|
| `POST /api/ktp/parse` | `parseKtp(text)` | `{text}` | `string[]` |
| `POST /api/ktp/parse-file` | `parseKtpFile(file)` | FormData | `string[]` |
| `POST /api/formulation/generate` | `generateFormulation(...)` | ktp_topic, work_type, level, direction, subject_area | `{topic, relevance, novelty}` |
| `POST /api/plan/generate` | `generatePlan(topic, work_type, level)` | — | `{goal, objectives[], keywords[], chapters[]}` |
| `POST /api/literature/search` | `searchLiterature(topic, count)` | — | `LiteratureSource[]` |

---

## Brand Identity

**Brand name:** VS Production
**Tagline:** *When artificial and natural intelligence meet*

### Logo Concept

The VS mark: geometric V and S letterforms connected by a single horizontal **glowing blue wire** with three circuit nodes at intersection points. No outer container — the letterforms stand alone.

### Brand Colors

| Name | Hex | Role |
|------|-----|------|
| Ink | `#05080f` | Primary background |
| Azure | `#2d7ff9` | Primary accent / glow |
| Sky | `#7ab8ff` | Gradient highlight |
| Gold | `#c8992a` | Warm accent (gold theme) |
| Paper | `#ddeaff` | Body text |
| Slate | `#3d5a7a` | Secondary text |

### Typography for Brand

- **VS** — 800 weight, geometric sans, gradient azure→sky, `filter: drop-shadow` glow
- **PRODUCTION** — 300 weight, wide letter-spacing (0.34em), uppercase
- **Tagline** — 300 weight, italic, muted slate

---

## Figma Integration Notes

### Token Mapping

CSS custom properties map directly to Figma variables:

```
CSS token          → Figma variable group
--bg-*             → Color/Background/*
--text-*           → Color/Text/*
--accent*          → Color/Accent/*
--border           → Color/Border
--radius           → Number/Radius
--shadow           → Effect/Shadow
--glow             → Effect/Glow
```

Use three Figma **mode collections**: `Dark`, `Light`, `Gold`

### Component Equivalents in Figma

| Code component | Figma component |
|---------------|-----------------|
| `Button/primary` | Frame, `--accent` fill, white text, 12px radius, glow effect |
| `Button/secondary` | Frame, `--bg-card` fill, `--border` stroke |
| `Button/ghost` | Frame, transparent fill, `--accent` text |
| `Card` | Frame, `--bg-card` fill, `--border` stroke 1px, `--shadow` effect, 12px radius |
| `Sidebar item active` | Frame, `--accent` fill, white text, glow shadow |

### Glow Effect (Dark/Gold themes only)

Figma Drop Shadow config for `--glow`:
- Dark: Color `#3d8ef8` @ 35% opacity, blur 18px + second shadow @ 12% opacity, blur 48px
- Gold: Color `#38bdf8` @ 40% opacity, blur 18px + second shadow @ 15% opacity, blur 48px

---

## Project File Structure

```
research-supervisor-assistant/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/      # Header, Sidebar, Layout + .module.css
│   │   │   └── ui/          # Button, Card, Select, Textarea + .module.css
│   │   ├── pages/           # KtpPage, TopicPage, PlanPage, LiteraturePage, SummaryPage
│   │   ├── store/           # appStore.ts (Zustand)
│   │   ├── styles/          # themes.css (CSS custom properties)
│   │   ├── types/           # index.ts (WorkType, Level, Chapter, LiteratureSource)
│   │   ├── utils/           # api.ts (axios)
│   │   ├── App.tsx          # BrowserRouter, basename="/research-supervisor-assistant"
│   │   ├── main.tsx
│   │   └── index.css        # global reset, body, scrollbar
│   ├── index.html           # data-theme="dark" default
│   └── vite.config.ts       # base: '/research-supervisor-assistant/'
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI routers
│   │   ├── services/        # ai_service.py, literature_service.py
│   │   ├── models/          # schemas.py
│   │   └── prompts/         # templates.py
│   └── vercel.json
└── .github/
    └── workflows/
        └── deploy.yml       # builds frontend → GitHub Pages
```

---

## Dev Commands

```bash
# Frontend dev
cd frontend && npm run dev

# Frontend build
cd frontend && npm run build

# Backend dev
cd backend && uvicorn app.main:app --reload

# Deploy (auto on push to main)
git push origin main
```

## Environment Variables

| Variable | Where | Value |
|----------|-------|-------|
| `VITE_API_URL` | GitHub Secret → Actions | Vercel backend URL |
| `GEMINI_API_KEY` | Vercel Environment | Google AI Studio key |
| `AI_PROVIDER` | Vercel Environment | `gemini` (default) |
