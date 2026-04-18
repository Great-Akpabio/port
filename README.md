# Portfolio Website & Admin Dashboard

A modern, responsive portfolio website with an admin dashboard for content management.

## Tech Stack

- **Frontend**: React 18 + Vite + React Router
- **Backend**: Node.js + Express
- **Database**: SQLite (file-based, no setup required)

## Getting Started

### Prerequisites

- Node.js 18+

### 1. Backend Setup

```bash
cd server
npm install
```

Start the backend server:
```bash
npm run dev
```

The database file `portfolio.db` will be created automatically.

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

### 3. Access the Application

- **Public Portfolio**: http://localhost:5173
- **Admin Dashboard**: http://localhost:5173/admin
- **Login**: http://localhost:5173/admin/login

### 4. Create Admin User

Since there's no registration UI (single admin), use curl or Postman:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"yourpassword","name":"Admin"}'
```

## Features

### Public Portfolio
- Home (hero section)
- About (bio, skills, experience)
- Portfolio (project grid)
- Contact (form + contact info)

### Admin Dashboard
- Login/Logout
- Manage Projects (CRUD)
- Manage Profile/Settings
- View/Manage Messages

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register admin |
| POST | /api/auth/login | Login |
| GET | /api/projects | List projects |
| POST | /api/projects | Create project (auth) |
| GET | /api/profile | Get profile |
| PUT | /api/profile | Update profile (auth) |
| GET | /api/messages | List messages (auth) |
| POST | /api/messages | Submit contact form |# port
