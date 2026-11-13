ALTER TABLE "applications"
  ADD COLUMN "page_config" JSONB,
  ADD COLUMN "builder_version" INTEGER NOT NULL DEFAULT 0;
