import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ======================
// CHECK ENV VARIABLE
// ======================

if (!MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env");
  process.exit(1);
}

// ======================
// MONGODB CONNECTION
// ======================

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");

    // Start server ONLY after DB connection
    app.listen(PORT, () => {
      console.log(`🚀 API server running on port ${PORT}`);
    });

  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed");
    console.error(err.message);
    process.exit(1);
  });

// ======================
// USER SCHEMA
// ======================

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    unique: true,
    sparse: true
  },

  password: {
    type: String,
    required: true
  },

  factoryName: String,

  role: String,

  contact: {
    type: String,
    unique: true,
    sparse: true
  }

}, { collection: "User" });

const User = mongoose.model("User", userSchema);

// ======================
// LOGIN EVENT SCHEMA
// ======================

const loginSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  email: String,

  contact: String,

  success: Boolean,

  timestamp: {
    type: Date,
    default: Date.now
  },

  ip: String,

  userAgent: String

}, { collection: "Login User" });

const LoginEvent = mongoose.model("LoginEvent", loginSchema);

// ======================
// REGISTER ROUTE
// ======================

app.post("/api/register", async (req, res) => {

  try {

    console.log("📥 Register Body:", req.body);

    const {
      name,
      email,
      password,
      factoryName,
      role,
      contact
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      $or: [
        { email },
        { contact }
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email or contact already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      factoryName,
      role,
      contact
    });

    await user.save();

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        name: user.name,
        email: user.email,
        factoryName: user.factoryName,
        role: user.role,
        contact: user.contact
      }
    });

  } catch (err) {

    console.error("❌ Register Error:");
    console.error(err);

    return res.status(500).json({
      message: "Server error"
    });
  }
});

// ======================
// LOGIN ROUTE
// ======================

app.post("/api/login", async (req, res) => {

  try {

    console.log("📥 Login Body:", req.body);

    const {
      email,
      phone,
      password
    } = req.body;

    if ((!email && !phone) || !password) {
      return res.status(400).json({
        message: "Missing credentials"
      });
    }

    const query = email
      ? { email: email.trim() }
      : { contact: phone.trim() };

    const user = await User.findOne(query);

    const clientIp =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      req.ip;

    const userAgent =
      req.headers["user-agent"] || "";

    // User not found
    if (!user) {

      await LoginEvent.create({
        email: email || null,
        contact: phone || null,
        success: false,
        ip: clientIp,
        userAgent
      });

      return res.status(401).json({
        message: "User not found"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {

      await LoginEvent.create({
        userId: user._id,
        email: user.email,
        contact: user.contact,
        success: false,
        ip: clientIp,
        userAgent
      });

      return res.status(401).json({
        message: "Incorrect password"
      });
    }

    // Success login
    await LoginEvent.create({
      userId: user._id,
      email: user.email,
      contact: user.contact,
      success: true,
      ip: clientIp,
      userAgent
    });

    return res.json({
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        factoryName: user.factoryName,
        role: user.role,
        contact: user.contact
      }
    });

  } catch (err) {

    console.error("❌ Login Error:");
    console.error(err);

    return res.status(500).json({
      message: "Server error"
    });
  }
});