import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, StreamableFile } from '@nestjs/common';
import * as JSZip from 'jszip';
import { ObjectId } from 'mongodb';
import { DBService } from './db.service';
import { ApplicationFile } from './file.model';
import { FSService } from './fs.service';

@Injectable()
export class AppService {
	private _logger: Logger = new Logger('CDN Service');

	constructor(private fs: FSService, private db: DBService) {
		fs.ensureDir('assets');
	}

	public async createFile(file: Express.Multer.File): Promise<ObjectId> {
		try {
			const id = await this.db.storeFile({ name: file.originalname, type: file.mimetype, ext: this.fs.getExtension(file.originalname) });

			if (this.fs.writeFile(`assets/${id}.${this.fs.getExtension(file.originalname)}`, file)) {
				return id;
			} else {
				throw new InternalServerErrorException('Unable to save file');
			}
		} catch (err) {
			this._logger.error(err);
			throw new InternalServerErrorException('Unable to save file');
		}
	}

	public async getFile(id: string): Promise<ApplicationFile> {
		try {
			const metadata = await this.db.getMetadata(id);

			if (!metadata) {
				throw new NotFoundException(`File with id ${id} not found`);
			}

			const fileName = `${id}.${metadata.ext}`;

			if (!this.fs.isFile(`assets/${fileName}`)) {
				throw new InternalServerErrorException(`File with id ${id} found in DB, but not present on disk`);
			}

			const stream = this.fs.readFileAsStream(`assets/${fileName}`);

			return { ...metadata, stream };
		} catch (err) {
			this._logger.error(err);
			throw new InternalServerErrorException(`Failed to read file ${id}: ${err}`);
		}
	}

	public async updateFile(id: string, file: Express.Multer.File): Promise<ApplicationFile> {
		try {
			const metadata = await this.db.getMetadata(id);

			if (!metadata) {
				throw new NotFoundException(`File with id ${id} not found`);
			}

			const newMetadata = await this.db.updateFile(id, { name: file.originalname, type: file.mimetype, ext: this.fs.getExtension(file.originalname) });

			if (!newMetadata) {
				throw new InternalServerErrorException('Unable to update file metadata');
			}

			const fileName = `${id}.${newMetadata.ext}`;
			const stream = this.fs.readFileAsStream(`assets/${fileName}`);

			return { ...newMetadata, stream };
		} catch (err) {
			this._logger.error(err);
			throw new InternalServerErrorException(`Failed to read file ${id}: ${err}`);
		}
	}

	public async export(): Promise<StreamableFile> {
		try {
			const files = this.fs.readDir('assets');
			const zip = new JSZip();

			files.forEach((file) => {
				zip.file(file, this.fs.readFile(`assets/${file}`));
			});

			return new StreamableFile(await zip.generateAsync({ type: 'uint8array' }));
		} catch (err) {
			this._logger.error(err);
			throw new InternalServerErrorException(`Failed to export files: ${err}`);
		}
	}

	public async load(file: Express.Multer.File): Promise<string> {
		try {
			const zip = await JSZip.loadAsync(file.buffer);

			for (const path in zip.files) {
				if (!/\w{24}.\w+/.test(path)) {
					throw new BadRequestException(`Invalid file path in zip: ${path}`);
				}

				const file = zip.files[path];

				this.fs.writeFile(`assets/${path}`, await file.async('nodebuffer'));
			}

			return 'Success';
		} catch (err) {
			this._logger.error(err);
			return 'Failure';
		}
	}
}

