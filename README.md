# Eclair Admin Portal

A production-ready admin web portal for managing educational stage lighting content. This frontend connects to a Spring Boot REST API backend that manages concepts, sections, and content items for a mobile learning app.

## Features

- ✅ **Authentication**: Secure JWT-based login with token management
- ✅ **Concept Management**: Create, read, update, and delete educational concepts
- ✅ **Rich Content Editing**: Markdown editor with MDXEditor (to be fully integrated)
- ✅ **Drag-and-Drop**: Reorder sections and content items (to be fully integrated)
- ✅ **Nested Data Structures**: Manage hierarchical content (Concept → Sections → Content Items)
- ✅ **Password Management**: Change password functionality
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile
- ✅ **Environment Configuration**: Separate dev/production settings
- ✅ **Production Ready**: Deployment configs for Vercel, Netlify, Cloudflare Pages

## Tech Stack

### Core
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing

### State & Data
- **TanStack Query (React Query) v5** - Server state management
- **Axios** - HTTP client with interceptors
- **React Hook Form** - Form state management
- **Zod** - Schema validation

### UI & Styling
- **Tailwind CSS 3** - Utility-first CSS
- **shadcn/ui** - Component library
- **Lucide React** - Icon system
- **Sonner** - Toast notifications

### Planned Integrations
- **MDXEditor** - Professional markdown editor
- **@dnd-kit** - Drag-and-drop system
- **React Markdown** - Markdown rendering
- **rehype-highlight** - Code syntax highlighting

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Access to the backend API (development or production)

## Installation

1. **Clone the repository** (or extract the files):
   ```bash
   cd eclair_admin_portal
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:

   The project includes `.env.development` for local development:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api/v1
   VITE_APP_ENV=development
   ```

   For production, set these environment variables in your hosting provider:
   ```env
   VITE_API_BASE_URL=https://eclair-admin-server-production-b1b2.up.railway.app/api/v1
   VITE_APP_ENV=production
   ```

## Development

### Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Type Checking:
```bash
npm run type-check
```

### Linting:
```bash
npm run lint
```

## Building for Production

```bash
npm run build
```

This creates optimized production files in the `dist/` directory.

### Preview Production Build:
```bash
npm run preview
```

## Deployment

### Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Environment Variables** (set in Vercel dashboard):
   - `VITE_API_BASE_URL`: `https://eclair-admin-server-production-b1b2.up.railway.app/api/v1`
   - `VITE_APP_ENV`: `production`


## API Integration

### Backend Endpoints

**Base URL**:
- Development: `http://localhost:8080/api/v1`
- Production: `https://eclair-admin-server-production-b1b2.up.railway.app/api/v1`

### Authentication

**Login**:
```typescript
POST /auth/login
Body: { username: string, password: string }
Response: { token: string, username: string, role: string }
```

**Change Password**:
```typescript
PATCH /admin/users/me/password
Headers: { Authorization: Bearer {token} }
Body: { currentPassword: string, newPassword: string }
Response: { message: string, username: string }
```

### Concepts

**Get All Concepts** (Admin):
```typescript
GET /admin/concepts
Headers: { Authorization: Bearer {token} }
Response: ConceptListItem[]
```

**Get Concept by ID**:
```typescript
GET /admin/concepts/{id}
Headers: { Authorization: Bearer {token} }
Response: Concept
```

**Create Concept**:
```typescript
POST /admin/concepts
Headers: { Authorization: Bearer {token} }
Body: ConceptRequest
Response: Concept
```

**Update Concept**:
```typescript
PATCH /admin/concepts/{id}
Headers: { Authorization: Bearer {token} }
Body: ConceptRequest
Response: Concept
```

**Delete Concept**:
```typescript
DELETE /admin/concepts/{id}
Headers: { Authorization: Bearer {token} }
Response: 204 No Content
```

## Data Structure

### Concept Structure

```typescript
interface ConceptRequest {
  title: string;                    // Required, max 200 chars
  description?: string;             // Optional, max 1000 chars
  displayOrder?: number;            // Optional, positive integer
  published?: boolean;              // Optional, default false
  sections?: SectionRequest[];      // Optional, array of sections
}

interface SectionRequest {
  heading: string;                  // Required, max 200 chars
  displayOrder?: number;            // Optional, positive integer
  content: ContentItemRequest[];    // Required, min 1 item
}

interface ContentItemRequest {
  type: 'text' | 'image';          // Lowercase!
  value: string;                    // Markdown text or image URL
  displayOrder?: number;            // Optional, positive integer
}
```

## Current Implementation Status

### ✅ Fully Implemented
- Project setup and configuration
- TypeScript types and interfaces
- API layer with environment configuration
- Authentication flow (login, logout, protected routes)
- React Query hooks for data fetching
- Dashboard with statistics
- Concepts list with search and filtering
- Concept view page with markdown rendering
- Password change functionality
- Layout and navigation
- Core UI components
- Form validation with Zod
- Error handling and toast notifications
- Deployment configuration
- Image URL input with preview
- Autosave functionality
- Nested form state management
- Drag-and-drop for sections and content
- MDXEditor integration


## Environment Variables Reference

| Variable | Development | Production | Description |
|----------|------------|------------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8080/api/v1` | `https://eclair-admin-server-production-b1b2.up.railway.app/api/v1` | Backend API base URL |
| `VITE_APP_ENV` | `development` | `production` | Environment name |

```

## Contributing

This is an internal admin tool. Changes are not accepted at the moment. However, feel free to glean the code and setup.

---

**Version**: 1.0.0
**Last Updated**: 2025-11-18
**Status**: MVP Complete
