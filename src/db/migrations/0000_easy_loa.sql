CREATE TABLE IF NOT EXISTS "object_store" (
	"file_path" text PRIMARY KEY NOT NULL,
	"provider_url" text NOT NULL,
	"provider_emote" text NOT NULL,
	"format" varchar NOT NULL,
	"created_date" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sticker" (
	"id" serial PRIMARY KEY NOT NULL,
	"sticker_set_id" integer NOT NULL,
	"file_path" text,
	"file_id" text,
	"emoji" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sticker_set" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"format" varchar NOT NULL,
	"created_date" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id_idx" ON "sticker_set" ("user_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sticker" ADD CONSTRAINT "sticker_sticker_set_id_sticker_set_id_fk" FOREIGN KEY ("sticker_set_id") REFERENCES "sticker_set"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sticker" ADD CONSTRAINT "sticker_file_path_object_store_file_path_fk" FOREIGN KEY ("file_path") REFERENCES "object_store"("file_path") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
