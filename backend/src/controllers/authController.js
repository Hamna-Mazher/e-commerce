const { pool } = require("../config/pgd");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// =====================================================
// REGISTER USER
// =====================================================

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users
      (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        name,
        email,
        hashedPassword,
        role || "User",
      ]
    );

    const user = result.rows[0];

    return res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// LOGIN USER
// =====================================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        message:
          "This account uses Google login. Please continue with Google.",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      message: "Login successful",

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || "",
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// GOOGLE LOGIN / SIGNUP
// =====================================================
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body || {};

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required",
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error("GOOGLE_CLIENT_ID is missing from .env");

      return res.status(500).json({
        message: "Google authentication is not configured",
      });
    }

    // Verify Google's ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const {
      sub: googleId,
      name,
      email,
      picture,
    } = payload;

    if (!email) {
      return res.status(400).json({
        message: "Google account email not found",
      });
    }

    // Check whether the user already exists
    const existingResult = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    let user = existingResult.rows[0];

    // ================================================
    // CREATE NEW GOOGLE USER
    // ================================================

    if (!user) {
      const result = await pool.query(
        `
        INSERT INTO users
        (
          name,
          email,
          "googleId",
          "profileImage",
          role
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [
          name || "Google User",
          email,
          googleId,
          picture || "",
          "User",
        ]
      );

      user = result.rows[0];
    }

    // ================================================
    // CONNECT GOOGLE TO EXISTING USER
    // ================================================

    else if (!user.googleId) {
      const result = await pool.query(
        `
        UPDATE users
        SET
          "googleId" = $1,
          "profileImage" = $2,
          "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
        `,
        [
          googleId,
          picture || user.profileImage || "",
          user.id,
        ]
      );

      user = result.rows[0];
    }

    // ================================================
    // GENERATE JWT
    // ================================================

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      message: "Google authentication successful",

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || "",
      },
    });
  } catch (error) {
    console.error("Google Login Error:", error);

    return res.status(401).json({
      message: "Google authentication failed",
      error: error.message,
    });
  }
};

// =====================================================
// FORGOT PASSWORD
// =====================================================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(200).json({
        message:
          "If an account with this email exists, a password reset link has been sent.",
      });
    }

    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const resetPasswordExpire = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await pool.query(
      `
      UPDATE users
      SET
        "resetPasswordToken" = $1,
        "resetPasswordExpire" = $2,
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $3
      `,
      [
        hashedToken,
        resetPasswordExpire,
        user.id,
      ]
    );

    const resetUrl = `http://localhost:3002/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Beyond Tasks" <${process.env.EMAIL_USER}>`,

      to: user.email,

      subject: "Password Reset Request",

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 600px;
            margin: auto;
          "
        >

          <h2>Password Reset</h2>

          <p>Hello ${user.name},</p>

          <p>
            We received a request to reset your password.
          </p>

          <p>
            Click the button below to create a new password:
          </p>

          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 8px;
            "
          >
            Reset Password
          </a>

          <p style="margin-top: 20px;">
            This link will expire in 15 minutes.
          </p>

          <p>
            If you didn't request a password reset,
            you can safely ignore this email.
          </p>

        </div>
      `,
    });

    return res.status(200).json({
      message:
        "If an account with this email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error(
      "Forgot Password Error:",
      error
    );

    return res.status(500).json({
      message: "Failed to send password reset email",
    });
  }
};

// =====================================================
// RESET PASSWORD
// =====================================================

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body || {};

    if (!password) {
      return res.status(400).json({
        message: "New password is required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const result = await pool.query(
      `
      SELECT *
      FROM users
      WHERE "resetPasswordToken" = $1
      AND "resetPasswordExpire" > CURRENT_TIMESTAMP
      `,
      [hashedToken]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({
        message:
          "Password reset link is invalid or has expired",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    await pool.query(
      `
      UPDATE users
      SET
        password = $1,
        "resetPasswordToken" = NULL,
        "resetPasswordExpire" = NULL,
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $2
      `,
      [
        hashedPassword,
        user.id,
      ]
    );

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(
      "Reset Password Error:",
      error
    );

    return res.status(500).json({
      message: "Failed to reset password",
       error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
};