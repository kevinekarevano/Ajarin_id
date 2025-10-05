// Forum System API Tests
// Base URL: http://localhost:3000/api/forum

/*
## FORUM SYSTEM - COMPLETE API ENDPOINTS

### 🗨️ DISCUSSIONS

1. **Get Course Discussions**
   ```
   GET /api/forum/course/:courseId/discussions
   Query: ?type=all|general|question|announcement&search=term&sortBy=last_reply|newest|oldest|most_replies|most_liked&page=1&limit=20
   ```

2. **Create Discussion**
   ```
   POST /api/forum/course/:courseId/discussions
   Body: {
     "title": "Discussion Title",
     "content": "Discussion content",
     "type": "general|question|announcement|material_discussion",
     "material_id": "materialId (optional)",
     "tags": ["tag1", "tag2"]
   }
   ```

3. **Get Single Discussion**
   ```
   GET /api/forum/discussions/:discussionId
   Query: ?page=1&limit=50&sortBy=oldest|newest|most_liked
   ```

4. **Update Discussion**
   ```
   PUT /api/forum/discussions/:discussionId
   Body: {
     "title": "Updated title",
     "content": "Updated content",
     "tags": ["new", "tags"]
   }
   ```

5. **Delete Discussion**
   ```
   DELETE /api/forum/discussions/:discussionId
   ```

6. **Like/Unlike Discussion**
   ```
   POST /api/forum/discussions/:discussionId/like
   ```

7. **Pin/Unpin Discussion (Mentor only)**
   ```
   POST /api/forum/discussions/:discussionId/pin
   ```

8. **Lock/Unlock Discussion (Mentor only)**
   ```
   POST /api/forum/discussions/:discussionId/lock
   ```

9. **Mark Discussion as Resolved (Question author only)**
   ```
   POST /api/forum/discussions/:discussionId/resolve
   ```

10. **Search Discussions**
    ```
    GET /api/forum/course/:courseId/discussions/search?q=search-term
    ```

11. **Get User's Discussions**
    ```
    GET /api/forum/user/discussions?limit=10
    ```

### 💬 REPLIES

1. **Create Reply**
   ```
   POST /api/forum/discussions/:discussionId/replies
   Body: {
     "content": "Reply content",
     "parent_reply_id": "replyId (optional for nested reply)"
   }
   ```

2. **Update Reply**
   ```
   PUT /api/forum/replies/:replyId
   Body: {
     "content": "Updated reply content"
   }
   ```

3. **Delete Reply**
   ```
   DELETE /api/forum/replies/:replyId
   ```

4. **Like/Unlike Reply**
   ```
   POST /api/forum/replies/:replyId/like
   ```

5. **Mark as Best Answer (Question author only)**
   ```
   POST /api/forum/replies/:replyId/best-answer
   ```

6. **Unmark as Best Answer**
   ```
   DELETE /api/forum/replies/:replyId/best-answer
   ```

7. **Get Nested Replies**
   ```
   GET /api/forum/replies/:replyId/nested?limit=10
   ```

8. **Get User's Replies**
   ```
   GET /api/forum/user/replies?limit=20
   ```

9. **Search Replies in Discussion**
   ```
   GET /api/forum/discussions/:discussionId/replies/search?q=search-term
   ```

## 🎯 FORUM FEATURES

### Discussion Types:
- **general**: General discussion
- **question**: Q&A with best answer feature
- **announcement**: Important announcements (mentor only)
- **material_discussion**: Discussion about specific material

### Discussion Status:
- **Pinned**: Important discussions shown at top
- **Locked**: No new replies allowed
- **Resolved**: Questions marked as answered

### Interactions:
- **Like/Unlike**: Like discussions and replies
- **Nested Replies**: Reply to specific replies (2-level deep)
- **Best Answer**: Mark helpful replies as best answers
- **Mentions**: @username mentions in replies
- **Search**: Full-text search across discussions and replies

### Permissions:
- **Learners**: Create discussions, reply, like, mark own questions as resolved
- **Mentors**: All learner permissions + pin, lock, delete any discussion/reply
- **Authors**: Edit/delete own content

### Sorting Options:
- **last_reply**: Most recently active discussions
- **newest**: Newest discussions first
- **oldest**: Oldest discussions first
- **most_replies**: Most discussed topics
- **most_liked**: Most popular discussions

### Pagination:
- Default: 20 discussions per page, 50 replies per page
- Customizable via query parameters

## 📊 RESPONSE EXAMPLES

### Get Course Discussions Response:
```json
{
  "success": true,
  "message": "Discussions retrieved successfully",
  "data": {
    "discussions": [
      {
        "_id": "discussionId",
        "title": "How to implement authentication?",
        "content": "I'm having trouble with JWT...",
        "type": "question",
        "author_id": {
          "fullname": "John Doe",
          "username": "johndoe",
          "avatar": "avatar-url"
        },
        "is_pinned": false,
        "is_locked": false,
        "is_resolved": false,
        "reply_count": 5,
        "like_count": 3,
        "view_count": 25,
        "tags": ["jwt", "auth"],
        "created_at": "2024-01-01T10:00:00Z",
        "last_reply_at": "2024-01-01T15:30:00Z",
        "type_badge": "❓ Question",
        "formatted_date": "Jan 1, 2024, 10:00 AM"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_discussions": 45,
      "has_next": true,
      "has_previous": false
    }
  }
}
```

### Get Discussion with Replies Response:
```json
{
  "success": true,
  "message": "Discussion retrieved successfully",
  "data": {
    "discussion": {
      "_id": "discussionId",
      "title": "How to implement authentication?",
      "content": "I'm having trouble with JWT...",
      "is_liked": false,
      "like_count": 3,
      "reply_count": 5,
      "view_count": 26
    },
    "replies": [
      {
        "_id": "replyId",
        "content": "You should use bcrypt for password hashing...",
        "author_id": {
          "fullname": "Jane Smith",
          "username": "janesmith",
          "role": "mentor"
        },
        "is_best_answer": true,
        "like_count": 8,
        "created_at": "2024-01-01T12:00:00Z",
        "nested_replies": [
          {
            "_id": "nestedReplyId",
            "content": "Great explanation! Thanks",
            "author_id": {
              "fullname": "John Doe",
              "username": "johndoe"
            }
          }
        ]
      }
    ],
    "user_permissions": {
      "can_reply": true,
      "can_edit": true,
      "can_delete": false,
      "can_moderate": false
    }
  }
}
```

## 🔧 IMPLEMENTATION NOTES

### Database Indexes:
- Optimized for course-based queries
- Text search indexes for content search
- Compound indexes for sorting and filtering

### Security:
- All endpoints require authentication
- Course enrollment validation
- Permission-based actions (edit, delete, moderate)

### Performance:
- Pagination for large datasets
- Populate only necessary user fields
- Efficient aggregation queries for stats

### User Experience:
- Real-time interaction feedback
- Intuitive sorting and filtering
- Mobile-friendly response structure
- Rich metadata for UI rendering

*/

