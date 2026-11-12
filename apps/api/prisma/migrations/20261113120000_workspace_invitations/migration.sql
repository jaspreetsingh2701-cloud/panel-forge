CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED');
CREATE TABLE "workspace_invitations" (
 "id" UUID NOT NULL, "tenant_id" UUID NOT NULL, "email" VARCHAR(320) NOT NULL,
 "role" "TenantRole" NOT NULL DEFAULT 'MEMBER', "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
 "expires_at" TIMESTAMPTZ(6) NOT NULL, "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updated_at" TIMESTAMPTZ(6) NOT NULL, CONSTRAINT "workspace_invitations_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "workspace_invitations_tenant_id_status_created_at_idx" ON "workspace_invitations"("tenant_id", "status", "created_at");
CREATE INDEX "workspace_invitations_tenant_id_email_status_idx" ON "workspace_invitations"("tenant_id", "email", "status");
ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_tenant_id_fkey"
 FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;