DROP TABLE `wiring_diagram_pots`;--> statement-breakpoint
ALTER TABLE `wiring_diagrams` ADD `volume_pot_count` integer;--> statement-breakpoint
ALTER TABLE `wiring_diagrams` ADD `volume_pot1_type_id` integer REFERENCES potentiometer_types(id);--> statement-breakpoint
ALTER TABLE `wiring_diagrams` ADD `volume_pot1_function` text;--> statement-breakpoint
ALTER TABLE `wiring_diagrams` ADD `volume_pot2_type_id` integer REFERENCES potentiometer_types(id);--> statement-breakpoint
ALTER TABLE `wiring_diagrams` ADD `volume_pot2_function` text;--> statement-breakpoint
ALTER TABLE `wiring_diagrams` ADD `volume_pot3_type_id` integer REFERENCES potentiometer_types(id);--> statement-breakpoint
ALTER TABLE `wiring_diagrams` ADD `volume_pot3_function` text;--> statement-breakpoint
ALTER TABLE `wiring_diagrams` ADD `tone_pot_count` integer;--> statement-breakpoint
ALTER TABLE `wiring_diagrams` ADD `tone_pot1_type_id` integer REFERENCES potentiometer_types(id);--> statement-breakpoint
ALTER TABLE `wiring_diagrams` ADD `tone_pot1_function` text;--> statement-breakpoint
ALTER TABLE `wiring_diagrams` ADD `tone_pot2_type_id` integer REFERENCES potentiometer_types(id);--> statement-breakpoint
ALTER TABLE `wiring_diagrams` ADD `tone_pot2_function` text;--> statement-breakpoint
ALTER TABLE `wiring_diagrams` ADD `tone_pot3_type_id` integer REFERENCES potentiometer_types(id);--> statement-breakpoint
ALTER TABLE `wiring_diagrams` ADD `tone_pot3_function` text;