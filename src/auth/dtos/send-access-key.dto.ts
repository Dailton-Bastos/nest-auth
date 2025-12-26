import { IsEmail, IsNotEmpty } from 'class-validator'

export class SendAccessKeyDto {
	@IsEmail()
	@IsNotEmpty()
	email: string
}
