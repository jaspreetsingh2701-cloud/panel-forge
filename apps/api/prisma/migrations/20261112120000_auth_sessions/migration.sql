-- Add custom-authentication fields and tenant-scoped roles.
CREATE TYPE "TenantRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

ALTER TABLE "users"
  ADD COLUMN "password_hash" VARCHAR(255),
  ADD COLUMN "email_verified_at" TIMESTAMPTZ(6);

ALTER TABLE "tenant_members"
  ADD COLUMN "role" "TenantRole" NOT NULL DEFAULT 'MEMBER';

-- A session represents one browser/device login. Revocation is soft so the
-- session and token history remain available for replay detection/auditing.
CREATE TABLE "auth_sessions" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "user_agent" VARCHAR(512),
  "ip_address" VARCHAR(45),
  "last_used_at" TIMESTAMPTZ(6),
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "revoked_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- Persist only a SHA-256 hex digest of the high-entropy refresh token.
-- Consumed rows are retained so reuse can be detected and the session revoked.
CREATE TABLE "refresh_tokens" (
  "id" UUID NOT NULL,
  "session_id" UUID NOT NULL,
  "token_hash" CHAR(64) NOT NULL,
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "consumed_at" TIMESTAMPTZ(6),
  "revoked_at" TIMESTAMPTZ(6),
  "rotated_to_token_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "refresh_tokens_token_hash_key"
  ON "refresh_tokens"("token_hash");
CREATE UNIQUE INDEX "refresh_tokens_rotated_to_token_id_key"
  ON "refresh_tokens"("rotated_to_token_id");
CREATE INDEX "auth_sessions_user_id_revoked_at_idx"
  ON "auth_sessions"("user_id", "revoked_at");
CREATE INDEX "auth_sessions_expires_at_idx"
  ON "auth_sessions"("expires_at");
CREATE INDEX "refresh_tokens_session_id_expires_at_idx"
  ON "refresh_tokens"("session_id", "expires_at");
CREATE INDEX "refresh_tokens_consumed_at_idx"
  ON "refresh_tokens"("consumed_at");

ALTER TABLE "auth_sessions"
  ADD CONSTRAINT "auth_sessions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "refresh_tokens"
  ADD CONSTRAINT "refresh_tokens_session_id_fkey"
  FOREIGN KEY ("session_id") REFERENCES "auth_sessions"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "refresh_tokens"
  ADD CONSTRAINT "refresh_tokens_rotated_to_token_id_fkey"
  FOREIGN KEY ("rotated_to_token_id") REFERENCES "refresh_tokens"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
