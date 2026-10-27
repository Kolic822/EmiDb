CREATE TABLE `pot_layouts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`roles` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pot_layouts_name_unique` ON `pot_layouts` (`name`);--> statement-breakpoint
ALTER TABLE `switch_types` ADD `manufacturer_id` integer REFERENCES manufacturers(id);--> statement-breakpoint
INSERT OR IGNORE INTO `pot_layouts` (`name`, `roles`) VALUES
  ('1 volume', '["VOLUME"]'),
  ('Volume + tone', '["VOLUME", "TONE"]'),
  ('Volume + 2 tones (Strat)', '["VOLUME", "TONE", "TONE"]'),
  ('2 volumes + tone (Jazz Bass)', '["VOLUME", "VOLUME", "TONE"]'),
  ('2 volumes + 2 tones (Les Paul)', '["VOLUME", "VOLUME", "TONE", "TONE"]'),
  ('3 volumes + tone', '["VOLUME", "VOLUME", "VOLUME", "TONE"]');
