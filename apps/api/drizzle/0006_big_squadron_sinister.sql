DROP INDEX `switch_types_name_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `switch_types_name_manufacturer_unique` ON `switch_types` (`name`,`manufacturer_id`);--> statement-breakpoint
INSERT OR IGNORE INTO `manufacturers` (`name`, `country`, `website`) VALUES ('Schaller', 'Germany', 'https://www.schaller.info');--> statement-breakpoint
UPDATE `switch_types` SET `name` = trim(replace(`name`, ' Schaller', '')), `manufacturer_id` = (SELECT `id` FROM `manufacturers` WHERE `name` = 'Schaller') WHERE `name` LIKE '% Schaller';
