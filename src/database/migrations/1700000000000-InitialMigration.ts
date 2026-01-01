import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enums
    await queryRunner.query(`
      CREATE TYPE user_role_enum AS ENUM ('ADMIN', 'PROJECT_MANAGER', 'FIELD_OPS', 'DEVELOPER', 'CLIENT');
      CREATE TYPE user_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'DELETED');
      CREATE TYPE project_status_enum AS ENUM ('ONGOING', 'COMPLETED', 'PENDING_REVIEW', 'APPROVED', 'REJECTED');
      CREATE TYPE developer_acceptance_status_enum AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');
      CREATE TYPE milestone_name_enum AS ENUM ('FOUNDATION', 'ROOFING', 'BUILDING', 'FINISHING', 'PLUMBING', 'PAINTING');
      CREATE TYPE milestone_status_enum AS ENUM ('PENDING', 'ONGOING', 'COMPLETED');
      CREATE TYPE assignment_status_enum AS ENUM ('PENDING', 'ONGOING', 'COMPLETED');
      CREATE TYPE report_status_enum AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CONFIRMED', 'FLAGGED');
      CREATE TYPE media_type_enum AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT');
      CREATE TYPE notification_type_enum AS ENUM ('USER', 'PAYMENT', 'ORDER', 'MILESTONE', 'MESSAGE', 'REPORT', 'ASSIGNMENT');
      CREATE TYPE transaction_type_enum AS ENUM ('DEPOSIT', 'RELEASE', 'SUBSCRIPTION', 'WITHDRAWAL', 'TRANSFER');
      CREATE TYPE transaction_status_enum AS ENUM ('PENDING', 'COMPLETED', 'FAILED');
      CREATE TYPE escrow_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
      CREATE TYPE document_type_enum AS ENUM ('PLAN', 'FINAL', 'OTHER');
      CREATE TYPE message_type_enum AS ENUM ('TEXT', 'VOICE', 'FILE', 'IMAGE');
      CREATE TYPE payment_method_type_enum AS ENUM ('CARD', 'ACCOUNT');
    `);

    // Users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "fullName" varchar NOT NULL,
        "email" varchar UNIQUE NOT NULL,
        "password_hash" varchar NOT NULL,
        "phoneNumber" varchar,
        "location" varchar,
        "avatarUrl" varchar,
        "language" varchar DEFAULT 'english',
        "timezone" varchar DEFAULT 'GMT+1',
        "role" user_role_enum NOT NULL,
        "status" user_status_enum DEFAULT 'PENDING',
        "isVerified" boolean DEFAULT false,
        "isActive" boolean DEFAULT true,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now(),
        "deletedAt" timestamp
      );
      CREATE INDEX "IDX_users_email" ON "users" ("email");
      CREATE INDEX "IDX_users_role" ON "users" ("role");
      CREATE INDEX "IDX_users_status" ON "users" ("status");
    `);

    // Refresh tokens
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "token_hash" varchar NOT NULL,
        "expires_at" timestamp NOT NULL,
        "revoked_at" timestamp,
        "createdAt" timestamp DEFAULT now()
      );
      CREATE INDEX "IDX_refresh_tokens_user_id" ON "refresh_tokens" ("user_id");
      CREATE INDEX "IDX_refresh_tokens_expires_at" ON "refresh_tokens" ("expires_at");
    `);

    // Projects
    await queryRunner.query(`
      CREATE TABLE "projects" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "description" text,
        "typeOfConstruction" varchar,
        "city" varchar,
        "location" varchar,
        "status" project_status_enum DEFAULT 'PENDING_REVIEW',
        "progress" decimal(5,2) DEFAULT 0,
        "client_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "developer_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "field_ops_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "developerAcceptanceStatus" developer_acceptance_status_enum DEFAULT 'PENDING',
        "developer_accepted_at" timestamp,
        "developer_rejected_at" timestamp,
        "developer_rejection_reason" text,
        "cover_image_url" varchar,
        "due_date" timestamp,
        "start_date" timestamp,
        "end_date" timestamp,
        "note" text,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now(),
        "deletedAt" timestamp
      );
      CREATE INDEX "IDX_projects_status" ON "projects" ("status");
      CREATE INDEX "IDX_projects_client_id" ON "projects" ("client_id");
      CREATE INDEX "IDX_projects_developer_id" ON "projects" ("developer_id");
      CREATE INDEX "IDX_projects_field_ops_id" ON "projects" ("field_ops_id");
      CREATE INDEX "IDX_projects_location" ON "projects" ("location");
      CREATE INDEX "IDX_projects_created_at" ON "projects" ("createdAt");
    `);

    // Continue with other tables...
    // Note: This is a simplified migration. In production, you should generate migrations using TypeORM CLI
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "projects" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
    
    // Drop enums
    await queryRunner.query(`DROP TYPE IF EXISTS payment_method_type_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS message_type_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS document_type_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS escrow_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS transaction_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS transaction_type_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS notification_type_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS media_type_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS report_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS assignment_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS milestone_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS milestone_name_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS developer_acceptance_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS project_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_role_enum`);
  }
}

