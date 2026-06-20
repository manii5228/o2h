# Project Management Portal & Task Tracker

A professional, feature-rich Project Management Portal and Task Tracker built with a **Node.js (Express) + MySQL** backend and a **Vite + React** frontend. It features Role-Based Access Control (RBAC), milestone tracking, interactive Gantt and Kanban views, timesheet logs with PM approval, bug tracking, resource heatmaps, and customizable settings/automations.

---

## Technical Stack
- **Frontend**: React (Vite), React Router v7, Axios, CSS (Vanilla Custom Design System)
- **Backend**: Node.js, Express, MySQL (mysql2/promise), JWT Authentication, BcryptJS
- **Database**: MySQL 8.0

---

## Core Features
1. **Dashboard**: Personalized widgets for PMs and Contributors showing key performance statistics, active tasks, budget metrics, and recent activities.
2. **Project & Milestone Tracking**: Create projects, assign budgets, define milestones, and track progress metrics.
3. **Task Board (Kanban, List, Calendar, Gantt)**:
   - Drag-and-drop Kanban workflow.
   - Month-by-month interactive calendar.
   - Visual Gantt chart timeline mapping task durations.
4. **Time & Timesheet Tracker**: Built-in stopwatch timer, manual time logging, and a manager approval/rejection queue.
5. **Issue & Bug Tracker**: Report bugs with environment details, reproduction steps, severity levels, and resolution states.
6. **Reports Builder**: View project status, overdue tasks, or timesheets and export them immediately to CSV.
7. **Team Heatmap Directory**: Monitor active workloads per employee (Green/Amber/Red) to manage resource allocation.
8. **Settings & Customization**: Update user profiles, toggle dark mode, customize custom fields, set automation rules, and toggle integrations (Slack, GitHub, Google Drive).

---

## Setup & Installation

### 1. Database Setup
1. Ensure a local MySQL server is running.
2. Configure credentials in `backend/.env` (default is user: `root` and DB: `o2h_project_tracker`).
3. The server will automatically create the database and tables on startup using `backend/config/schema.sql`.

### 2. Backend Installation & Run
```bash
cd backend
npm install
npm start
```
The server will run on `http://localhost:5000`.

### 3. Frontend Installation & Run
```bash
cd frontend
npm install
npm run dev
```
The frontend dev server will run on `http://localhost:5173`.

---

## Folder Structure
```text
o2h/
├── backend/
│   ├── config/       # Database pool config and schema.sql
│   ├── controllers/  # API route controllers
│   ├── middleware/   # JWT and route protection middleware
│   ├── models/       # Database query models
│   ├── routes/       # Express router paths
│   ├── server.js     # Server entry point
│   └── .env          # Server environment settings
└── frontend/
    ├── src/
    │   ├── components/  # Layout and shared common components
    │   ├── context/     # Auth and Theme state management
    │   ├── pages/       # Login, Register, Dashboard, Projects, Tasks, Time, Bugs, Reports, Team, Settings
    │   ├── services/    # Axios interceptor instance
    │   ├── App.jsx      # React router routing configurations
    │   └── index.css    # Premium CSS design tokens & animations
    └── package.json
```
