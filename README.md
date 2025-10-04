# Sales CRM Platform

Full-stack CRM reference application with authentication, RBAC, custom-field management, and dynamic entity forms.

---

## Tech Stack

| Layer     | Stack |
|-----------|-------|
| Backend   | Node.js, Express, TypeScript, Prisma, PostgreSQL |
| Frontend  | React (Vite), TypeScript, Redux Toolkit + Persist, Ant Design |
| Auth      | JWT (role-based) |
| Storage   | AWS S3 for file uploads |

---

## Backend Setup

### Environment Variables (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default `4000`) |
| `DATABASE_URL` | Postgres connection string |
| `JWT_SECRET` | Secret for signing/verifying JWTs |
| `BCRYPT_SALT_ROUNDS` | Hash cost for passwords |
| `AWS_ACCESS_KEY_ID` | IAM access key for S3 |
| `AWS_SECRET_ACCESS_KEY` | IAM secret for S3 |
| `AWS_REGION` | AWS region containing the bucket |
| `S3_BUCKET` | S3 bucket used for uploads |

### Install & Migrate

```bash
cd backend
npm install
npm run migrate   # prisma migrate deploy (includes CustomFields + CustomFieldValues)
```

### Seed Initial Admin

```bash
npm run seed
# seeds admin@example.com/password123 if users table is empty
```

### Run Dev Server

```bash
npm run dev
```

### Key API Endpoints

- `POST /api/auth/login` – authenticate and receive JWT
- `GET /api/users/me` – current profile + permissions
- `POST /api/custom-fields` *(Admin only)* – create custom field
- `GET /api/custom-fields?entity=Lead` *(Admin only)* – list custom fields
- `PUT /api/custom-fields/:id` *(Admin only)* – update custom field
- `DELETE /api/custom-fields/:id` *(Admin only)* – delete custom field
- `POST /api/custom-fields/reorder` *(Admin only)* – reorder/group fields
- `GET /api/custom-field-values?entity=Lead&entityId=123` – fetch values for record
- `POST /api/custom-field-values` – create value after validation
- `PUT /api/custom-field-values/:id` – update value with validation
- `POST /api/uploads/sign` – presigned S3 upload URL (auth required)

#### Example

```bash
curl -X POST http://localhost:4000/api/custom-fields \
  -H "Authorization: Bearer <ADMIN_JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "entity": "Lead",
    "fieldType": "Text",
    "label": "Industry",
    "key": "industry",
    "required": false
  }'
```

---

## Frontend Setup

### Environment Variables (`frontend/.env`)

```
VITE_API_BASE_URL=http://localhost:4000/api
```

### Install & Run

```bash
cd frontend
npm install
npm run dev
# or npm run dev:log to mirror Vite output to errlog.txt
```

### Highlights

- Admin Settings ➜ Custom Fields: Ant Design table + drag & drop, modal editor.
- Dynamic entity forms render admin-configured fields with React Hook Form + Yup.
- Redux Toolkit slice caches fields per-entity (persisted between sessions).
- Auth-aware navigation hides modules for roles without `read` access.

---

## Testing

### Backend (Jest)

```bash
cd backend
npm run test
```

Covers:
- `validationJsonToYup` validation logic.
- Custom Fields API integration (Admin vs non-admin, CRUD basics).

### Frontend (Vitest/Jest)

```bash
cd frontend
npm run test
```

Validates the `validationJsonToYup` helper used to build dynamic Yup schemas.

---

## Suggested Workflow

1. Create `.env` files for backend & frontend.
2. `npm install` in both `backend/` and `frontend/`.
3. Run `npm run migrate` then `npm run seed` (backend).
4. Start backend (`npm run dev`) and frontend (`npm run dev`).
5. Login with `admin@example.com / password123`, configure custom fields under **Settings**, then use entity forms (Lead/Opportunity/etc.) to experience dynamic rendering.
