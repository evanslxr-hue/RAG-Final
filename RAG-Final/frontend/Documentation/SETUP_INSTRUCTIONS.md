# SETUP_INSTRUCTIONS

## 1) Install dependencies
```bash
cd RAG-Final/frontend
npm install
```

## 2) Configure backend URL
```bash
cp .env.example .env
```
Default value:
`VITE_API_URL=http://localhost:8000`

## 3) Run development server
```bash
npm run dev
```
Server starts on `http://localhost:5173`.

## 4) Backend compatibility
Ensure FastAPI backend is running and CORS allows `http://localhost:5173`.

## Troubleshooting
- **CORS errors**: confirm backend allows origin `http://localhost:5173`.
- **Network errors**: verify backend URL in `.env` and API availability.
- **Blank page**: check browser console and restart `npm run dev`.
