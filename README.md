# NeuroALS — Fullstack Project

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + React Hook Form + Axios
- **Backend**: Node.js + Express + TypeScript + MongoDB (Mongoose) + JWT + bcrypt

## Project Structure
```
neuroals/
├── frontend/          # React + TypeScript
│   └── src/
│       ├── components/
│       │   ├── ui/         # Reusable UI atoms (Button, Input, etc.)
│       │   ├── auth/       # Auth-specific components
│       │   └── layout/     # Navbar, Sidebar, etc.
│       ├── pages/          # Landing, Login, Signup, Dashboard
│       ├── hooks/          # Custom React hooks
│       ├── services/       # Axios API calls
│       ├── types/          # TypeScript interfaces
│       ├── utils/          # Helper functions
│       └── context/        # AuthContext (global state)
│
└── backend/           # Express + TypeScript
    └── src/
        ├── controllers/    # Route logic (authController)
        ├── models/         # Mongoose schemas (User)
        ├── routes/         # Express routers
        ├── middleware/      # JWT auth guard, error handler
        ├── config/         # DB connection, env config
        ├── types/          # Express + custom types
        └── utils/          # JWT helpers, response formatter
```

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL
npm run dev
```

## Environment Variables

### Backend `.env`
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/neuroals
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:5000/api
```
