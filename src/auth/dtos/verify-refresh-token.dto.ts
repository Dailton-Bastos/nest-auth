import { IsNotEmpty, IsString } from 'class-validator'

export class VerifyRefreshTokenDto {
	@IsString()
	@IsNotEmpty()
	refreshToken: string
}
