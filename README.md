# Eventization - Event Management System

Eventization is a full-stack event management system built with Node.js, Express, MongoDB for the backend, and React with Vite for the frontend. It includes features like event creation, registration, reviews, chatbot integration, and attendance prediction using machine learning.

## Prerequisites

Before running the project, ensure you have the following installed:

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)
- **MongoDB** (running locally or a cloud instance like MongoDB Atlas)

## Installation

1. **Clone or navigate to the project directory:**
   ```
   cd /path/to/Eventization
   ```

2. **Install backend dependencies:**
   ```
   cd backend
   npm install
   ```

3. **Install frontend dependencies:**
   ```
   cd ../frontend
   npm install
   ```

## Environment Setup

The backend uses environment variables for configuration. A `.env` file is optional as defaults are provided in `src/config/env.js`. If you need to customize settings (e.g., database URL, JWT secret), create a `.env` file in the `backend` directory with the following variables:

```
NODE_ENV=development
PORT=5050
MONGO_URI=mongodb://localhost:27017/eventization
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=no-reply@ems.local
```

Ensure MongoDB is running on your system or update `MONGO_URI` to point to your MongoDB instance.

## Running the Project

1. **Start the backend server:**
   ```
   cd backend
   npm run dev
   ```
   This starts the server in development mode with nodemon for auto-reloading. The backend will run on `http://localhost:5050`.

2. **Start the frontend development server:**
   ```
   cd frontend
   npm run dev
   ```
   This starts the Vite development server. The frontend will run on `http://localhost:5173`.

3. **(Optional) Seed the database:**
   If you want to populate the database with sample data, run:
   ```
   cd backend
   npm run seed
   ```

## Building for Production

To build the frontend for production:

```
cd frontend
npm run build
npm run preview
```

For the backend, use:

```
cd backend
npm start
```

## Features

- User authentication and authorization
- Event creation and management
- User registration for events
- Review system
- Chatbot integration
- Attendance prediction using machine learning
- QR code generation for tickets
- Admin dashboard with statistics




## API Documentation

The backend provides RESTful APIs. Refer to the routes in `backend/src/routes/` for available endpoints.

## Technologies Used

- **Backend:** Node.js, Express.js, MongoDB, Mongoose, Socket.io, TensorFlow.js
- **Frontend:** React, Vite, Tailwind CSS, Axios
- **Authentication:** JWT
- **File Upload:** Multer

## Team Members


- Mrigendra Kumar 2210991941 (Team Lead)
- Abhay Sharma 2210990028
- Sonu Kumar 2210992399
- Kumar Saurav 2210991823

## Mentor


Dr.Shikha Tuteja

## Note


This project is developed as part of an academic project(Chitkara University).