// Test Data Examples for Postman/Thunder Client

const TEST_DATA = {
  // Create Discussion
  createDiscussion: {
    title: "Cara implement pagination yang efisien?",
    content: "Halo semuanya! Saya sedang belajar tentang pagination di backend. Apakah ada best practice untuk implement pagination yang efisien untuk data yang besar?",
    type: "question",
    tags: ["pagination", "backend", "database"],
  },

  // Create Reply
  createReply: {
    content:
      "Saya suggest pakai cursor-based pagination untuk data yang besar. Lebih efisien daripada offset-based pagination.\n\nBeberapa keuntungannya:\n1. Performa konsisten\n2. Tidak ada duplicate data saat real-time updates\n3. Lebih scalable\n\nKamu bisa pakai field `created_at` atau `_id` sebagai cursor.",
  },

  // Create Nested Reply
  createNestedReply: {
    content: "Terima kasih penjelasannya! Bisa kasih contoh implementasinya ga?",
    parent_reply_id: "replyId", // Replace with actual reply ID
  },

  // Update Discussion
  updateDiscussion: {
    title: "Cara implement pagination yang efisien? [SOLVED]",
    content: "Halo semuanya! Saya sedang belajar tentang pagination di backend. Apakah ada best practice untuk implement pagination yang efisien untuk data yang besar?\n\n**UPDATE**: Sudah dapat solusinya, terima kasih semuanya!",
    tags: ["pagination", "backend", "database", "solved"],
  },
};

export default TEST_DATA;
