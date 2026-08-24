const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const User = require("../models/User");
const Task = require("../models/Task");

dotenv.config();
console.log(process.env.MONGODB_URI);
const seedDatabase = async () => {
  try {
    await connectDB();
    await User.deleteMany();
await Task.deleteMany();

console.log("🗑️ Existing users and tasks deleted.");
const hashedPassword = await bcrypt.hash("password123", 10);
const users = await User.insertMany([
  {
    name: "Hamna",
    email: "hamna@example.com",
    passwordHash: hashedPassword,
    role: "Admin",
  },
  {
    name: "Ali",
    email: "ali@example.com",
    passwordHash: hashedPassword,
    role: "User",
  },
  {
    name: "Sara",
    email: "sara@example.com",
    passwordHash: hashedPassword,
    role: "User",
  },
   {
    name: "Saboor",
    email: "saboor@example.com",
    passwordHash: hashedPassword,
    role: "User",
  },

]);

console.log("✅ Sample users created");
await Task.insertMany([
  {
    title: "Complete Backend Setup",
    description: "Initialize Express and MongoDB",
    status: "Todo",
    priority: "High",
    createdBy: users[0]._id,
  },
  {
    title: "Learn Mongoose",
    description: "Understand schemas and models",
    status: "In Progress",
    priority: "Medium",
    createdBy: users[0]._id,
  },
  {
    title: "Build Login API",
    description: "Create authentication endpoints",
    status: "Todo",
    priority: "High",
    createdBy: users[1]._id,
  },
  {
    title: "Write Documentation",
    description: "Document API endpoints",
    status: "Done",
    priority: "Low",
    createdBy: users[2]._id,
  },
  {
    title: "Test APIs",
    description: "Verify CRUD operations using Postman",
    status: "Todo",
    priority: "Medium",
    createdBy: users[1]._id,
  },
   {
    title: "Add more Data",
    description: "Verify each data enters correctly",
    status: "Todo",
    priority: "Medium",
    createdBy: users[3]._id,
  },
   {
    title: "Throughly read every documentation",
    description: "Understand every concept",
    status: "Todo",
    priority: "Low",
    createdBy: users[2]._id,
  },
   {
    title: "Checks every task ",
    description: "Ensures every step is taken",
    status: "Todo",
    priority: "Medium",
    createdBy: users[0]._id,
  },

]);

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedDatabase();