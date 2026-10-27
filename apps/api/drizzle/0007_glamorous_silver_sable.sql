DROP INDEX `manufacturers_name_unique`;--> statement-breakpoint
ALTER TABLE `manufacturers` ADD `deleted_at` text;--> statement-breakpoint
CREATE UNIQUE INDEX `manufacturers_name_unique` ON `manufacturers` (`name`) WHERE "manufacturers"."deleted_at" is null;--> statement-breakpoint
DROP INDEX `pot_layouts_name_unique`;--> statement-breakpoint
ALTER TABLE `pot_layouts` ADD `deleted_at` text;--> statement-breakpoint
CREATE UNIQUE INDEX `pot_layouts_name_unique` ON `pot_layouts` (`name`) WHERE "pot_layouts"."deleted_at" is null;--> statement-breakpoint
DROP INDEX `potentiometer_types_name_unique`;--> statement-breakpoint
ALTER TABLE `potentiometer_types` ADD `deleted_at` text;--> statement-breakpoint
CREATE UNIQUE INDEX `potentiometer_types_name_unique` ON `potentiometer_types` (`name`) WHERE "potentiometer_types"."deleted_at" is null;--> statement-breakpoint
DROP INDEX `switch_types_name_manufacturer_unique`;--> statement-breakpoint
ALTER TABLE `switch_types` ADD `deleted_at` text;--> statement-breakpoint
CREATE UNIQUE INDEX `switch_types_name_manufacturer_unique` ON `switch_types` (`name`,`manufacturer_id`) WHERE "switch_types"."deleted_at" is null;--> statement-breakpoint
DROP INDEX `wiring_pickup_types_name_unique`;--> statement-breakpoint
ALTER TABLE `wiring_pickup_types` ADD `deleted_at` text;--> statement-breakpoint
CREATE UNIQUE INDEX `wiring_pickup_types_name_unique` ON `wiring_pickup_types` (`name`) WHERE "wiring_pickup_types"."deleted_at" is null;--> statement-breakpoint
ALTER TABLE `pickup_sets` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `pickups` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `wiring_diagrams` ADD `deleted_at` text;