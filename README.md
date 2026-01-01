# Verisite Backend

Complete NestJS backend for the Verisite platform serving Admin Dashboard, Field Ops Dashboard, and Client/Developer Mobile App.

## Tech Stack

- **Framework**: NestJS (latest stable) + TypeScript
- **Database**: PostgreSQL + TypeORM
- **Authentication**: JWT with refresh token rotation
- **File Storage**: Linode Object Storage (S3-compatible)
- **Payments**: Paystack integration
- **Real-time**: Socket.io for WebSockets
- **Documentation**: Swagger/OpenAPI

## Project Structure

```
src/
  app.module.ts
  main.ts
  config/          # Configuration files
  common/          # Shared utilities, guards, decorators, filters
  contracts/       # Frontend contract enums
  auth/            # Authentication module
  users/           # Users management
  projects/        # Projects CRUD
  assignments/     # Field assignments
  milestones/      # Project milestones
  reports/         # Field reports
  conversations/   # Chat conversations
  messages/        # Messages
  notifications/   # Notifications
  dashboard/       # Dashboard stats
  settings/        # User settings
  escrow/          # Escrow management
  wallet/          # Wallet operations
  developers/      # Developer profiles
  reviews/         # Reviews
  upload/           # File upload service
  paystack/         # Paystack integration
  health/           # Health check
  database/
    entities/       # TypeORM entities
    migrations/     # Database migrations
    seeds/          # Seed scripts
```

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Linode Object Storage account (or S3-compatible storage)
- Paystack account (for payments)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env` and fill in your configuration:
```bash
cp .env.example .env
```

4. Update `.env` with your database, S3, and Paystack credentials

5. Run migrations:
```bash
npm run migration:run
```

6. Seed the database (optional):
```bash
npm run seed
```

7. Start the development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/api/v1`
Swagger documentation at `http://localhost:3000/api/docs`

## Docker

### Using Docker Compose

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- NestJS application

### Building Docker Image

```bash
docker build -t verisite-backend .
```

## API Endpoints

All endpoints are prefixed with `/api/v1`

### Authentication (`/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout
- `POST /auth/logout-all` - Logout all sessions
- `POST /auth/change-password` - Change password
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `POST /auth/send-otp` - Send OTP
- `POST /auth/verify-otp` - Verify OTP

### Users (`/users`)
- `GET /users` - List users (paginated)
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user (Admin only)
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user (soft delete)
- `GET /users/profile` - Get current user profile
- `PATCH /users/profile` - Update profile
- `POST /users/upload-avatar` - Upload avatar

### Projects (`/projects`)
- `GET /projects` - List projects
- `GET /projects/:id` - Get project details
- `POST /projects` - Create project
- `PATCH /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `GET /projects/stats` - Get project statistics
- `POST /projects/:id/assign-developer` - Assign developer
- `POST /projects/:id/accept` - Accept project (Developer)
- `POST /projects/:id/reject` - Reject project (Developer)

### Assignments (`/assignments`)
- `GET /assignments` - List assignments
- `GET /assignments/:id` - Get assignment
- `POST /assignments` - Create assignment
- `PATCH /assignments/:id` - Update assignment
- `DELETE /assignments/:id` - Delete assignment

### Reports (`/reports`)
- `GET /reports` - List reports
- `GET /reports/:id` - Get report details
- `POST /reports` - Create report (with media upload)
- `POST /reports/:id/upload-media` - Upload report media
- `PUT /reports/:id` - Update report
- `POST /reports/:id/submit` - Submit report
- `PATCH /reports/:id/approve` - Approve report
- `PATCH /reports/:id/reject` - Reject report

### Wallet (`/wallet`)
- `GET /wallet` - Get wallet balance
- `GET /wallet/transactions` - Get transactions
- `POST /wallet/deposit` - Initiate deposit (Paystack)
- `POST /wallet/deposit/verify` - Verify deposit
- `POST /wallet/withdraw` - Request withdrawal

### Escrow (`/escrow`)
- `GET /escrow` - List escrow transactions
- `POST /escrow/transfers` - Create transfer
- `POST /escrow/withdrawals` - Create withdrawal
- `PATCH /escrow/transfers/:id/approve` - Approve transfer
- `PATCH /escrow/withdrawals/:id/approve` - Approve withdrawal

## Roles

- **ADMIN**: Full system access
- **PROJECT_MANAGER**: Manage projects and field ops
- **FIELD_OPS**: Field operators, create reports
- **DEVELOPER**: Accept/reject projects, manage developer profile
- **CLIENT**: Create projects, manage wallet, reviews

## Database Migrations

### Generate Migration
```bash
npm run migration:generate -- -n MigrationName
```

### Run Migrations
```bash
npm run migration:run
```

### Revert Migration
```bash
npm run migration:revert
```

## Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Coverage
```bash
npm run test:cov
```

## Environment Variables

See `.env.example` for all required environment variables.

## License

UNLICENSED

