// Test file to check course API
import api from "./lib/api.js";

const testCoursesAPI = async () => {
  try {
    console.log("Testing courses API...");
    const response = await api.get("/courses?status=published&limit=10");
    console.log("API Response:", response.data);

    if (response.data.success) {
      console.log("✅ API working! Found", response.data.data.courses.length, "courses");
      console.log("Sample course:", response.data.data.courses[0]);
    } else {
      console.log("❌ API returned success: false");
    }
  } catch (error) {
    console.log("❌ API Error:", error.message);
    console.log("Response data:", error.response?.data);
  }
};

// Uncomment to test
// testCoursesAPI();

export { testCoursesAPI };
