import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from cookie only (cookie-based auth)
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "ajarin-secret-key");
    const user = await userModel.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
      });
    }

    req.user = { userId: user._id.toString(), ...user.toObject() };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export default authMiddleware;
