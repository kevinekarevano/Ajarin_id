// Test script untuk melihat data course dengan cover image
import courseModel from "./models/course.model.js";
import connectDB from "./configs/db.js";
import dotenv from "dotenv";

dotenv.config();

const testCourseData = async () => {
  try {
    await connectDB();

    // Cek semua courses
    const courses = await courseModel.find({}).populate("mentor_id", "fullname username");

    console.log("📚 Total courses:", courses.length);

    courses.forEach((course, index) => {
      console.log(`\n${index + 1}. Course: ${course.title}`);
      console.log(`   Cover URL:`, course.cover_url);
      console.log(`   Has cover URL?`, !!course.cover_url?.url);
      console.log(`   Cover URL value:`, course.cover_url?.url);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
};

testCourseData();
