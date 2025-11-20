import express from "express";
import fs from "fs";
import { promisify } from "util";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const USERS_FILE = "./data/users.ndjson";
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10");
const JWT_SECRET = process.env.JWT_SECRET || "secret";

const appendFile = promisify(fs.appendFile);
const readFile = promisify(fs.readFile);

async function findUserByEmail(email) {
  try {
    const data = await readFile(USERS_FILE, "utf-8");
    return data
      .split("\n")
      .filter(Boolean)
      .map(line => JSON.parse(line))
      .find(u => u.email === email);
  } catch (err) {
    return null;
  }
}

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  const existing = await findUserByEmail(email);
  if (existing) return res.status(409).json({ error: "User exists" });

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = { id: `u_${Date.now()}`, email, name: name || "", password: hash, createdAt: new Date().toISOString() };

  await appendFile(USERS_FILE, JSON.stringify(user) + "\n");
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await findUserByEmail(email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

export default router;
