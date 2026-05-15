CREATE TABLE "menu_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"template_style" varchar(50) DEFAULT 'classic' NOT NULL,
	"primary_color" varchar(20) DEFAULT '#dc2626' NOT NULL,
	"secondary_color" varchar(20) DEFAULT '#1a1a1a' NOT NULL,
	"accent_color" varchar(20) DEFAULT '#fbbf24' NOT NULL,
	"text_color" varchar(20) DEFAULT '#ffffff' NOT NULL,
	"font_family" varchar(100) DEFAULT 'Inter' NOT NULL,
	"logo_url" text,
	"background_image_url" text,
	"show_prices" boolean DEFAULT true NOT NULL,
	"show_descriptions" boolean DEFAULT true NOT NULL,
	"show_images" boolean DEFAULT true NOT NULL,
	"columns" integer DEFAULT 2 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "menu_templates" ADD CONSTRAINT "menu_templates_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;