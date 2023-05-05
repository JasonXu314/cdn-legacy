import { Module } from '@nestjs/common';
import { DBService } from './db.service';
import { FilesService } from './files.service';

@Module({
	imports: [],
	exports: [DBService, FilesService],
	providers: [DBService, FilesService]
})
export class DataModule {}
