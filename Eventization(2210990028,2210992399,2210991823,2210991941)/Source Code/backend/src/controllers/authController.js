import User from '../models/User.js';
import { generateJwtToken } from '../utils/generateToken.js';
import mongoose from "mongoose";

export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });
    const user = await User.create({ name, email, password, role });
    const token = generateJwtToken({ id: user._id, role: user.role, name: user.name });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email }).select('+password');
//     if (!user) return res.status(400).json({ message: 'Invalid credentials' });
//     if (user.isBlocked) return res.status(403).json({ message: 'User is blocked' });
//     const valid = await user.comparePassword(password);
//     if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
//     const token = generateJwtToken({ id: user._id, role: user.role, name: user.name });
//     res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


// export const me = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).lean();
//     if (!user) return res.status(404).json({ message: 'Not found' });
//     res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, points: user.points } });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };





export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Demo users with VALID ObjectIds
    const demoUsers = {
      "customer@example.com": {
        id: new mongoose.Types.ObjectId("65f1a1b1a1b1a1b1a1b1a1b2"),
        name: "Demo Customer",
        role: "customer",
        password: "password"
      },
      "organizer@example.com": {
        id: new mongoose.Types.ObjectId("65f1a1b1a1b1a1b1a1b1a1b3"),
        name: "Demo Organizer",
        role: "organizer",
        password: "password"
      },
      "admin@example.com": {
        id: new mongoose.Types.ObjectId("65f1a1b1a1b1a1b1a1b1a1b4"),
        name: "Demo Admin",
        role: "admin",
        password: "password"
      }
    };

    const demoUser = demoUsers[email];

    // ✅ Demo login
    if (demoUser && password === demoUser.password) {
      const token = generateJwtToken({
        id: demoUser.id.toString(), // 🔥 important
        role: demoUser.role,
        name: demoUser.name
      });

      return res.json({
        token,
        user: {
          id: demoUser.id,
          name: demoUser.name,
          email,
          role: demoUser.role
        }
      });
    }

    // 🔽 Normal DB login
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "User is blocked" });
    }

    const valid = await user.comparePassword(password);

    if (!valid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateJwtToken({
      id: user._id.toString(),
      role: user.role,
      name: user.name
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};







export const me = async (req, res) => {
  try {
    const userId = req.user.id;

    // ✅ If NOT a valid ObjectId → treat as demo user
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.json({
        user: {
          id: userId,
          name: req.user.name,
          email: "demo@example.com",
          role: req.user.role,
          points: 0
        }
      });
    }

    // ✅ Convert to ObjectId
    const objectId = new mongoose.Types.ObjectId(userId);

    const user = await User.findById(objectId).lean();

    // ✅ If not found in DB → still handle gracefully (demo fallback)
    if (!user) {
      return res.json({
        user: {
          id: userId,
          name: req.user.name,
          email: "demo@example.com",
          role: req.user.role,
          points: 0
        }
      });
    }

    // ✅ Normal DB user
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};