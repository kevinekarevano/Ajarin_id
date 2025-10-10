// Debug helper untuk CreateCoursePage
export const debugCourseData = (formData) => {
  console.log("=== CREATE COURSE DEBUG ===");

  console.log("Form Data:", {
    title: formData.title,
    description: formData.description?.substring(0, 50) + "...",
    category: formData.category,
    tags: formData.tags,
    tagsType: typeof formData.tags,
    tagsIsArray: Array.isArray(formData.tags),
    coverImage: formData.coverImage
      ? {
          name: formData.coverImage.name,
          size: formData.coverImage.size,
          type: formData.coverImage.type,
        }
      : null,
  });

  // Validate data structure
  const issues = [];

  if (!formData.title || formData.title.trim() === "") {
    issues.push("Title is empty");
  }

  if (!formData.description || formData.description.trim() === "") {
    issues.push("Description is empty");
  }

  if (!formData.category) {
    issues.push("Category is not selected");
  }

  if (!Array.isArray(formData.tags)) {
    issues.push("Tags should be an array, got: " + typeof formData.tags);
  }

  if (formData.coverImage && !(formData.coverImage instanceof File)) {
    issues.push("Cover image should be File instance or null");
  }

  if (issues.length > 0) {
    console.warn("⚠️ Validation Issues:", issues);
  } else {
    console.log("✅ Data structure looks good!");
  }

  return issues.length === 0;
};

// Debug helper untuk FormData yang dikirim ke backend
export const debugFormData = (formData) => {
  console.log("=== FORM DATA TO BACKEND ===");

  for (let [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`${key}:`, {
        name: value.name,
        size: value.size,
        type: value.type,
      });
    } else {
      console.log(`${key}:`, value);
    }
  }
};
