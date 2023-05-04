import {
	Controller,
	FileTypeValidator,
	ForbiddenException,
	Get,
	NotFoundException,
	Param,
	ParseFilePipe,
	Post,
	Query,
	Res,
	StreamableFile,
	UnauthorizedException,
	UploadedFile,
	UseInterceptors,
	ValidationPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ObjectId } from 'mongodb';
import { AppService } from './app.service';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get('/admin')
	public adminPanel(@Query('token', new ValidationPipe({ expectedType: String })) token: string): string {
		if (token === undefined) {
			throw new UnauthorizedException();
		}

		if (token !== process.env.ACCESS_TOKEN) {
			throw new ForbiddenException();
		}

		return `
			<html>
				<head>
					<title>CDN Admin Panel</title>
					<script src="https://unpkg.com/axios@1.1.2/dist/axios.min.js"></script>
				</head>
				<body>
					<form action="/export" method="post" target="_blank">
						<input name="token" type="hidden" value="${token}" />
						<button type="submit">Export</button>
					</form>
					<form action="/load" method="post" target="_blank" enctype="multipart/form-data">
						<input name="zip" type="file" accept="application/zip" />
						<input name="token" type="hidden" value="${token}" />
						<button type="submit">Load</button>
					</form>
				</body>
			</html>
		`;
	}

	@Post('/export')
	public async exportFS(@Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
		res.set({
			'Content-Type': 'application/zip',
			'Content-Disposition': 'attachment; filename="fs.zip"'
		});

		return this.appService.export();
	}

	@Post('/load')
	@UseInterceptors(FileInterceptor('zip'))
	public async loadFS(
		@UploadedFile(new ParseFilePipe({ validators: [new FileTypeValidator({ fileType: /(application\/zip|application\/x-zip-compressed)/ })] }))
		file: Express.Multer.File
	): Promise<string> {
		return this.appService.load(file);
	}

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

		return new StreamableFile(file.stream);
	}
}

