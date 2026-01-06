/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import type { ConfigType } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'
import cookieConfig from 'src/common/config/cookie.config'
import jwtRefreshConfig from 'src/common/config/jwt-refresh.config'
import { AuthService } from '../auth.service'

interface RequestWithRefreshToken extends Request {
	cookies: {
		Refresh: string
	}
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
	Strategy,
	'jwt-refresh'
) {
	constructor(
		private readonly authService: AuthService,
		@Inject(cookieConfig.KEY)
		private readonly cookieConfiguration: ConfigType<typeof cookieConfig>,
		@Inject(jwtRefreshConfig.KEY)
		readonly jwtRefreshConfiguration: ConfigType<typeof jwtRefreshConfig>
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(req: RequestWithRefreshToken) => {
					return this.extractRefreshTokenFromRequest(req)
				}
			]),
			secretOrKey: jwtRefreshConfiguration.secret,
			passReqToCallback: true
		})
	}

	async validate(req: RequestWithRefreshToken) {
		const refreshToken = this.extractRefreshTokenFromRequest(req)

		if (!refreshToken) {
			throw new UnauthorizedException('refresh token not found')
		}

		return this.authService.verifyRefreshToken({
			refreshToken
		})
	}

	private extractRefreshTokenFromRequest(req: RequestWithRefreshToken): string {
		const cookie = (req.cookies?.[this.cookieConfiguration.refreshToken.name] ??
			'') as string

		return cookie
	}
}
