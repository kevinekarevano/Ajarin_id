# API Documentation

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-api-domain.com/api
```

## Authentication

All authenticated routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Auth Endpoints

#### Register

```http
POST /auth/register
Content-Type: application/json

{
  "fullname": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Logout

```http
POST /auth/logout
Authorization: Bearer <token>
```

## Courses

#### Get All Courses

```http
GET /courses
```

#### Get Course by ID

```http
GET /courses/:id
```

#### Create Course (Mentor only)

```http
POST /courses
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Course Title",
  "description": "Course Description",
  "category": "Programming",
  "tags": ["react", "javascript"],
  "cover": <file>
}
```

#### Update Course (Mentor only)

```http
PUT /courses/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Updated Title",
  "description": "Updated Description",
  "category": "Programming",
  "tags": ["react", "javascript", "advanced"],
  "cover": <file>
}
```

#### Delete Course (Mentor only)

```http
DELETE /courses/:id
Authorization: Bearer <token>
```

## Materials

#### Get Course Materials

```http
GET /materials/course/:courseId
Authorization: Bearer <token>
```

#### Create Material (Mentor only)

```http
POST /materials
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "course_id": "course_id_here",
  "title": "Material Title",
  "description": "Material Description",
  "type": "video",
  "order": 1,
  "chapter": "Introduction",
  "file": <file>
}
```

## Assignments

#### Get Course Assignments

```http
GET /assignments/course/:courseId
Authorization: Bearer <token>
```

#### Create Assignment (Mentor only)

```http
POST /assignments
Authorization: Bearer <token>
Content-Type: application/json

{
  "course_id": "course_id_here",
  "title": "Assignment Title",
  "description": "Assignment Description",
  "due_date": "2025-12-31T23:59:59.000Z",
  "total_points": 100
}
```

## Enrollments

#### Enroll in Course

```http
POST /enrollments
Authorization: Bearer <token>
Content-Type: application/json

{
  "course_id": "course_id_here"
}
```

#### Get My Enrollments

```http
GET /enrollments/my-enrollments
Authorization: Bearer <token>
```

## Certificates

#### Get My Certificates

```http
GET /certificates/my-certificates
Authorization: Bearer <token>
```

#### Get Public Certificate

```http
GET /certificates/public/:certificateId
```

## Discussions

#### Get Course Discussions

```http
GET /discussions/course/:courseId
Authorization: Bearer <token>
```

#### Create Discussion

```http
POST /discussions
Authorization: Bearer <token>
Content-Type: application/json

{
  "course_id": "course_id_here",
  "title": "Discussion Title",
  "content": "Discussion Content",
  "type": "question"
}
```

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error information"
}
```

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API requests are limited to 100 requests per 15 minutes per IP address.
