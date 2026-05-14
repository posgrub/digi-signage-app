import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  varchar,
  pgEnum,
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
  xiboUserGroupId: integer("xibo_user_group_id"),
  xiboFolderId: integer("xibo_folder_id"),
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
