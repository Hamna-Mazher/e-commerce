const dotenv = require("dotenv");
const connectDB = require("../config/db");
const User = require("../models/User");
const Task = require("../models/Task");

dotenv.config();

const testConnection = async () => {
  try {
    await connectDB();

    // Create a test user
    const user = await User.create({
      name: "Hamna",
      email: "hamna@example.com",
      passwordHash: "dummyHash123",
      role: "User",
    });

    // Create a test task
    const task = await Task.create({
      title: "Learn Mongoose",
      description: "Testing MongoDB connection",
      status: "Todo",
      priority: "High",
      createdBy: user._id,
    });

    console.log("✅ User Created:");
    console.log(user);

    console.log("\n✅ Task Created:");
    console.log(task);

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

testConnection();