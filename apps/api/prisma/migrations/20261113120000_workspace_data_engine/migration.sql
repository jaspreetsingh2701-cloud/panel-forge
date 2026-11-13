CREATE TYPE "InvitationStatus" AS ENUM ('PENDING','ACCEPTED','REVOKED');
CREATE TYPE "ResourceStatus" AS ENUM ('ACTIVE','ARCHIVED');
CREATE TYPE "ResourceFieldType" AS ENUM ('TEXT','NUMBER','BOOLEAN','DATE','SELECT','RELATION');
CREATE TABLE "workspace_invitations" (
 "id" UUID NOT NULL,"tenant_id" UUID NOT NULL,"email" VARCHAR(320) NOT NULL,
 "role" "TenantRole" NOT NULL DEFAULT 'MEMBER',"status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
 "expires_at" TIMESTAMPTZ(6) NOT NULL,"created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updated_at" TIMESTAMPTZ(6) NOT NULL,CONSTRAINT "workspace_invitations_pkey" PRIMARY KEY("id"));
CREATE INDEX "workspace_invitations_tenant_id_status_created_at_idx" ON "workspace_invitations"("tenant_id","status","created_at");
CREATE INDEX "workspace_invitations_tenant_id_email_status_idx" ON "workspace_invitations"("tenant_id","email","status");
ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_tenant_id_fkey" FOREIGN KEY("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE TABLE "resources" (
 "id" UUID NOT NULL,"tenant_id" UUID NOT NULL,"application_id" UUID NOT NULL,"name" VARCHAR(80) NOT NULL,
 "key" VARCHAR(64) NOT NULL,"description" VARCHAR(240),"status" "ResourceStatus" NOT NULL DEFAULT 'ACTIVE',
 "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updated_at" TIMESTAMPTZ(6) NOT NULL,
 CONSTRAINT "resources_pkey" PRIMARY KEY("id"));
CREATE UNIQUE INDEX "resources_application_id_key_key" ON "resources"("application_id","key");
CREATE INDEX "resources_tenant_id_application_id_status_idx" ON "resources"("tenant_id","application_id","status");
ALTER TABLE "resources" ADD CONSTRAINT "resources_tenant_id_fkey" FOREIGN KEY("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "resources" ADD CONSTRAINT "resources_application_id_fkey" FOREIGN KEY("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE TABLE "resource_fields" (
 "id" UUID NOT NULL,"resource_id" UUID NOT NULL,"name" VARCHAR(80) NOT NULL,"key" VARCHAR(64) NOT NULL,
 "type" "ResourceFieldType" NOT NULL,"required" BOOLEAN NOT NULL DEFAULT false,"options" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
 "relation_resource_id" UUID,"position" INTEGER NOT NULL DEFAULT 0,
 "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updated_at" TIMESTAMPTZ(6) NOT NULL,
 CONSTRAINT "resource_fields_pkey" PRIMARY KEY("id"));
CREATE UNIQUE INDEX "resource_fields_resource_id_key_key" ON "resource_fields"("resource_id","key");
CREATE INDEX "resource_fields_relation_resource_id_idx" ON "resource_fields"("relation_resource_id");
ALTER TABLE "resource_fields" ADD CONSTRAINT "resource_fields_resource_id_fkey" FOREIGN KEY("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "resource_fields" ADD CONSTRAINT "resource_fields_relation_resource_id_fkey" FOREIGN KEY("relation_resource_id") REFERENCES "resources"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE TABLE "dynamic_records" (
 "id" UUID NOT NULL,"resource_id" UUID NOT NULL,"data" JSONB NOT NULL,
 "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updated_at" TIMESTAMPTZ(6) NOT NULL,
 CONSTRAINT "dynamic_records_pkey" PRIMARY KEY("id"));
CREATE INDEX "dynamic_records_resource_id_updated_at_idx" ON "dynamic_records"("resource_id","updated_at");
ALTER TABLE "dynamic_records" ADD CONSTRAINT "dynamic_records_resource_id_fkey" FOREIGN KEY("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;