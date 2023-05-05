import { Controller, Get, NotFoundException, Param, Post, Put, Res, StreamableFile, UploadedFile, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ObjectId } from 'mongodb';
import { AppService } from './app.service';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Post('/')
	@UseInterceptors(FileInterceptor('file'))
	public async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<ObjectId> {
		return this.appService.createFile(file);
	}

	@Get('/favicon.ico')
	public getFavicon(): never {
		throw new NotFoundException('No favicon :P');
	}

	@Get('/:id')
	public async getFile(
		@Param('id', new ValidationPipe({ expectedType: String })) id: string,
		@Res({ passthrough: true }) res: Response
	): Promise<StreamableFile> {
		const file = await this.appService.getFile(id);

		res.set({
			'Content-Type': file.type,
			'Content-Disposition': `attachment; filename="${file.name}"`
		});

		return new StreamableFile(file.content);
	}

	@Put('/:id')
	@UseInterceptors(FileInterceptor('file'))
	public async putFile(
		@Param('id', new ValidationPipe({ expectedType: String })) id: string,
		@UploadedFile() file: Express.Multer.File,
		@Res({ passthrough: true }) res: Response
	): Promise<StreamableFile> {
		const newFile = await this.appService.updateFile(id, file);

		res.set({
			'Content-Type': newFile.type,
			'Content-Disposition': `attachment; filename="${newFile.name}"`
		});

		return new StreamableFile(newFile.content);
	}
}

