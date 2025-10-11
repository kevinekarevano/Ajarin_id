import mongoose from "mongoose";
import courseModel from "../models/course.model.js";
import userModel from "../models/user.model.js";
import connectDB from "../configs/db.js";
import dotenv from "dotenv";

dotenv.config();

const sampleCourses = [
  {
    title: "Belajar JavaScript dari Dasar",
    description: "Kursus komprehensif untuk memulai programming dengan JavaScript. Mulai dari syntax dasar hingga konsep advanced seperti async/await, closures, dan modern ES6+ features.",
    category: "Programming",
    level: "beginner",
    tags: ["javascript", "programming", "web development"],
    status: "published",
    cover_url: {
      public_id: "sample_js_course",
      url: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=500&h=300&fit=crop",
    },
  },
  {
    title: "React JS untuk Pemula",
    description: "Pelajari library React JS untuk membuat aplikasi web modern. Materi meliputi components, hooks, state management, dan best practices dalam development.",
    category: "Web Development",
    level: "intermediate",
    tags: ["react", "javascript", "frontend"],
    status: "published",
    cover_url: {
      public_id: "sample_react_course",
      url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&h=300&fit=crop",
    },
  },
  {
    title: "Node.js Backend Development",
    description: "Bangun aplikasi backend yang scalable dengan Node.js. Pelajari Express.js, database integration, authentication, dan deployment strategies.",
    category: "Programming",
    level: "intermediate",
    tags: ["nodejs", "backend", "express"],
    status: "published",
    cover_url: {
      public_id: "sample_nodejs_course",
      url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&h=300&fit=crop",
    },
  },
  {
    title: "UI/UX Design Fundamentals",
    description: "Memahami prinsip-prinsip design yang baik untuk menciptakan user experience yang optimal. Belajar design thinking, wireframing, dan prototyping.",
    category: "UI/UX",
    level: "beginner",
    tags: ["design", "ui", "ux", "figma"],
    status: "published",
    cover_url: {
      public_id: "sample_design_course",
      url: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=500&h=300&fit=crop",
    },
  },
  {
    title: "Python Data Science",
    description: "Analisis data menggunakan Python dengan library pandas, numpy, dan matplotlib. Ideal untuk yang ingin terjun ke dunia data science dan analytics.",
    category: "Data Science",
    level: "intermediate",
    tags: ["python", "data science", "analytics"],
    status: "published",
    cover_url: {
      public_id: "sample_python_course",
      url: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500&h=300&fit=crop",
    },
  },
];

const seedCourses = async () => {
  try {
    await connectDB();

    // Get first user as mentor
    const users = await userModel.find({}).limit(5);
    if (users.length === 0) {
      console.log("❌ No users found. Please run user seeder first.");
      return;
    }

    // Clear existing courses
    await courseModel.deleteMany({});
    console.log("🗑️ Cleared existing courses");

    // Create courses with different mentors
    const coursesToCreate = sampleCourses.map((course, index) => ({
      ...course,
      mentor_id: users[index % users.length]._id,
    }));

    const createdCourses = await courseModel.insertMany(coursesToCreate);
    console.log(`✅ Successfully created ${createdCourses.length} sample courses!`);

    // Show created courses
    const populated = await courseModel.find({}).populate("mentor_id", "fullname username").limit(10);

    populated.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`);
      console.log(`   Mentor: ${course.mentor_id.fullname}`);
      console.log(`   Category: ${course.category}`);
      console.log(`   Cover URL: ${course.cover_url?.url || "No cover"}`);
      console.log(`   Status: ${course.status}`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error seeding courses:", error.message);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
};

seedCourses();
