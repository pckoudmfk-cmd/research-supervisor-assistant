# Цифровой помощник научного руководителя

Веб-приложение для автоматизации работы научного руководителя: генерация тем, составление планов исследований и подбор литературы с помощью AI.

## Стек

- **Frontend**: React 19 + TypeScript + Vite + Zustand + React Router
- **Backend**: FastAPI (Python) + OpenAI API

## Модули

| № | Модуль | Описание |
|---|--------|----------|
| 1 | Ввод темы КТП | Ввод предметной области текстом или загрузка файла |
| 2 | Формулировка темы AI | Просмотр и редактирование академической формулировки |
| 3 | План исследования | Автогенерация структуры работы |
| 4 | Поиск литературы | Подбор источников по ГОСТ 7.0.5-2008 |

## Типы работ

Статья · Тезисы · Курсовая · ВКР · Практический проект

## Уровни

СПО · ВУЗ

## Темы оформления

Тёмная · Светлая · Золотая

## Запуск

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # добавьте OPENAI_API_KEY
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Приложение: http://localhost:5173  
API docs: http://localhost:8000/docs
