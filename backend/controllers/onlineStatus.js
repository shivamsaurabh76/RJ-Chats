const User = require("../models/userModel");

const handleOnlineStatus = async (io, userId, isOnline) => {
  try {
    await User.findByIdAndUpdate(userId, { isOnline });
    io.emit("user status", { userId, isOnline });
  } catch (error) {
    console.error("Error updating online status:", error);
  }
};

module.exports = { handleOnlineStatus };