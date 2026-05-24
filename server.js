import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/FactoryPulse";

// Mongoose v7 removed support for useNewUrlParser/useUnifiedTopology options.
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, index: true, unique: true, sparse: true },
  password: { type: String },
  factoryName: { type: String },
  role: { type: String },
  contact: { type: String, index: true, unique: true, sparse: true }
}, { collection: "User" });

const User = mongoose.model("User", userSchema);

app.post("/api/register", async (req, res) => {
  try {
    console.log('/api/register request body:', req.body);
    const { name, email, password, factoryName, role, contact } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Missing required fields" });

    // Check existing
    const exists = await User.findOne({ $or: [{ email }, { contact }] }).exec();
    if (exists) return res.status(409).json({ message: "Email or contact already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, factoryName, role, contact });
    await user.save();
    const userSafe = { name: user.name, email: user.email, factoryName: user.factoryName, role: user.role, contact: user.contact };
    return res.status(201).json({ message: "User created", user: userSafe });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    console.log('/api/login request body:', req.body);
    const { email, phone, password } = req.body;
    if ((!email && !phone) || !password) return res.status(400).json({ message: "Missing credentials" });

    const query = email ? { email } : { contact: phone };
    const user = await User.findOne(query).exec();
    if (!user) {
      console.log('login: user not found for query', query);
      return res.status(401).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log('login: wrong password for user', user.email || user.contact);
      return res.status(401).json({ message: "Incorrect password" });
    }

    const userSafe = { name: user.name, email: user.email, factoryName: user.factoryName, role: user.role, contact: user.contact };
    console.log('login: success for', userSafe.email || userSafe.contact);
    return res.json({ message: "Login successful", user: userSafe });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API server listening on port ${PORT}`));
