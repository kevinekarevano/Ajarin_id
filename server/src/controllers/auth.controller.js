import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import { uploadAvatar } from "../utils/cloudinary.js";

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "ajarin-secret-key", {
    expiresIn: "7d",
  });
};

// Register controller
export const register = async (req, res) => {
  try {
    const { fullname, username, email, password, headline, bio } = req.body;
    const file = req.file;

    // Validation
    if (!fullname || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: fullname, username, email, password",
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists",
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Handle avatar - upload to Cloudinary or use default
    let avatarData;
    if (file) {
      try {
        // Upload to Cloudinary
        const cloudinaryResult = await uploadAvatar(file.buffer);
        avatarData = {
          public_id: cloudinaryResult.public_id,
          url: cloudinaryResult.url,
        };
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload avatar. Please try again.",
        });
      }
    } else {
      // Default avatar
      avatarData = {
        public_id: "ajarin/default/default_avatar",
        url: "https://res.cloudinary.com/demo/image/upload/c_pad,b_auto,h_400,w_400/avatar-default.png",
      };
    }

    // Create new user
    const newUser = new userModel({
      fullname: fullname.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      avatar: avatarData,
      headline: headline || "",
      bio: bio || "",
    });

    // Save user to database
    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser._id);

    // Set HTTP-only cookie (secure storage)
    res.cookie("token", token, {
      httpOnly: true, // Tidak bisa diakses via JavaScript (XSS protection)
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict", // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Response (include token for frontend compatibility)
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: newUser._id,
          fullname: newUser.fullname,
          username: newUser.username,
          email: newUser.email,
          avatar: newUser.avatar,
          headline: newUser.headline,
          bio: newUser.bio,
          createdAt: newUser.createdAt,
        },
        token: token, // Include token for frontend cookie storage
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    // Handle multer errors
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File size too large. Maximum 5MB allowed",
        });
      }
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// Login controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user with password
    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Set HTTP-only cookie (secure storage)
    res.cookie("token", token, {
      httpOnly: true, // Tidak bisa diakses via JavaScript (XSS protection)
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict", // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Response (include token for frontend compatibility)
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          fullname: user.fullname,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          headline: user.headline,
          bio: user.bio,
        },
        token: token, // Include token for frontend cookie storage
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// Logout controller
export const logout = async (req, res) => {
  try {
    // Clear the HTTP-only cookie
    res.clearCookie("token");

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
