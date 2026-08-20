CREATE TABLE `mensagens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sala_id` text NOT NULL,
	`participante_id` text NOT NULL,
	`corpo` text NOT NULL,
	`criada_em` integer NOT NULL,
	FOREIGN KEY (`sala_id`) REFERENCES `salas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`participante_id`) REFERENCES `participantes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_mensagens_sala` ON `mensagens` (`sala_id`,`criada_em`);--> statement-breakpoint
CREATE TABLE `participantes` (
	`id` text PRIMARY KEY NOT NULL,
	`nome` text NOT NULL,
	`avatar` blob NOT NULL,
	`avatar_mime` text NOT NULL,
	`criado_em` integer NOT NULL,
	`visto_em` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `salas` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`nome` text NOT NULL,
	`criada_em` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `salas_slug_unique` ON `salas` (`slug`);