# Backend2 - Cloudflare Workers API

Cloudflare Workers backend API for Hyderabad Traders with Supabase database and ImageKit media storage.

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
# Copy wrangler.toml and update with your credentials

# Run development server
npm run dev

# Deploy to Cloudflare
npm run deploy
```

## Configuration

### Local Development

Update `wrangler.toml` with your credentials:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `JWT_SECRET` - Secret for JWT signing (min 32 chars)
- `IMAGEKIT_URL_ENDPOINT` - ImageKit URL endpoint
- `IMAGEKIT_PUBLIC_KEY` - ImageKit public key
- `IMAGEKIT_PRIVATE_KEY` - ImageKit private key

### Production Secrets

```bash
wrangler secret put JWT_SECRET
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put IMAGEKIT_PRIVATE_KEY
```

## API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login & get token |
| POST | `/api/auth/forgot-password` | Public | Password reset |
| GET | `/api/auth/me` | Required | Current user profile |

### Users
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/users` | Required | admin | List all users |
| GET | `/api/users/:id` | Required | owner/admin | Get user |
| PUT | `/api/users/:id` | Required | owner/admin | Update user |
| DELETE | `/api/users/:id` | Required | admin | Deactivate user |
| POST | `/api/users/roles/assign` | Required | admin | Assign role |
| POST | `/api/users/roles/remove` | Required | admin | Remove role |
| GET | `/api/roles` | Required | admin | List roles |

### Courses
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/courses` | Public | List courses (filter: `is_paid`) |
| GET | `/api/courses/:id` | Public | Get course with media |
| POST | `/api/courses` | Required | Create course (admin/instructor) |
| PUT | `/api/courses/:id` | Required | Update course |
| DELETE | `/api/courses/:id` | Required | Delete course |
| POST | `/api/courses/purchase` | Required | Purchase/enroll in course |
| GET | `/api/users/:id/courses` | Required | User's enrolled courses |

### Blogs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/blogs` | Public | List published blogs |
| GET | `/api/blogs/:id` | Public | Get blog with media |
| POST | `/api/blogs` | Required | Create blog (admin/author) |
| PUT | `/api/blogs/:id` | Required | Update blog |
| DELETE | `/api/blogs/:id` | Required | Delete blog |
| GET | `/api/blogs/my` | Required | User's blogs (inc. drafts) |

### Media (ImageKit)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/media/auth` | Required | Get ImageKit auth params |
| POST | `/api/media` | Required | Register uploaded media |
| POST | `/api/media/upload` | Required | Server-side upload |
| GET | `/api/media` | Required | List media |
| DELETE | `/api/media/:id` | Required | Delete media |

### Payments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/payments` | Required | List payments (admin) |
| POST | `/api/payments` | Required | Create payment |
| GET | `/api/payments/:id` | Required | Get payment |
| PUT | `/api/payments/:id` | Required | Update status (admin) |
| GET | `/api/users/:id/payments` | Required | User's payments |

## Roles

- **admin** - Full access
- **student** - Default role, can purchase courses
- **instructor** - Can create/manage courses
- **author** - Can create/manage blogs

## Request/Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

### Authentication Header
```
Authorization: Bearer <jwt_token>
```
