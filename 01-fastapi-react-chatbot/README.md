# FastAPI + React Chatbot

Simple AI chatbot application.

## Version
- Python: 3.11+
- Node.js: 18+
- React: 18
- FastAPI: Latest
- OpenAI: gpt-4o-mini

## Project Structure
```
01-fastapi-react-chatbot/
├── main.py              # FastAPI backend
├── requirements.txt     # Python dependencies
├── .env                 # API keys (not in git)
├── venv/
└── client/             # React frontend
    ├── src/
    ├── package.json
    └── vite.config.js
```

## How to Run

### Backend
```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
# OPENAI_API_KEY=your_key_here

# Run server
uvicorn main:app --reload
```

### Frontend
```bash
cd client
npm install
npm run dev
```

- Backend: http://127.0.0.1:8000
- Frontend: http://localhost:5173
