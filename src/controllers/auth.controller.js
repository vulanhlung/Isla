import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";
import { signToken } from "../utils/jwt.js";

export const register = async (req, res) => {
  try {
    const { email, password, consent } = req.body;

    if (!consent) {
      return res.status(400).json({ error: "Data processing consent required" });
    }

    // check exist
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // Generate anonymized ID
    const anonymizedId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        consent: true,
        anonymizedId,
      },
    });

    res.json({ message: "Register success", userId: user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Wrong password" });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
    });

    res.json({
      message: "Login success",
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
