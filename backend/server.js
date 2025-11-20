import express from "express";
import fs from "fs";
import cors from "cors";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ----- FILE PATHS -----
const USER_FILE = "./user.ndjson";
const FAVORITES_FILE = "./favorites.ndjson";

// ----- READ NDJSON -----
function readNDJSON(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, "utf8").trim();
  if (!data) return [];
  return data.split("\n").map((line) => JSON.parse(line));
}

// ----- WRITE TO NDJSON -----
function appendNDJSON(filePath, obj) {
  fs.appendFileSync(filePath, JSON.stringify(obj) + "\n");
}

// ========== SIGNUP ==========
app.post("/signup", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  const users = readNDJSON(USER_FILE);

  const exists = users.find((u) => u.email === email);
  if (exists) return res.status(400).json({ message: "User already exists" });

  const newUser = {
    id: uuidv4(),
    email,
    password,
  };

  appendNDJSON(USER_FILE, newUser);

  res.json({
    message: "Signup successful",
    userId: newUser.id,
    token: uuidv4(),
  });
});

// ========== LOGIN ==========
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const users = readNDJSON(USER_FILE);

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  res.json({
    message: "Login successful",
    userId: user.id,
    token: uuidv4(),
  });
});

// ========== GET FAVORITES PER USER ==========
app.get("/favorites", (req, res) => {
  const userId = req.query.userId;

  if (!userId)
    return res.status(400).json({ message: "userId is required" });

  const favorites = readNDJSON(FAVORITES_FILE);
  const userFavs = favorites.filter((f) => f.userId === userId);

  res.json(userFavs);
});

// ========== ADD FAVORITE ==========
app.post("/favorites", (req, res) => {
  const { userId, movie } = req.body;

  if (!userId || !movie)
    return res.status(400).json({ message: "userId + movie required" });

  const newFav = {
    id: uuidv4(),
    userId,
    movie,
  };

  appendNDJSON(FAVORITES_FILE, newFav);

  res.json({ message: "Favorite added", newFav });
});

// ========== DELETE FAVORITE ==========
app.delete("/favorites/:id", (req, res) => {
  const favId = req.params.id;

  const favorites = readNDJSON(FAVORITES_FILE);
  const updated = favorites.filter((f) => f.id !== favId);

  fs.writeFileSync(
    FAVORITES_FILE,
    updated.map((obj) => JSON.stringify(obj)).join("\n") + "\n"
  );

  res.json({ message: "Favorite removed" });
});
// ----- SERVER START -----
app.listen(5000, () => {
  console.log("Backend server running on port 5000");
});