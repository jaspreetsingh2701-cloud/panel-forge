CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'ARCHIVED');
CREATE TABLE "applications" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "name" VARCHAR(80) NOT NULL,
  "description" VARCHAR(240),
  "template" VARCHAR(32) NOT NULL DEFAULT 'blank',
  "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "applications_tenant_id_status_updated_at_idx" ON "applications"("tenant_id", "status", "updated_at");
ALTER TABLE "applications" ADD CONSTRAINT "applications_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;