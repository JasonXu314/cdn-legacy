import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Knex, knex } from 'knex';

@Injectable()
export class FilesService {
	private readonly _db: Knex;

	constructor() {
		this._db = knex({
			client: 'mysql2',
			connection: process.env.MAIN_DATABASE_DSN || {
				host: '127.0.0.1',
				port: 3306,
				user: 'root',
				password: process.env.DB_PASS,
				database: 'cdn'
			}
		});
	}

	public async getFileById(id: string): Promise<Buffer> {
		const file = await this._db.select('id', 'content').from('files').where({ id }).first();

		if (!file) {
			throw new NotFoundException(`No file found with id ${id}`);
		}

		return Buffer.from(file.content, 'base64');
	}

	public async createFile(id: string, data: Buffer): Promise<Buffer> {
		const file = await this._db.insert({ id, content: data.toString('base64') }).into('files');

		if (!file) {
			throw new InternalServerErrorException('Unable to create file');
		}

		return data;
	}

	public async replaceFile(id: string, data: Buffer): Promise<Buffer> {
		const file = await this._db('files')
			.update({ content: data.toString('base64') })
			.where({ id });

		if (!file) {
			throw new NotFoundException(`No file found with id ${id}`);
		}

		return data;
	}
}

