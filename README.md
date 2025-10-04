# Sales CRM Authentication & RBAC System

This project delivers a full-stack authentication and role-based access control (RBAC) solution for the Sales CRM application.

## Stack

- **Backend**: Node.js, Express, PostgreSQL (`backend/`)
- **Frontend**: React (Vite), Tailwind CSS, Axios (`frontend/`)

---

## Backend

### Environment Variables

Copy `backend/.env.example` to `backend/.env` and adjust values:

- `PORT`: API server port (default `4000`).
- `DATABASE_URL`: PostgreSQL connection string (e.g. `postgres://user:password@localhost:5432/sales_crm`).
- `JWT_SECRET`: Secret used to sign JWTs.
- `BCRYPT_SALT_ROUNDS`: Salt rounds for password hashing (`10` recommended).

### Database Migration

Run the initial migration to create tables, relationships, and indexes:

```bash
cd backend
npm install
npm run migrate
```

### Seed Initial Admin

Seed the default administrator (idempotent – safely rerunnable):

```bash
cd backend
npm run seed
```

The seed script creates baseline permissions/roles (if missing) and inserts `admin@example.com` with password `password123` only when the `users` table is empty.

### Development Server

```bash
cd backend
npm run dev
```

Key endpoints (`/api/...`):

- `POST /auth/login` — authenticate users (returns JWT + current user payload).
- `POST /auth/change-password` — authenticated users update their password securely.
- `POST /auth/forgot-password` — reset a password by email (admin seeding credentials, etc.).
- `GET /modules` — list application modules and available actions for RBAC matrices.
- `PUT /roles/:roleId/module-permissions` — replace module/action flags for a role.
- `GET /roles/:roleId/module-permissions` — retrieve the current module/action assignments for a role.
- `POST /users` — create user (requires `manage_users`).
- `GET /users/me` — fetch logged-in user with role & permissions.
- `POST /roles` — create role (requires `manage_roles`).
- `GET /roles` — list roles and assigned permissions (`manage_roles` or `manage_users`).
- `POST /permissions` — create permission (requires `manage_permissions`).
- `GET /permissions` — list permissions (`manage_permissions` or `manage_roles`).

---

## Frontend

### Environment Variables

Copy `frontend/.env.example` to `frontend/.env` and set the API base URL, e.g.:

```
VITE_API_BASE_URL=http://localhost:4000/api
```

### Module-Based Access Control

Run the migrations after pulling updates to ensure the new `role_module_permissions` table exists:

```bash
cd backend
npm run migrate
```

Then seed or update roles using the new module-permission endpoint. Super Admin accounts automatically bypass module gating.

### Development Server

```bash
cd frontend
npm install
npm run dev           # standard dev server
# or npm run dev:log  # mirrors output into errlog.txt for easier debugging
```

### UI Highlights

- Tailwind-powered layout enhanced with Ant Design components.
- Login screen with centered card, forgot-password flow, and modern styling.
- Dashboard reveals modules/actions depending on granted permissions.
- Admin panel (requires any admin permission) with:
  - Module permission matrix with dynamic role assignments.
  - Role creation and permission assignment.
  - User creation and role assignment.
- Persistent Redux state (Redux Toolkit + Redux Persist) caching API responses.
- Forms powered by React Hook Form + Yup with inline validation feedback.
- Sidebar navigation automatically hides modules when the logged-in role lacks `read` access (Super Admin bypass supported).
- Context-aware navigation, profile management, and toast-driven feedback.

---

## Suggested Workflow

1. Run migrations (`npm run migrate`).
2. Seed the default administrator (`npm run seed`).
3. Start the backend (`npm run dev`) and frontend (`npm run dev`).
4. Login with `admin@example.com / password123`, then manage additional users, roles, and permissions from the Admin Panel.
