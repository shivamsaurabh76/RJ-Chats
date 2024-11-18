# RJ-Chats

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Real-Time Communication](#real-time-communication)
- [Authentication](#authentication)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

## Introduction

This is a full-stack real-time chat application built using the **MERN** (MongoDB, Express.js, React.js, Node.js) stack. The app allows users to create accounts, join chat rooms, and communicate with others in real-time. It features a responsive UI, user authentication, and real-time message updates.

## Features

- **User Authentication**: Register, login, and manage user profiles
- **Real-time Messaging**: Instant message delivery using Socket.io
- **Chat Rooms**: Create and join multiple chat rooms
- **Private Messaging**: One-on-one chat functionality
- **Profile Management**: Update profile info and upload avatars
- **Responsive Design**: Mobile-friendly UI using **Chakra UI**
- **Typing Indicators**: See when others are typing
- **Notifications**: Get notified of new messages
- **Rich Media**: Support for emojis and file sharing
- **Google Sign-In**: Sign up and sign in with Google using OAuth
- **Mobile Number OTP Verification**: Verify mobile numbers using Twilio

## Technologies Used

### Frontend
- **React.js**: UI library
- **Chakra UI**: For styling and responsive design
- **Socket.io-client**: Real-time communication
- **Axios**: HTTP requests
- **React Router**: Navigation
- **React Lottie**: Animations

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **MongoDB**: Database
- **Mongoose**: ODM for MongoDB
- **Socket.io**: Real-time functionality
- **JSON Web Tokens (JWT)**: Authentication
- **Bcrypt.js**: Password hashing
- **OAuth**: Google Sign-In integration
- **Twilio**: Mobile number OTP verification

### Other Tools
- **Cloudinary**: Image upload and storage
- **MongoDB Atlas**: Database hosting

## Getting Started

### Prerequisites

- **Node.js** (v14 or later)
- **npm**
- **MongoDB Atlas** account

### Author

Developed with ❤️ by [Shivam Saurabh](https://github.com/shivamsaurabh76)

### Installation

1. Clone the repository
```bash
   git clone https://github.com/shivamsaurabh76/RJ-Chats.git
   cd RJ-Chats
Install backend dependencies

```bash
cd backend
npm install
Install frontend dependencies

```bash
cd ../frontend
npm install
Set up environment variables
Create a .env file in the backend directory with the following:

```bash
PORT=5000
MONGO_URI=mongodb+srv://sskvntpc11:Shiv%40m17@rj-chats.12vid.mongodb.net/?retryWrites=true&w=majority
Start the backend server

```bash
cd backend
npm run start
Start the frontend development server

```bash
cd frontend
npm start
The app should now be running on http://localhost:3000

Usage
Register a new account or login with existing credentials.
Create a new chat room or join an existing one.
Start sending and receiving messages in real-time.
Update your profile and upload an avatar.
API Endpoints
POST /api/user/register - Register a new user
POST /api/user/login - Login user
GET /api/user - Get user profile
PUT /api/user - Update user profile
GET /api/chat - Get user chats
POST /api/chat - Create a new chat
GET /api/messages/:chatId - Get messages for a specific chat
POST /api/messages - Send a new message
Project Structure
Frontend
Auth: User registration and login
Chat: Main chat interface
UserProfile: Profile management
Sidebar: Navigation and chat list
MessageList: Displays chat messages
MessageInput: Input for sending messages
Backend
Models: User, Chat, and Message schemas
Controllers: Business logic for API endpoints
Routes: API route definitions
Middleware: Authentication and error handling
Config: Database and app configuration
Real-Time Communication
Socket.io handles real-time events such as:

New messages
Typing indicators
User online/offline status
Authentication
JSON Web Tokens (JWT) are used for user authentication, sent with each request to authenticate the user.

Deployment
This app can be deployed to platforms like Heroku, DigitalOcean, or AWS. Ensure all environment variables are properly set on your hosting platform.

Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

License
This project is licensed under the MIT License.
