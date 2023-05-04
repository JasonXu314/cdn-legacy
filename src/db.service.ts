import { Injectable, Logger } from '@nestjs/common';
import { MongoClient, ObjectId } from 'mongodb';
import { DBFile } from './file.model';

@Injectable()
export class DBService {
	private _db: Promise<MongoClient>;
	private _logger: Logger = new Logger('DB Service');

	constructor() {
		this._db = MongoClient.connect(process.env.MONGODB_URL!).then((client) => {
			this._logger.log('Connected to DB');
			return client;
		});
	}

	public async storeFile(data: DBFile): Promise<ObjectId> {
		return (await (await this._db).db('main').collection<DBFile>('files').insertOne(data)).insertedId;
	}

	public async getMetadata(id: string): Promise<DBFile | null> {
		return (await this._db)
			.db('main')
			.collection<DBFile>('files')
			.findOne({ _id: ObjectId.createFromHexString(id) });
	}
}

