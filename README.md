Deployed at https://library-management-system-lmib.vercel.app/
# Library Management System

A full-stack web application designed to manage library operations, including book and movie inventories, membership management, and issue/return transactions with fine calculation. Built using the MERN stack (MongoDB, Express, React, Node.js).

## Features

### Administrative Functions
- **Resource Management:** Add, update, and remove Books and Movies.
- **Membership Management:** Register new members, renew memberships (6 months, 1 year, 2 years), and link user accounts.
- **Transactions:** Issue items to members, process returns, and track active issues.
- **Fine System:** Automated fine calculation (₹10.00/day) for overdue items.
- **Reports:** View active issues, overdue returns, and pending requests.
- **User Management:** Create and manage system access credentials.

### User/Member Functions
- **Dashboard:** View personal borrowed items and due dates.
- **Availability:** Search the catalog for available Books and Movies.
- **History:** Track personal return history and fine status.

## Tech Stack

**Frontend**
- React 18 (Vite)
- Tailwind CSS
- React Router DOM
- Google OAuth Integration

**Backend**
- Node.js & Express
- MongoDB (Mongoose ODM)
- JWT Authentication
- Google Auth Library

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas connection string or local MongoDB instance

## Installation & Setup

### 1. Backend Setup

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
````

Create a `.env` file in the `server` directory (see `.env.example`).

Start the development server:

```bash
npm run dev
```

*The server runs on port 9990 by default.*

**Database Seeding:**
On the first run, the system will automatically seed the database with an Admin account and sample data if the collections are empty.

### 2\. Frontend Setup

Navigate to the client directory and install dependencies:

```bash
cd client
npm install
```

Create a `.env` file in the `client` directory (see `.env.example`).

Start the application:

```bash
npm run dev
```

*The client runs on port 3000 by default.*

## Default Credentials

If the database is seeded automatically, use the following credentials to log in as an administrator:

  - **Username:** `admin`
  - **Password:** `admin_techno`

## API Endpoints Overview

  - **Auth:** `/api/auth` (Login, Register, Google Auth)
  - **Books:** `/api/books` (CRUD, Search)
  - **Movies:** `/api/movies` (CRUD)
  - **Members:** `/api/members` (CRUD, Membership logic)
  - **Transactions:** `/api/transactions` (Issue, Return, Pay Fine)
  - **Reports:** `/api/transactions/active`, `/api/transactions/overdue`

## Deployment

The project is configured for deployment on Vercel.

  - The `client` directory contains the frontend build configuration.
  - The `server` directory contains a `vercel.json` for serverless function deployment.