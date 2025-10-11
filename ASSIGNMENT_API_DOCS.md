# Assignment System API Documentation

## Overview

Sistem assignment yang telah disederhanakan dengan fokus pada:

1. **Mentor** dapat mengelola tugas dan memberikan nilai
2. **Student** dapat mengumpulkan tugas berupa text dan/atau file
3. **Grading** system untuk mentor memberikan nilai dan komentar

## API Endpoints

### 🎯 **MENTOR ENDPOINTS**

#### 1. Create Assignment

```
POST /api/assignments/course/:courseId/create
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body (form-data):
- title: string (required) - Judul tugas
- description: string (required) - Deskripsi tugas
- instructions: string (optional) - Instruksi detail
- question_file: file (optional) - File soal (PDF/gambar)

Response:
{
  "success": true,
  "message": "Assignment created successfully",
  "data": {
    "assignment": {
      "_id": "assignment_id",
      "title": "Tugas 1",
      "description": "Deskripsi tugas",
      "question_file": {
        "url": "cloudinary_url",
        "file_name": "soal.pdf"
      },
      "course_id": {...},
      "mentor_id": {...}
    }
  }
}
```

#### 2. Update Assignment

```
PUT /api/assignments/:assignmentId/update
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body: Same as create assignment
```

#### 3. Delete Assignment

```
DELETE /api/assignments/:assignmentId/delete
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Assignment and all related submissions deleted successfully"
}
```

#### 4. Get Course Assignments

```
GET /api/assignments/course/:courseId?page=1&limit=10
Authorization: Bearer <token>

Response (Mentor):
{
  "success": true,
  "data": {
    "assignments": [
      {
        "_id": "assignment_id",
        "title": "Tugas 1",
        "description": "Deskripsi",
        "total_submissions": 5,
        "graded_submissions": 3
      }
    ],
    "pagination": {...}
  }
}

Response (Student):
{
  "success": true,
  "data": {
    "assignments": [
      {
        "_id": "assignment_id",
        "title": "Tugas 1",
        "description": "Deskripsi",
        "submission_status": {
          "status": "graded",
          "score": 85,
          "graded": true
        }
      }
    ],
    "pagination": {...}
  }
}
```

#### 5. Get Assignment Submissions

```
GET /api/assignments/:assignmentId/submissions?page=1&limit=10&status=submitted
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "submissions": [
      {
        "_id": "submission_id",
        "student_id": {
          "fullname": "John Doe",
          "username": "john",
          "email": "john@example.com"
        },
        "content": {
          "text_content": "Jawaban text",
          "files_info": [
            {
              "url": "file_url",
              "file_name": "tugas.pdf"
            }
          ]
        },
        "status": "submitted",
        "submitted_at": "2025-01-01T10:00:00Z",
        "grading": {
          "score": 85,
          "comments": "Good work!"
        }
      }
    ],
    "pagination": {...}
  }
}
```

#### 6. Grade Submission

```
POST /api/assignments/submission/:submissionId/grade
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "score": 85,
  "comments": "Great work! Keep it up.",
  "letter_grade": "A" // optional
}

Response:
{
  "success": true,
  "message": "Submission graded successfully",
  "data": {
    "submission": {
      "_id": "submission_id",
      "grading": {
        "score": 85,
        "comments": "Great work!",
        "graded_by": {...},
        "graded_at": "2025-01-01T10:00:00Z"
      },
      "status": "graded"
    }
  }
}
```

### 🎓 **STUDENT ENDPOINTS**

#### 1. Submit Assignment

```
POST /api/assignments/:assignmentId/submit
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body (form-data):
- textContent: string (optional) - Jawaban dalam bentuk text
- files: file[] (optional) - File-file tugas (max 10 files, 50MB each)

Note: Harus ada minimal textContent ATAU files

Response:
{
  "success": true,
  "message": "Assignment submitted successfully",
  "data": {
    "submission": {
      "_id": "submission_id",
      "content": {
        "text_content": "Jawaban saya...",
        "files_info": [
          {
            "url": "cloudinary_url",
            "file_name": "tugas.pdf",
            "file_size": 1024000
          }
        ]
      },
      "status": "submitted",
      "submitted_at": "2025-01-01T10:00:00Z"
    }
  }
}
```

#### 2. Get My Submissions

```
GET /api/assignments/my-submissions?courseId=xxx&status=graded&page=1&limit=10
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "submissions": [
      {
        "_id": "submission_id",
        "assignment_id": {
          "title": "Tugas 1",
          "max_points": 100
        },
        "course_id": {
          "title": "Course Name"
        },
        "status": "graded",
        "grading": {
          "score": 85,
          "comments": "Good work!",
          "graded_by": {
            "fullname": "Mentor Name"
          }
        }
      }
    ],
    "pagination": {...}
  }
}
```

#### 3. Get Submission Details

```
GET /api/assignments/submission/:submissionId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "submission": {
      "_id": "submission_id",
      "assignment_id": {
        "title": "Tugas 1",
        "description": "Description"
      },
      "content": {
        "text_content": "My answer...",
        "files_info": [...]
      },
      "status": "graded",
      "grading": {
        "score": 85,
        "comments": "Excellent work!",
        "graded_by": {...}
      }
    }
  }
}
```

## File Upload Specifications

### Question Files (Mentor):

- **Allowed types**: PDF, JPG, JPEG, PNG, GIF
- **Max size**: 50MB per file
- **Storage**: Cloudinary `/ajarin/assignments/questions/`

### Submission Files (Student):

- **Allowed types**: PDF, JPG, JPEG, PNG, GIF, DOC, DOCX, TXT
- **Max size**: 50MB per file
- **Max files**: 10 files per submission
- **Storage**: Cloudinary `/ajarin/assignments/submissions/`

## Status Flow

### Assignment Status:

- `is_published: true` - Assignment is visible to students

### Submission Status:

1. `submitted` - Student has submitted the assignment
2. `under_review` - (Optional) Mentor is reviewing
3. `graded` - Mentor has given a grade
4. `returned_for_revision` - (Future feature) Mentor requests revision

## Error Codes

- `400` - Bad Request (missing fields, invalid file types, etc.)
- `401` - Unauthorized (no token)
- `403` - Forbidden (not mentor/not enrolled)
- `404` - Not Found (assignment/submission not found)
- `500` - Internal Server Error

## Key Features

✅ **Simplified System**: No complex submission types, students can submit text/files/both
✅ **File Management**: Automatic Cloudinary upload/delete
✅ **Access Control**: Proper mentor/student separation
✅ **Grading System**: Score, comments, and letter grades
✅ **Revision Support**: Students can resubmit (replaces old submission)
✅ **Progress Tracking**: Automatic material progress update
