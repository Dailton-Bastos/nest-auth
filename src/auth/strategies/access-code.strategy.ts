/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { AuthService } from '../auth.service'

@Injectable()
export class AccessCodeStrategy extends PassportStrategy(
	Strategy,
	'access-code'
) {
	constructor(private readonly authService: AuthService) {
		super({
			usernameField: 'email',
			passwordField: 'code'
		})
	}

	async validate(email: string, code: string) {
		return this.authService.verifyAccessKey({ email, code })
	}
}
