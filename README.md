# Learnify AI

An AI-powered study assistant that turns your documents into an interactive learning space. Upload study material, then chat with it, summarize it, and generate flashcards, all powered by the Google Gemini API.

Built with the MERN stack as a group project at Gandaki University.

---

## Features

- **Document library**: upload and manage your study documents in one place
- **AI study assistant**: ask questions about a document and get answers grounded in its content
- **AI-generated flashcards**: create, review, and manage flashcards from your material
- **Document detail view**: tabbed workspace for each document (content, chat, flashcards, and more)
- **User accounts**: each user only sees their own documents and data
- **Responsive UI**: clean, calm blue-green interface built with Tailwind CSS

> Edit this list to match exactly what your final build ships.

---

## Tech Stack

| Layer      | Technology                                  |
| ---------- | ------------------------------------------- |
| Frontend   | React (Vite), Tailwind CSS                  |
| Backend    | Node.js, Express                            |
| Database   | MongoDB with Mongoose                       |
| AI         | Google Gemini API (`gemini-flash-latest`)   |

---

## Project Structure

```
learnify-ai/
├── backend/
│   ├── controllers/     # Route logic
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── middleware/      # Auth, error handling
│   ├── server.js        # Entry point
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI (Modal, FlashcardManager, ...)
│   │   ├── pages/       # DocumentListPage, DocumentDetailPage, ...
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── .env
└── README.md
```

> Adjust folder names to match your repository.

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- A MongoDB database (local or MongoDB Atlas)
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/learnify-ai.git
cd learnify-ai
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

Start the server:

```bash
npm run dev
```

### 3. Set up the frontend

```bash
cd frontend
npm install
```

Create `frontend/.env` (Vite requires the `VITE_` prefix):

```env
VITE_API_URL=http://localhost:5000
```

Start the app:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

| Variable          | Location | Description                               |
| ----------------- | -------- | ----------------------------------------- |
| `PORT`            | backend  | Port the Express server runs on           |
| `MONGO_URI`       | backend  | MongoDB connection string                 |
| `JWT_SECRET`      | backend  | Secret used to sign auth tokens           |
| `GEMINI_API_KEY`  | backend  | Google Gemini API key                     |
| `VITE_API_URL`    | frontend | Base URL of the backend API               |

---

## Troubleshooting

- **Gemini model not found / deprecated**: use `gemini-flash-latest` as the model name rather than a pinned version.
- **Request timeouts on Node 17+ (IPv6 issues)**: add `dns.setDefaultResultOrder('ipv4first')` near the top of `server.js`.
- **`import.meta.env` is undefined or API calls fail**: make sure frontend variables are prefixed with `VITE_` and restart the dev server after editing `.env`.
- **Mongoose errors in the browser bundle**: Mongoose is a backend-only dependency and must not be imported in frontend code.

---

## Roadmap

- [ ] Lazy-render tab content in the document detail page
- [ ] Move all modals to the shared `Modal` component
- [ ] Centralize the color palette in `tailwind.config.js`
- [ ] Add more study modes (quizzes, summaries)

---

## Team

| Name   | Role                    |
| ------ | ----------------------- |
| Sampada| Frontend / Full-stack   |
| _Name_ | _Role_                  |
| _Name_ | _Role_                  |

---


## Acknowledgements

- [Google Gemini API](https://ai.google.dev/)
- Gandaki University, BIT program
