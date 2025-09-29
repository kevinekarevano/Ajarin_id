import multer from "multer";
import path from "path";

// Memory storage untuk upload ke Cloudinary
const memoryStorage = multer.memoryStorage();

// File filter untuk image
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

// File filter untuk semua jenis file
const allFileFilter = (req, file, cb) => {
  // Accept all file types
  cb(null, true);
};

// Base multer config
const baseConfig = {
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
};

// Dynamic upload middleware
export const upload = {
  // Single file upload (dinamis - bisa field apa saja)
  single: (fieldName) =>
    multer({
      ...baseConfig,
      fileFilter: imageFilter,
    }).single(fieldName),

  // Multiple files upload (dinamis)
  multiple: (fieldName, maxCount = 5) =>
    multer({
      ...baseConfig,
      fileFilter: allFileFilter,
    }).array(fieldName, maxCount),

  // Mixed fields upload
  fields: (fields) =>
    multer({
      ...baseConfig,
      fileFilter: allFileFilter,
    }).fields(fields),

  // Any file upload
  any: () =>
    multer({
      ...baseConfig,
      fileFilter: allFileFilter,
    }).any(),
};

// Shorthand exports untuk backward compatibility
export const uploadSingle = upload.single;
export const uploadMultiple = upload.multiple;

// Default export
export default upload;
