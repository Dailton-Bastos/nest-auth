/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */
import {
	BadRequestException,
	ConflictException,
	Inject,
	Injectable
} from '@nestjs/common'
import type { ConfigType } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import type { Response } from 'express'
import { AccessKeyService } from 'src/access-key/access-key.service'
import cookieConfig from 'src/common/config/cookie.config'
import jwtRefreshConfig from 'src/common/config/jwt-refresh.config'
import type { TokenPayload } from 'src/common/interfaces/token-payload.interface'
import { User } from 'src/users/entities/user.entity'
import { UsersService } from 'src/users/users.service'
import { SendAccessKeyDto } from './dtos/send-access-key.dto'
import { SignupDto } from './dtos/signup.dto'
import { VerifyAccessKeyDto } from './dtos/verify-access-key.dto'

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly accessKeyService: AccessKeyService,
		private readonly jwtService: JwtService,
		@Inject(cookieConfig.KEY)
		private readonly cookieConfiguration: ConfigType<typeof cookieConfig>,
		@Inject(jwtRefreshConfig.KEY)
		private readonly jwtRefreshConfiguration: ConfigType<
			typeof jwtRefreshConfig
		>
	) {}

	async signup(signupDto: SignupDto) {
		const existingUser = await this.usersService.findByEmail(signupDto.email)

		if (existingUser) {
			throw new ConflictException('user already exists')
		}

		return this.usersService.create(signupDto)
	}

	async signin(user: User, res: Response) {
		const tokenPayload: TokenPayload = {
			userId: user.id,
			email: user.email
		}

		const [accessToken, refreshToken] = await Promise.all([
			this.jwtService.signAsync(tokenPayload),
			this.jwtService.signAsync(tokenPayload, {
				secret: this.jwtRefreshConfiguration.secret,
				expiresIn: this.jwtRefreshConfiguration.expiresIn
			})
		])

		await Promise.all([
			this.setAccessTokenCookie(accessToken, res),
			this.setRefreshTokenCookie(refreshToken, res)
		])

		return {
			accessToken,
			refreshToken
		}
	}

	async sendAccessKey(sendAccessKeyDto: SendAccessKeyDto) {
		if (!sendAccessKeyDto.email) {
			throw new BadRequestException('email is required')
		}

		return this.accessKeyService.create(sendAccessKeyDto)
	}

	async verifyAccessKey(verifyAccessKeyDto: VerifyAccessKeyDto) {
		await this.accessKeyService.verify(
			verifyAccessKeyDto.email,
			verifyAccessKeyDto.code
		)

		const existingUser = await this.usersService.findByEmail(
			verifyAccessKeyDto.email
		)

		if (existingUser) return existingUser

		return this.usersService.create({
			email: verifyAccessKeyDto.email
		})
	}

	private async setAccessTokenCookie(
		accessToken: string,
		res: Response
	): Promise<void> {
		const JWT_ACCESS_TOKEN_EXPIRATION_MS =
			this.cookieConfiguration.accessToken.expires

		const expires = new Date(Date.now() + JWT_ACCESS_TOKEN_EXPIRATION_MS * 1000)

		res.cookie(this.cookieConfiguration.accessToken.name, accessToken, {
			...this.cookieConfiguration.accessToken,
			expires
		})
	}

	private async setRefreshTokenCookie(
		refreshToken: string,
		res: Response
	): Promise<void> {
		const JWT_REFRESH_TOKEN_EXPIRATION_MS =
			this.jwtRefreshConfiguration.expiresIn

		const expires = new Date(
			Date.now() + JWT_REFRESH_TOKEN_EXPIRATION_MS * 1000
		)

		res.cookie(this.cookieConfiguration.refreshToken.name, refreshToken, {
			...this.cookieConfiguration.refreshToken,
			expires
		})
	}
}
