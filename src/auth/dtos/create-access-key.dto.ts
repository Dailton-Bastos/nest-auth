import { IsEmail, IsNotEmpty } from 'class-validator'

export class CreateAccessKeyDto {
	@IsEmail()
	@IsNotEmpty()
	email: string
}
