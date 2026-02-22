# Backend2 API cURL Commands

Import these commands into Postman by clicking "Import" -> "Raw Text".

---

## Authentication

### Register
```bash
curl -X POST http://127.0.0.1:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "mobile": "1234567890",
    "age": 25
  }'
```

### Login
```bash
curl -X POST http://127.0.0.1:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Current User (Me)
```bash
curl -X GET http://127.0.0.1:8787/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Courses

### List All Courses
```bash
curl -X GET http://127.0.0.1:8787/api/courses
```

### Create Course (JSON - No Files)
```bash
curl -X POST http://127.0.0.1:8787/api/courses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Trading Basics",
    "description": "Learn the fundamentals",
    "price": 0
  }'
```

### 🆕 Create Course with File Uploads (form-data)
**In Postman:**
1. Set method to `POST`
2. URL: `http://127.0.0.1:8787/api/courses/with-media`
3. Headers: `Authorization: Bearer YOUR_TOKEN`
4. Body → `form-data`:
   - `title` (text): Course Title
   - `description` (text): Course Description
   - `price` (text): 4999
   - `files` (file): Select one or more files
   - `is_private` (text): false

```bash
curl -X POST http://127.0.0.1:8787/api/courses/with-media \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Advanced Trading" \
  -F "description=Master advanced techniques" \
  -F "price=4999" \
  -F "files=@/path/to/image1.jpg" \
  -F "files=@/path/to/video.mp4" \
  -F "is_private=false"
```

### 🆕 Upload Files to Existing Course (form-data)
**In Postman:**
1. Set method to `POST`
2. URL: `http://127.0.0.1:8787/api/courses/COURSE_ID/media`
3. Headers: `Authorization: Bearer YOUR_TOKEN`
4. Body → `form-data`:
   - `files` (file): Select one or more files
   - `is_private` (text): false

```bash
curl -X POST http://127.0.0.1:8787/api/courses/COURSE_UUID/media \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@/path/to/file1.jpg" \
  -F "files=@/path/to/file2.pdf" \
  -F "is_private=false"
```

### Purchase Course
```bash
curl -X POST http://127.0.0.1:8787/api/courses/purchase \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"course_id": "COURSE_UUID"}'
```

---

## Blogs

### List Published Blogs
```bash
curl -X GET http://127.0.0.1:8787/api/blogs
```

### Create Blog (JSON - No Files)
```bash
curl -X POST http://127.0.0.1:8787/api/blogs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Market Analysis",
    "content": "<p>Detailed analysis...</p>",
    "is_published": true
  }'
```

### 🆕 Create Blog with File Uploads (form-data)
**In Postman:**
1. Set method to `POST`
2. URL: `http://127.0.0.1:8787/api/blogs/with-media`
3. Headers: `Authorization: Bearer YOUR_TOKEN`
4. Body → `form-data`:
   - `title` (text): Blog Title
   - `content` (text): Blog HTML content
   - `is_published` (text): true
   - `files` (file): Select one or more files
   - `is_private` (text): false

```bash
curl -X POST http://127.0.0.1:8787/api/blogs/with-media \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Market Analysis 2024" \
  -F "content=<p>Detailed market analysis...</p>" \
  -F "is_published=true" \
  -F "files=@/path/to/cover.jpg" \
  -F "files=@/path/to/chart.png" \
  -F "is_private=false"
```

### 🆕 Upload Files to Existing Blog (form-data)
**In Postman:**
1. Set method to `POST`
2. URL: `http://127.0.0.1:8787/api/blogs/BLOG_ID/media`
3. Headers: `Authorization: Bearer YOUR_TOKEN`
4. Body → `form-data`:
   - `files` (file): Select one or more files
   - `is_private` (text): false

```bash
curl -X POST http://127.0.0.1:8787/api/blogs/BLOG_UUID/media \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@/path/to/image.jpg" \
  -F "is_private=false"
```

---

## Media (ImageKit)

### Get Auth Params (for client-side upload)
```bash
curl -X GET http://127.0.0.1:8787/api/media/auth \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Register Uploaded Media (after client upload)
```bash
curl -X POST http://127.0.0.1:8787/api/media \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "file_key": "imagekit_file_id",
    "owner_type": "course",
    "owner_id": "COURSE_UUID",
    "asset_type": "image",
    "is_private": false
  }'
```

---

## Payments

### Create Payment Record
```bash
curl -X POST http://127.0.0.1:8787/api/payments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "COURSE_UUID",
    "amount": 4999,
    "payment_gateway": "razorpay",
    "transaction_id": "pay_123456789"
  }'
```

---

## Users (Admin)

### List All Users
```bash
curl -X GET http://127.0.0.1:8787/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Assign Role
```bash
curl -X POST http://127.0.0.1:8787/api/users/roles/assign \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "USER_UUID",
    "role_id": 1
  }'
```
