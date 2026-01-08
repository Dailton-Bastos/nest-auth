/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */
import {
	BadRequestException,
	ConflictException,
	Inject,
	Injectable,
	UnauthorizedException
} from '@nestjs/common'
import type { ConfigType } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import type { Response } from 'express'
import { AccessKeyService } from 'src/access-key/access-key.service'
import cookieConfig from 'src/common/config/cookie.config'
import jwtRefreshConfig from 'src/common/config/jwt-refresh.config'
import { HashingService } from 'src/common/hashing/hashing.service'
import type { TokenPayload } from 'src/common/interfaces/token-payload.interface'
import { User } from 'src/users/entities/user.entity'
import { UsersService } from 'src/users/users.service'
import { Repository } from 'typeorm'
import { NewPasswordDto } from './dtos/new-password.dto'
import { SendAccessKeyDto } from './dtos/send-access-key.dto'
import { SignupDto } from './dtos/signup.dto'
import { VerifyAccessKeyDto } from './dtos/verify-access-key.dto'
import { VerifyRefreshTokenDto } from './dtos/verify-refresh-token.dto'
import { VerifyUserWithEmailAndPasswordDto } from './dtos/verify-user-with-email-and-password.dto'

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
		>,
		private readonly hashingService: HashingService,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	) {}

	async signup(signupDto: SignupDto) {
		const existingUser = await this.usersService.findByEmail(signupDto.email)

		if (existingUser) {
			throw new ConflictException('user already exists')
		}

		if (signupDto?.password) {
			const hashedPassword = await this.hashingService.hash(signupDto.password)

			signupDto.password = hashedPassword
		}

		const user = {
			email: signupDto.email,
			password: signupDto.password
		}

		return this.usersService.create(user)
	}

	async signin(user: User, res: Response) {
		if (!user) {
			throw new BadRequestException('user not found')
		}

		const tokenPayload = {
			sub: user.id,
			email: user.email
		} as TokenPayload

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

	async verifyRefreshToken(verifyRefreshTokenDto: VerifyRefreshTokenDto) {
		const { refreshToken } = verifyRefreshTokenDto

		if (!refreshToken) {
			throw new UnauthorizedException('refresh token not found')
		}

		try {
			const { sub } = await this.jwtService.verifyAsync<TokenPayload>(
				refreshToken,
				{
					...this.jwtRefreshConfiguration
				}
			)

			return this.usersService.findById(sub)
		} catch {
			throw new UnauthorizedException('invalid refresh token')
		}
	}

	async verifyUserWithEmailAndPassword(
		verifyUserWithEmailAndPasswordDto: VerifyUserWithEmailAndPasswordDto
	) {
		const { email, password } = verifyUserWithEmailAndPasswordDto

		const existingUser = await this.usersService.findByEmail(email)

		if (!existingUser) {
			throw new UnauthorizedException('user not found')
		}

		if (!existingUser?.password) {
			throw new UnauthorizedException('password is required')
		}

		try {
			const isValid = await this.hashingService.verify(
				password,
				existingUser.password
			)

			if (!isValid) {
				throw new UnauthorizedException('invalid credentials')
			}
		} catch {
			throw new UnauthorizedException('invalid credentials')
		}

		return existingUser
	}

	async generatePasswordResetCode(email: string) {
		const existingUser = await this.usersService.findByEmail(email)

		if (!existingUser) {
			throw new UnauthorizedException('user not found')
		}

		return this.accessKeyService.create({ email })
	}

	async changePassword(newPasswordDto: NewPasswordDto) {
		const { code, newPassword, email } = newPasswordDto

		const existingUser = await this.validateNewPassword(newPasswordDto)

		await this.accessKeyService.verify(email, code)

		const hashedNewPassword = await this.hashingService.hash(newPassword)

		await this.userRepository.save({
			...existingUser,
			password: hashedNewPassword
		})

		return {
			message: 'password changed successfully'
		}
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

	private async validateNewPassword(newPasswordDto: NewPasswordDto) {
		const { code, newPassword, email } = newPasswordDto

		if (!code) {
			throw new BadRequestException('code is required')
		}

		if (!newPassword) {
			throw new BadRequestException('new password is required')
		}

		if (!email) {
			throw new BadRequestException('email is required')
		}

		const existingUser = await this.usersService.findByEmail(email)

		if (!existingUser) {
			throw new UnauthorizedException('user not found')
		}

		return existingUser
	}
}
