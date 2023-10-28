CREATE TABLE IF NOT EXISTS "sticker" (
	"id" serial PRIMARY KEY NOT NULL,
	"sticker_set_id" integer,
	"provider_url" text,
	"provider_emote" text,
	"object_url" text,
	"file_id" text,
	"emoji" text,
	"format" varchar
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sticker" ADD CONSTRAINT "sticker_sticker_set_id_sticker_set_id_fk" FOREIGN KEY ("sticker_set_id") REFERENCES "sticker_set"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
