/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */
import { Inject, Injectable } from '@nestjs/common'
import type { ConfigType } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'
import cookieConfig from 'src/common/config/cookie.config'
import { jwtConstants } from 'src/common/constants'
import type { TokenPayload } from 'src/common/interfaces/token-payload.interface'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		private readonly usersService: UsersService,
		@Inject(cookieConfig.KEY)
		private readonly cookieConfiguration: ConfigType<typeof cookieConfig>
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(req: Request & { cookies: { Authentication: string } }) => {
					return this.extractAccessTokenFromRequest(req)
				}
			]),
			ignoreExpiration: false,
			secretOrKey: jwtConstants.secret
		})
	}

	async validate(payload: TokenPayload) {
		return this.usersService.findById(payload.userId)
	}

	private extractAccessTokenFromRequest(
		req: Request & { cookies: { [key: string]: string } }
	): string | null {
		const authorizationHeader = req.headers?.authorization?.split(' ')[1] ?? ''

		const cookie =
			req.cookies?.[this.cookieConfiguration.accessToken.name] ?? ''

		return cookie || authorizationHeader
	}
}
