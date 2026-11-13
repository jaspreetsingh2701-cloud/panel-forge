-- Grant the initial platform administrator explicitly.
-- Run from the repository root:
-- psql "$DATABASE_URL" -v super_admin_email='admin@example.com' -f apps/api/prisma/scripts/grant-super-admin.sql
-- This script intentionally updates only an existing account and never creates users.
\if :{?super_admin_email}
UPDATE "users"
SET "platform_role" = 'SUPER_ADMIN'
WHERE lower("email") = lower(:'super_admin_email');
\else
\echo 'Missing required -v super_admin_email=...'
\quit 2
\endif
