import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  varchar,
  pgEnum,
  boolean,
  numeric,
  date,
} from "drizzle-orm/pg-core";

export const screenOrientationEnum = pgEnum("screen_orientation", [
  "landscape",
  "portrait",
]);

export const changeRequestStatusEnum = pgEnum("change_request_status", [
  "pending",
  "in_progress",
  "completed",
  "rejected",
]);

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  clerkOrgId: varchar("clerk_org_id", { length: 255 }),
  clerkUserId: varchar("clerk_user_id", { length: 255 }),
  xiboUserGroupId: integer("xibo_user_group_id"),
  xiboFolderId: integer("xibo_folder_id"),
  xiboMenuBoardId: integer("xibo_menu_board_id"),
  contactName: varchar("contact_name", { length: 255 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id")
    .references(() => clients.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  networkType: varchar("network_type", { length: 50 }),
  contactName: varchar("contact_name", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  xiboDisplayGroupId: integer("xibo_display_group_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const screens = pgTable("screens", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id")
    .references(() => locations.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  hostname: varchar("hostname", { length: 255 }),
  displayType: varchar("display_type", { length: 100 }),
  orientation: screenOrientationEnum("orientation").default("landscape"),
  xiboDisplayId: integer("xibo_display_id"),
  xiboDisplayGroupId: integer("xibo_display_group_id"),
  rustdeskId: varchar("rustdesk_id", { length: 50 }),
  tvModel: varchar("tv_model", { length: 255 }),
  isOnline: integer("is_online").default(0),
  lastCheckIn: timestamp("last_check_in"),
  installedAt: timestamp("installed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const changeRequests = pgTable("change_requests", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id")
    .references(() => clients.id, { onDelete: "cascade" })
    .notNull(),
  locationId: integer("location_id").references(() => locations.id),
  requestedBy: varchar("requested_by", { length: 255 }).notNull(),
  description: text("description").notNull(),
  status: changeRequestStatusEnum("status").default("pending").notNull(),
  attachments: text("attachments"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

// --- Menu Board Tables (client self-service) ---

export const menuCategories = pgTable("menu_categories", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id")
    .references(() => clients.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
  xiboMenuBoardCategoryId: integer("xibo_menu_board_category_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .references(() => menuCategories.id, { onDelete: "cascade" })
    .notNull(),
  clientId: integer("client_id")
    .references(() => clients.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  isVisible: boolean("is_visible").default(true).notNull(),
  isNew: boolean("is_new").default(false).notNull(),
  allergens: text("allergens"),
  sortOrder: integer("sort_order").default(0).notNull(),
  xiboMenuBoardProductId: integer("xibo_menu_board_product_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- Media Library (client uploads) ---

export const mediaAssets = pgTable("media_assets", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id")
    .references(() => clients.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  fileName: varchar("file_name", { length: 500 }).notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(), // image, video
  mimeType: varchar("mime_type", { length: 100 }),
  fileSize: integer("file_size"), // bytes
  url: text("url"), // CDN or local URL
  xiboMediaId: integer("xibo_media_id"),
  tags: text("tags"), // comma-separated
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Promos & Specials ---

export const promoStatusEnum = pgEnum("promo_status", [
  "draft",
  "scheduled",
  "active",
  "expired",
  "cancelled",
]);

export const promoTypeEnum = pgEnum("promo_type", [
  "daily_special",
  "happy_hour",
  "event",
  "announcement",
  "advertisement",
  "seasonal",
]);

export const promos = pgTable("promos", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id")
    .references(() => clients.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  promoType: promoTypeEnum("promo_type").default("daily_special").notNull(),
  status: promoStatusEnum("status").default("draft").notNull(),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  // Scheduling
  startDate: date("start_date"),
  endDate: date("end_date"),
  startTime: varchar("start_time", { length: 10 }), // "16:00"
  endTime: varchar("end_time", { length: 10 }),       // "19:00"
  daysOfWeek: varchar("days_of_week", { length: 50 }), // "mon,tue,wed,thu,fri"
  // Display targeting
  locationId: integer("location_id").references(() => locations.id),
  allLocations: boolean("all_locations").default(true).notNull(),
  // Xibo integration
  xiboLayoutId: integer("xibo_layout_id"),
  xiboScheduleId: integer("xibo_schedule_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- Client Feature Permissions ---

export const clientFeatures = pgTable("client_features", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id")
    .references(() => clients.id, { onDelete: "cascade" })
    .notNull(),
  featureKey: varchar("feature_key", { length: 100 }).notNull(),
  enabled: boolean("enabled").default(false).notNull(),
  config: text("config"), // JSON string for feature-specific settings
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Feature keys:
// "menu_editor"       — can edit menu items/prices
// "86_board"          — can 86 items
// "media_upload"      — can upload images/videos
// "promo_creator"     — can create promos/specials
// "schedule_viewer"   — can view content schedule
// "display_status"    — can see screen online/offline
// "change_requests"   — can submit change requests
// "analytics"         — can view display analytics (future)
// "multi_location"    — can manage multiple locations (future)
