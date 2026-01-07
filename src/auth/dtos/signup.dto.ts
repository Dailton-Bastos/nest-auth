import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	MinLength
} from 'class-validator'

export class SignupDto {
	@IsEmail()
	@IsNotEmpty()
	email: string

	@IsOptional()
	@IsNotEmpty()
	@IsString()
	@MinLength(8)
	@MaxLength(32)
	password?: string
}
