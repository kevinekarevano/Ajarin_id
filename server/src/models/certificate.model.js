import mongoose from "mongoose";
import { nanoid } from "nanoid";

const certificateSchema = new mongoose.Schema(
  {
    // Unique certificate ID for public access
    certificate_id: {
      type: String,
      unique: true,
      required: true,
      default: () => nanoid(16),
    },

    // References
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },

    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
    },

    // Certificate Details
    certificate_number: {
      type: String,
      unique: true,
      required: true,
    },

    recipient_name: {
      type: String,
      required: [true, "Recipient name is required"],
    },

    course_title: {
      type: String,
      required: [true, "Course title is required"],
    },

    course_category: {
      type: String,
      required: true,
    },

    mentor_name: {
      type: String,
      required: [true, "Mentor name is required"],
    },

    // Dates
    completion_date: {
      type: Date,
      required: [true, "Completion date is required"],
    },

    issued_date: {
      type: Date,
      default: Date.now,
    },

    // Course Statistics
    total_materials: {
      type: Number,
      required: true,
    },

    completion_percentage: {
      type: Number,
      required: true,
      min: 100, // Must be 100% to get certificate
      max: 100,
    },

    course_duration_hours: {
      type: Number,
      required: true,
    },

    // Certificate Status
    status: {
      type: String,
      enum: ["active", "revoked", "expired"],
      default: "active",
    },

    // Public Access
    public_url: {
      type: String,
      required: true,
    },

    is_public: {
      type: Boolean,
      default: true,
    },

    // Download tracking
    download_count: {
      type: Number,
      default: 0,
    },

    view_count: {
      type: Number,
      default: 0,
    },

    // Additional metadata
    template_version: {
      type: String,
      default: "v1.0",
    },

    verification_data: {
      hash: String,
      signature: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
certificateSchema.index({ certificate_id: 1 });
certificateSchema.index({ user_id: 1, course_id: 1 }, { unique: true });
certificateSchema.index({ status: 1 });
certificateSchema.index({ issued_date: -1 });

// Generate certificate number
certificateSchema.pre("save", async function (next) {
  if (!this.certificate_number) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, "0");

    // Count certificates this month
    const count = await this.constructor.countDocuments({
      issued_date: {
        $gte: new Date(year, new Date().getMonth(), 1),
        $lt: new Date(year, new Date().getMonth() + 1, 1),
      },
    });

    this.certificate_number = `AJARIN-${year}${month}-${String(count + 1).padStart(4, "0")}`;
  }

  // Generate public URL
  if (!this.public_url) {
    this.public_url = `${process.env.CLIENT_URL || "http://localhost:5173"}/certificate/${this.certificate_id}`;
  }

  next();
});

// Instance methods
certificateSchema.methods.incrementView = function () {
  this.view_count += 1;
  return this.save();
};

certificateSchema.methods.incrementDownload = function () {
  this.download_count += 1;
  return this.save();
};

certificateSchema.methods.revoke = function () {
  this.status = "revoked";
  return this.save();
};

certificateSchema.methods.isValid = function () {
  return this.status === "active";
};

// Static methods
certificateSchema.statics.findByPublicId = function (certificateId) {
  return this.findOne({ certificate_id: certificateId, status: "active" })
    .populate("user_id", "fullname username email")
    .populate("course_id", "title category description mentor_id")
    .populate({
      path: "course_id",
      populate: {
        path: "mentor_id",
        select: "fullname username",
      },
    });
};

certificateSchema.statics.getUserCertificates = function (userId) {
  return this.find({ user_id: userId, status: "active" }).populate("course_id", "title category cover_image").sort({ issued_date: -1 });
};

certificateSchema.statics.getCourseCertificates = function (courseId) {
  return this.find({ course_id: courseId, status: "active" }).populate("user_id", "fullname username email").sort({ issued_date: -1 });
};

certificateSchema.statics.getCertificateStats = function (options = {}) {
  const { userId, courseId, mentorId } = options;

  const matchConditions = { status: "active" };

  if (userId) matchConditions.user_id = userId;
  if (courseId) matchConditions.course_id = courseId;

  return this.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: null,
        totalCertificates: { $sum: 1 },
        totalViews: { $sum: "$view_count" },
        totalDownloads: { $sum: "$download_count" },
        avgCompletionPercentage: { $avg: "$completion_percentage" },
      },
    },
  ]);
};

// Virtual for formatted certificate number
certificateSchema.virtual("formatted_number").get(function () {
  return this.certificate_number;
});

// Virtual for verification URL
certificateSchema.virtual("verification_url").get(function () {
  return `${process.env.CLIENT_URL || "http://localhost:5173"}/verify/${this.certificate_id}`;
});

const Certificate = mongoose.model("Certificate", certificateSchema);

export default Certificate;
