import {
	IsEmail,
	IsNotEmpty,
	IsString,
	MaxLength,
	MinLength
} from 'class-validator'

export class NewPasswordDto {
	@IsNotEmpty()
	@IsString()
	code: string

	@IsNotEmpty()
	@IsString()
	@MinLength(8)
	@MaxLength(32)
	newPassword: string

	@IsEmail()
	@IsNotEmpty()
	email: string
}
