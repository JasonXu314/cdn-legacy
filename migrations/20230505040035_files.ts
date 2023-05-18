import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('files', (table) => {
		table.string('id').primary();
		table.text('content', 'longtext');
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable('files');
}

