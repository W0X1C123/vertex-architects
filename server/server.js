const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const usersFile = path.join(__dirname, "users.json");

app.use(cors());
app.use(express.json());

function readUsers() {
  try {
    if (!fs.existsSync(usersFile)) {
      fs.writeFileSync(usersFile, "[]");
    }

    const data = fs.readFileSync(usersFile, "utf8");

    if (!data.trim()) {
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading users.json:", error);
    return [];
  }
}

function writeUsers(users) {
  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error("Error writing users.json:", error);
    return false;
  }
}

// SIGNUP
app.post("/signup", (req, res) => {
  console.log("SIGNUP HIT:", req.body);

  const username = req.body.username?.trim();
  const password = req.body.password?.trim();

  if (!username || !password) {
    return res.json({
      success: false,
      message: "Username and password are required"
    });
  }

  const users = readUsers();
  const exists = users.find((u) => u.username === username);

  if (exists) {
    return res.json({
      success: false,
      message: "Username already exists"
    });
  }

  users.push({ username, password });

  const saved = writeUsers(users);

  if (!saved) {
    return res.json({
      success: false,
      message: "Could not save user"
    });
  }

  res.json({
    success: true,
    message: "Account created"
  });
});

// LOGIN
app.post("/login", (req, res) => {
  console.log("LOGIN HIT:", req.body);

  const username = req.body.username?.trim();
  const password = req.body.password?.trim();

  if (!username || !password) {
    return res.json({
      success: false,
      message: "Username and password are required"
    });
  }

  const users = readUsers();

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.json({
      success: false,
      message: "Invalid username or password"
    });
  }

  res.json({
    success: true,
    message: "Login successful"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
