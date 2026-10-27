CREATE TABLE `wiring_pickup_types` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`instrument` text,
	`description` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wiring_pickup_types_name_unique` ON `wiring_pickup_types` (`name`);--> statement-breakpoint
ALTER TABLE `wiring_diagrams` ADD `neck_type_id` integer REFERENCES wiring_pickup_types(id);--> statement-breakpoint
ALTER TABLE `wiring_diagrams` ADD `middle_type_id` integer REFERENCES wiring_pickup_types(id);--> statement-breakpoint
ALTER TABLE `wiring_diagrams` ADD `bridge_type_id` integer REFERENCES wiring_pickup_types(id);--> statement-breakpoint
INSERT OR IGNORE INTO `wiring_pickup_types` (`name`, `instrument`) VALUES
  ('Active Single Coil', 'GUITAR'),
  ('Duckbucker', 'GUITAR'),
  ('Humbucker', 'GUITAR'),
  ('Single Coil', 'GUITAR'),
  ('Single Coil Humbucker', 'GUITAR'),
  ('Stack', 'GUITAR'),
  ('Strat Lipstick Tube', 'GUITAR'),
  ('Strat Lipstick Plus', 'GUITAR'),
  ('Blackouts', 'GUITAR'),
  ('Mandolin', 'GUITAR'),
  ('P-Rails', 'GUITAR'),
  ('Phat Cat', 'GUITAR'),
  ('Danelectro', 'GUITAR'),
  ('Dave Mustaine', 'GUITAR'),
  ('Duo Sonic', 'GUITAR'),
  ('Jaguar', 'GUITAR'),
  ('Jazzmaster', 'GUITAR'),
  ('Mini Humbucker', 'GUITAR'),
  ('Mustang', 'GUITAR'),
  ('P90', 'GUITAR'),
  ('P90 Stack', 'GUITAR'),
  ('Tele Humbucker', 'GUITAR'),
  ('Piezo', 'GUITAR'),
  ('Active P-Bass', 'BASS'),
  ('MusicMan', 'BASS'),
  ('P-Bass', 'BASS'),
  ('Active Jazz Bass', 'BASS'),
  ('Active Soapbar', 'BASS'),
  ('Blackouts Soapbar', 'BASS'),
  ('Jazz Bass', 'BASS'),
  ('Jazz Bass Stack', 'BASS'),
  ('Passive Soapbar', 'BASS'),
  ('Rickenbacker', 'BASS');--> statement-breakpoint
UPDATE `wiring_diagrams` SET `neck_type_id` = (SELECT id FROM `wiring_pickup_types` WHERE name = (CASE neck WHEN 'HUMBUCKER' THEN 'Humbucker' WHEN 'SINGLE_COIL' THEN 'Single Coil' WHEN 'SINGLE_COIL_HUMBUCKER' THEN 'Single Coil Humbucker' WHEN 'ACTIVE_SINGLE_COIL' THEN 'Active Single Coil' WHEN 'STACK' THEN 'Stack' WHEN 'STRAT_LIPSTICK_TUBE' THEN 'Strat Lipstick Tube' WHEN 'STRAT_STACK_PLUS' THEN 'Strat Lipstick Plus' END)) WHERE `neck` IS NOT NULL;--> statement-breakpoint
UPDATE `wiring_diagrams` SET `middle_type_id` = (SELECT id FROM `wiring_pickup_types` WHERE name = (CASE middle WHEN 'HUMBUCKER' THEN 'Humbucker' WHEN 'SINGLE_COIL' THEN 'Single Coil' WHEN 'SINGLE_COIL_HUMBUCKER' THEN 'Single Coil Humbucker' WHEN 'ACTIVE_SINGLE_COIL' THEN 'Active Single Coil' WHEN 'STACK' THEN 'Stack' WHEN 'STRAT_LIPSTICK_TUBE' THEN 'Strat Lipstick Tube' WHEN 'STRAT_STACK_PLUS' THEN 'Strat Lipstick Plus' END)) WHERE `middle` IS NOT NULL;--> statement-breakpoint
UPDATE `wiring_diagrams` SET `bridge_type_id` = (SELECT id FROM `wiring_pickup_types` WHERE name = (CASE bridge WHEN 'HUMBUCKER' THEN 'Humbucker' WHEN 'SINGLE_COIL' THEN 'Single Coil' WHEN 'SINGLE_COIL_HUMBUCKER' THEN 'Single Coil Humbucker' WHEN 'ACTIVE_SINGLE_COIL' THEN 'Active Single Coil' WHEN 'STACK' THEN 'Stack' WHEN 'STRAT_LIPSTICK_TUBE' THEN 'Strat Lipstick Tube' WHEN 'STRAT_STACK_PLUS' THEN 'Strat Lipstick Plus' END)) WHERE `bridge` IS NOT NULL;--> statement-breakpoint
ALTER TABLE `wiring_diagrams` DROP COLUMN `neck`;--> statement-breakpoint
ALTER TABLE `wiring_diagrams` DROP COLUMN `middle`;--> statement-breakpoint
ALTER TABLE `wiring_diagrams` DROP COLUMN `bridge`;