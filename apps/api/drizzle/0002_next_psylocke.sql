ALTER TABLE `wiring_diagrams` ADD `connection` text;--> statement-breakpoint
ALTER TABLE `wiring_diagrams` DROP COLUMN `serial`;--> statement-breakpoint
ALTER TABLE `wiring_diagrams` DROP COLUMN `parallel`;