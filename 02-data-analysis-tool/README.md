# Data Analysis Tool

Web application for analyzing CSV data with natural language.

## Version
- Python: 3.13
- Node.js: 18+
- React: 18
- FastAPI: Latest
- OpenAI: gpt-4o-mini
- Tailwind CSS: v4

## Project Structure
```
02-data-analysis-tool/
├── backend/
│   ├── main.py              # FastAPI backend
│   ├── movies.csv           # Sample data
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # API keys (not in git)
│   └── venv/
└── frontend/
    ├── src/
    │   ├── App.jsx          # React main component
    │   └── index.css        # Tailwind config
    ├── package.json
    └── vite.config.js
```

## How to Run

### Backend
```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
# OPENAI_API_KEY=your_key_here

# Run server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

- Backend: http://localhost:8000
- Frontend: http://localhost:5173

## Warning
⚠️ Educational project. Do not use in production - executes LLM-generated code directly.
