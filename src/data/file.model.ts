export class DBFile {
	ext: string = undefined as any;
	type: string = undefined as any;
	name: string = undefined as any;
}

export class ApplicationFile extends DBFile {
	content: Buffer = undefined as any;
}

