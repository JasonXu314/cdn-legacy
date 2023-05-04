import { Injectable, Logger } from '@nestjs/common';
import { ReadStream, createReadStream, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'fs';

@Injectable()
export class FSService {
	private _logger: Logger = new Logger('FS Service');

	public ensureDir(path: string): boolean {
		try {
			if (!existsSync(path)) {
				mkdirSync(path);
			}
			return true;
		} catch (err) {
			this._logger.error(err);
			return false;
		}
	}

	public exists(path: string): boolean {
		try {
			return existsSync(path);
		} catch (err) {
			this._logger.error(err);
			return false;
		}
	}

	public isFile(path: string): boolean {
		try {
			if (this.exists(path)) {
				const stats = statSync(path);

				return stats.isFile();
			} else {
				return false;
			}
		} catch (err) {
			this._logger.error(err);
			return false;
		}
	}

	public readDir(path: string): string[] {
		try {
			return readdirSync(path);
		} catch (err) {
			this._logger.log(err);
			throw new Error('Unable to create read stream');
		}
	}

	public readFile(path: string): Buffer {
		try {
			return readFileSync(path);
		} catch (err) {
			this._logger.log(err);
			throw new Error('Unable to create read stream');
		}
	}

	public readFileAsStream(path: string): ReadStream {
		try {
			return createReadStream(path);
		} catch (err) {
			this._logger.log(err);
			throw new Error('Unable to create read stream');
		}
	}

	public deleteFile(path: string): boolean {
		try {
			rmSync(path);
			return true;
		} catch (err) {
			this._logger.error(err);
			return false;
		}
	}

	public writeFile(path: string, data: Express.Multer.File | Buffer | string): boolean {
		try {
			if (typeof data === 'string') {
				writeFileSync(path, data);
				return true;
			} else if (Buffer.isBuffer(data)) {
				writeFileSync(path, data);
				return true;
			} else {
				writeFileSync(path, data.buffer);
				return true;
			}
		} catch (err) {
			this._logger.error(err);
			return false;
		}
	}

	public getExtension(path: string): string {
		const ext = path.split('.').at(-1);

		if (!ext) {
			throw new Error(`Bad path ${path}; has no extension`);
		}

		return ext;
	}
}

