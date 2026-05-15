CREATE TYPE "public"."promo_status" AS ENUM('draft', 'scheduled', 'active', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."promo_type" AS ENUM('daily_special', 'happy_hour', 'event', 'announcement', 'advertisement', 'seasonal');--> statement-breakpoint
CREATE TABLE "client_features" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"feature_key" varchar(100) NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"config" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"file_name" varchar(500) NOT NULL,
	"file_type" varchar(50) NOT NULL,
	"mime_type" varchar(100),
	"file_size" integer,
	"url" text,
	"xibo_media_id" integer,
	"tags" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promos" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"promo_type" "promo_type" DEFAULT 'daily_special' NOT NULL,
	"status" "promo_status" DEFAULT 'draft' NOT NULL,
	"image_url" text,
	"video_url" text,
	"start_date" date,
	"end_date" date,
	"start_time" varchar(10),
	"end_time" varchar(10),
	"days_of_week" varchar(50),
	"location_id" integer,
	"all_locations" boolean DEFAULT true NOT NULL,
	"xibo_layout_id" integer,
	"xibo_schedule_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "client_features" ADD CONSTRAINT "client_features_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promos" ADD CONSTRAINT "promos_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promos" ADD CONSTRAINT "promos_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;