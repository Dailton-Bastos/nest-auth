import {
	IsEmail,
	IsNotEmpty,
	IsString,
	MaxLength,
	MinLength
} from 'class-validator'

export class VerifyAccessKeyDto {
	@IsEmail()
	@IsNotEmpty()
	email: string

	@IsString()
	@MinLength(6)
	@MaxLength(6)
	code: string
}
