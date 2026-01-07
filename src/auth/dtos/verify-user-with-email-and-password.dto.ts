import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class VerifyUserWithEmailAndPasswordDto {
	@IsNotEmpty()
	@IsEmail()
	email: string

	@IsNotEmpty()
	@IsString()
	password: string
}
