CREATE TABLE `attachments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner` text NOT NULL,
	`owner_id` integer NOT NULL,
	`file_name` text NOT NULL,
	`stored_name` text NOT NULL,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`caption` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attachments_storedName_unique` ON `attachments` (`stored_name`);--> statement-breakpoint
CREATE INDEX `attachments_owner_idx` ON `attachments` (`owner`,`owner_id`);--> statement-breakpoint
CREATE TABLE `manufacturers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`country` text,
	`website` text,
	`notes` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `manufacturers_name_unique` ON `manufacturers` (`name`);--> statement-breakpoint
CREATE TABLE `pickup_sets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`manufacturer_id` integer,
	`neck_id` integer,
	`middle_id` integer,
	`bridge_id` integer,
	`description` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`manufacturer_id`) REFERENCES `manufacturers`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`neck_id`) REFERENCES `pickups`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`middle_id`) REFERENCES `pickups`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`bridge_id`) REFERENCES `pickups`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `pickups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`manufacturer_id` integer,
	`year` integer,
	`type` text,
	`position` text,
	`activity` text,
	`instrument` text,
	`string_count` integer,
	`resistance` real,
	`coil_tap_at` real,
	`inductance` real,
	`gauss` real,
	`tesla` real,
	`output` text,
	`output_mv` real,
	`balanced` integer,
	`magnetic_direction` text,
	`magnet_count` integer,
	`first_coil_winds` integer,
	`second_coil_winds` integer,
	`winding_direction` text,
	`winding_method` text,
	`magnet_type` text,
	`potted` integer,
	`potting_type` text,
	`wire_type` text,
	`insulation_type` text,
	`insulation_color` text,
	`connection_type` text,
	`separable` integer,
	`output_wire_count` integer,
	`adjustable_core` integer,
	`carrier_type` text,
	`cap_material` text,
	`information_source` text,
	`source_mark` integer,
	`web_link` text,
	`autocad_link` text,
	`description` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`manufacturer_id`) REFERENCES `manufacturers`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `pickups_manufacturer_idx` ON `pickups` (`manufacturer_id`);--> statement-breakpoint
CREATE TABLE `potentiometer_types` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `potentiometer_types_name_unique` ON `potentiometer_types` (`name`);--> statement-breakpoint
CREATE TABLE `switch_types` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `switch_types_name_unique` ON `switch_types` (`name`);--> statement-breakpoint
CREATE TABLE `wiring_diagram_pots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`diagram_id` integer NOT NULL,
	`pot_type_id` integer NOT NULL,
	`role` text NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`diagram_id`) REFERENCES `wiring_diagrams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`pot_type_id`) REFERENCES `potentiometer_types`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `wiring_diagram_pots_diagram_idx` ON `wiring_diagram_pots` (`diagram_id`);--> statement-breakpoint
CREATE TABLE `wiring_diagram_switches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`diagram_id` integer NOT NULL,
	`switch_type_id` integer NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`diagram_id`) REFERENCES `wiring_diagrams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`switch_type_id`) REFERENCES `switch_types`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `wiring_diagram_switches_diagram_idx` ON `wiring_diagram_switches` (`diagram_id`);--> statement-breakpoint
CREATE TABLE `wiring_diagrams` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`manufacturer_id` integer,
	`wiring_type` text,
	`pickup_count` integer,
	`neck` text,
	`middle` text,
	`bridge` text,
	`phase_reversible` integer,
	`split_coil` integer,
	`serial` integer,
	`parallel` integer,
	`description` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`manufacturer_id`) REFERENCES `manufacturers`(`id`) ON UPDATE no action ON DELETE set null
);
