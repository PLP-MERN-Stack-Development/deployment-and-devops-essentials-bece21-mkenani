# 🚀 MERN Todo App - Live Demo

## 📱 Live URLs

- **Frontend**: https://mern-todo-app.vercel.app
- **Backend API**: https://mern-todo-backend.onrender.com
- **Health Check**: https://mern-todo-backend.onrender.com/api/health

## 🛠️ Tech Stack

- **Frontend**: React, Vite
- **Backend**: Express.js, Node.js  
- **Database**: MongoDB Atlas
- **Deployment**: 
  - Backend: Render
  - Frontend: Vercel

## 🚀 Features

- ✅ Add, edit, delete todos
- ✅ Mark todos as complete/incomplete
- ✅ Real-time updates
- ✅ Responsive design
- ✅ MongoDB Atlas cloud database

##  folder structure
```
mern-todo-deploy/
├── .github/                      # Configuration for GitHub Actions (Task 4)
│   └── workflows/
│       ├── client-ci.yml         # Workflow to build/check React code
│       └── server-ci.yml         # Workflow to install/check Node code
|
├── client/                       # React Frontend (Deployed to Vercel)
│   ├── .env                      # Local environment variables (VITE_API_URL)
│   ├── package.json              # Client dependencies and scripts (build)
│   ├── package-lock.json
│   ├── public/
│   ├── src/                      # Source code
│   │   └── App.jsx               # Contains CRUD functions and UI
│   └── index.html
|
├── server/                       # Express Backend (Deployed to Render)
│   ├── .env                      # Local environment variables (MONGO_URI)
│   ├── index.js                  # Main server file (contains routes, connection, and middleware)
│   ├── package.json              # Server dependencies and scripts (start, dev) <-- NEWLY UPDATED
│   └── package-lock.json
|
├── .gitignore                    # Ensures 'node_modules', '.env', and 'dist/build' are ignored
├── README.md                     # Deployment Documentation (Task 5)
└── package.json                  # Root package file (optional for shared scripts/linting)
```