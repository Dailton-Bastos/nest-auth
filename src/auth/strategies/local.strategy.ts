/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */

import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { AuthService } from '../auth.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
	constructor(private readonly authService: AuthService) {
		super({
			usernameField: 'email',
			passwordField: 'password'
		})
	}

	async validate(email: string, password: string) {
		return this.authService.verifyUserWithEmailAndPassword({
			email,
			password
		})
	}
}
