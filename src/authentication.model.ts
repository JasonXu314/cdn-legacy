import { IsString } from 'class-validator';

export class AuthTokenDTO {
	@IsString()
	token: string = undefined as any;
}
