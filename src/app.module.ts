import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DBService } from './db.service';
import { FSService } from './fs.service';

@Module({
	imports: [],
	controllers: [AppController],
	providers: [AppService, FSService, DBService]
})
export class AppModule {}

