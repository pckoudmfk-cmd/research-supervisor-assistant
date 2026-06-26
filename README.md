# Цифровой помощник научного руководителя

Веб-приложение для автоматизации работы научного руководителя: генерация тем, составление планов исследований и подбор литературы с помощью AI.

> **Полностью бесплатно.** Поддерживаются три бесплатных AI-провайдера на выбор.

## Стек

- **Frontend**: React 19 + TypeScript + Vite + Zustand + React Router
- **Backend**: FastAPI (Python) + OpenAI-compatible API

## Модули

| № | Модуль | Описание |
|---|--------|----------|
| 1 | Ввод темы КТП | Ввод предметной области текстом или загрузка файла |
| 2 | Формулировка темы AI | Просмотр и редактирование академической формулировки |
| 3 | План исследования | Автогенерация структуры работы |
| 4 | Поиск литературы | Подбор источников по ГОСТ 7.0.5-2008 |

## Типы работ

Статья · Тезисы · Курсовая · ВКР · Практический проект  
Уровни: **СПО** · **ВУЗ**  
Темы: **Тёмная** · **Светлая** · **Золотая**

---

## Бесплатные AI-провайдеры

### Вариант 1 — Groq (рекомендуется)
Облако, бесплатный tier, регистрация без карты, очень быстрый.

1. Зарегистрируйтесь на [console.groq.com](https://console.groq.com)
2. Создайте API Key в разделе **API Keys**
3. В `backend/.env` укажите:
```
AI_PROVIDER=groq
GROQ_API_KEY=gsk_...
```

### Вариант 2 — Ollama (полностью локально)
Запускает модель на вашем компьютере, без интернета и регистраций.

```bash
# Установка (Linux/Mac)
curl https://ollama.com/install.sh | sh

# Загрузка модели (~2GB)
ollama pull llama3.2

# В backend/.env:
# AI_PROVIDER=ollama
```

### Вариант 3 — Google Gemini
Бесплатный tier Google (60 запросов/мин).

1. Получите ключ на [aistudio.google.com](https://aistudio.google.com/apikey)
2. В `backend/.env`:
```
AI_PROVIDER=gemini
GEMINI_API_KEY=AIza...
```

---

## Запуск

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # отредактируйте: добавьте ключ выбранного провайдера
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
