const jwt = require("jsonwebtoken");

// Basit sabit kullanıcılar: midterm için yeterli
const USERS = [
  { username: "mobile-app", password: "mobile123", role: "mobile" },
  { username: "bank-app", password: "bank123", role: "bank" },
  { username: "admin-app", password: "admin123", role: "admin" },
];

async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "username and password are required" });
    }

    const user = USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const payload = {
      sub: user.username,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.json({
      accessToken: token,
      tokenType: "Bearer",
      expiresIn: 3600,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
};
