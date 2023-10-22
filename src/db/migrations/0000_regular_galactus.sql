CREATE TABLE IF NOT EXISTS "sticker_set" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"title" text,
	"format" varchar,
	"timestamp3" timestamp DEFAULT now()
);
