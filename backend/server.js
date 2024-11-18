const express = require("express");
const app = express();
const dotenv = require("dotenv");
const path = require("path");
const colors = require("colors");
const cors = require("cors");
const morgan = require("morgan");

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { googleAuth } = require("./controllers/googleAuthController"); // Import the googleAuth controller
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { handleOnlineStatus } = require("./controllers/onlineStatus");

// Connect to MongoDB
connectDB();

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'development' 
    ? ['http://localhost:3000'] 
    : ['your-production-domain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log environment variables status
console.log('Environment Variables Status:'.cyan.bold);
console.log('PORT:', process.env.PORT ? '✓'.green : '×'.red);
console.log('MONGO_URI:', process.env.MONGO_URI ? '✓'.green : '×'.red);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓'.green : '×'.red);
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✓'.green : '×'.red);
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '✓'.green : '×'.red);
console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER ? '✓'.green : '×'.red);

// API routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.post("/api/user/google-auth", googleAuth); // Add the googleAuth route

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working" });
});

// Serve static files in production
const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));
  app.get("*", (req, res) => 
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}...`.yellow.bold);
});

// Socket.io configuration
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.NODE_ENV === 'development' 
      ? "http://localhost:3000" 
      : "your-production-domain.com",
  },
});

// Socket event handlers
io.on("connection", (socket) => {
  console.log("Connected to socket.io".cyan.bold);
  
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
    handleOnlineStatus(io, userData._id, true);
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED".red.bold);
    handleOnlineStatus(io, socket.id, false);
  });
});