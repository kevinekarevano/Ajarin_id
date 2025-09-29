import cloudinary from "../configs/cloudinary.js";

// Upload single file to Cloudinary
export const uploadToCloudinary = async (buffer, options = {}) => {
  const { folder = "uploads", transformation = [], resource_type = "auto" } = options;

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type,
          folder: `ajarin/${folder}`,
          transformation,
          quality: "auto",
          fetch_format: "auto",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              public_id: result.public_id,
              url: result.secure_url,
              original_filename: result.original_filename,
              bytes: result.bytes,
              format: result.format,
            });
          }
        }
      )
      .end(buffer);
  });
};

// Upload avatar with specific transformation
export const uploadAvatar = async (buffer) => {
  return uploadToCloudinary(buffer, {
    folder: "avatars",
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }, { quality: "auto" }],
  });
};

// Upload course materials
export const uploadCourseMaterial = async (buffer, filename) => {
  return uploadToCloudinary(buffer, {
    folder: "course-materials",
    public_id: filename ? filename.replace(/\.[^/.]+$/, "") : undefined,
  });
};

// Delete file from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Get Cloudinary URL with transformation
export const getCloudinaryUrl = (publicId, transformation = []) => {
  return cloudinary.url(publicId, {
    transformation,
    secure: true,
  });
};
