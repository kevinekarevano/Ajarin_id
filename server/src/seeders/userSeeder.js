import mongoose from "mongoose";
import userModel from "../models/user.model.js";
import connectDB from "../configs/db.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Dummy data untuk users
const dummyUsers = [
  {
    username: "john_doe",
    email: "john.doe@example.com",
    password: "password123", // Dalam production, hash password ini
  },
  {
    username: "jane_smith",
    email: "jane.smith@example.com",
    password: "password123",
  },
  {
    username: "bob_wilson",
    email: "bob.wilson@example.com",
    password: "password123",
  },
  {
    username: "alice_johnson",
    email: "alice.johnson@example.com",
    password: "password123",
  },
  {
    username: "charlie_brown",
    email: "charlie.brown@example.com",
    password: "password123",
  },
  {
    username: "diana_ross",
    email: "diana.ross@example.com",
    password: "password123",
  },
  {
    username: "eddie_murphy",
    email: "eddie.murphy@example.com",
    password: "password123",
  },
  {
    username: "fiona_apple",
    email: "fiona.apple@example.com",
    password: "password123",
  },
  {
    username: "george_lucas",
    email: "george.lucas@example.com",
    password: "password123",
  },
  {
    username: "helen_keller",
    email: "helen.keller@example.com",
    password: "password123",
  },
];

// Function untuk seed users
const seedUsers = async () => {
  try {
    // Connect to database
    await connectDB();

    // Hapus semua data user yang ada (optional)
    console.log("Menghapus data user yang ada...");
    await userModel.deleteMany({});

    // Insert dummy data
    console.log("Memasukkan dummy data users...");
    const createdUsers = await userModel.insertMany(dummyUsers);

    console.log(`✅ Berhasil membuat ${createdUsers.length} user dummy!`);

    // Display created users
    createdUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} - ${user.email}`);
    });
  } catch (error) {
    console.error("❌ Error saat seeding users:", error.message);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  }
};

// Function untuk hanya menghapus semua users
const clearUsers = async () => {
  try {
    await connectDB();

    const result = await userModel.deleteMany({});
    console.log(`✅ Berhasil menghapus ${result.deletedCount} users!`);
  } catch (error) {
    console.error("❌ Error saat menghapus users:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  }
};

// Check command line arguments
const command = process.argv[2];

if (command === "seed") {
  seedUsers();
} else if (command === "clear") {
  clearUsers();
} else {
  console.log("Usage:");
  console.log("  npm run seed:users seed   - Seed dummy users");
  console.log("  npm run seed:users clear  - Clear all users");
  process.exit(1);
}
