export default function handler(req, res) {
  res.status(200).json({
    success: true,
    message: "Simple test endpoint working!",
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      hasMongoUri: !!process.env.MONGODB_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
    },
  });
}
