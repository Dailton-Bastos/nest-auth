/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */

import {
	BadRequestException,
	ConflictException,
	UnauthorizedException
} from '@nestjs/common'
import { ConfigService, ConfigType } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Test, type TestingModule } from '@nestjs/testing'
import type { Response } from 'express'
import cookieConfig from 'src/common/config/cookie.config'
import jwtRefreshConfig from 'src/common/config/jwt-refresh.config'
import { HashingService } from 'src/common/hashing/hashing.service'
import { AccessKeyService } from '../access-key/access-key.service'
import { AccessKey } from '../access-key/entities/access-key.entity'
import type { TokenPayload } from '../common/interfaces/token-payload.interface'
import { User } from '../users/entities/user.entity'
import { UsersService } from '../users/users.service'
import { AuthService } from './auth.service'
import { SendAccessKeyDto } from './dtos/send-access-key.dto'
import { SignupDto } from './dtos/signup.dto'
import { VerifyAccessKeyDto } from './dtos/verify-access-key.dto'
import { VerifyRefreshTokenDto } from './dtos/verify-refresh-token.dto'
import { VerifyUserWithEmailAndPasswordDto } from './dtos/verify-user-with-email-and-password.dto'

describe('AuthService', () => {
	let service: AuthService
	let usersService: UsersService
	let accessKeyService: AccessKeyService
	let jwtService: JwtService
	let cookieConfiguration: ConfigType<typeof cookieConfig>
	let jwtRefreshConfiguration: ConfigType<typeof jwtRefreshConfig>
	let hashingService: HashingService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: UsersService,
					useValue: {
						create: jest.fn(),
						findByEmail: jest.fn(),
						findById: jest.fn()
					}
				},
				{
					provide: AccessKeyService,
					useValue: {
						create: jest.fn(),
						verify: jest.fn()
					}
				},
				{
					provide: JwtService,
					useValue: {
						signAsync: jest.fn(),
						verifyAsync: jest.fn()
					}
				},
				{
					provide: ConfigService,
					useValue: {
						getOrThrow: jest.fn()
					}
				},
				{
					provide: cookieConfig.KEY,
					useValue: {
						accessToken: {
							name: 'Authentication',
							expires: 3600,
							secure: false,
							httpOnly: true
						},
						refreshToken: {
							name: 'Refresh',
							expires: 86400,
							secure: false,
							httpOnly: true
						}
					}
				},
				{
					provide: jwtRefreshConfig.KEY,
					useValue: {
						secret: 'refresh-token-secret',
						expiresIn: 86400
					}
				},
				{
					provide: HashingService,
					useValue: {
						hash: jest.fn(),
						verify: jest.fn()
					}
				}
			]
		}).compile()

		service = module.get<AuthService>(AuthService)
		usersService = module.get<UsersService>(UsersService)
		accessKeyService = module.get<AccessKeyService>(AccessKeyService)
		jwtService = module.get<JwtService>(JwtService)
		cookieConfiguration = module.get<ConfigType<typeof cookieConfig>>(
			cookieConfig.KEY
		)
		jwtRefreshConfiguration = module.get<ConfigType<typeof jwtRefreshConfig>>(
			jwtRefreshConfig.KEY
		)
		hashingService = module.get<HashingService>(HashingService)
	})

	it('AuthService should be defined', () => {
		expect(service).toBeDefined()
	})

	it('UsersService should be defined', () => {
		expect(usersService).toBeDefined()
	})

	it('AccessKeyService should be defined', () => {
		expect(accessKeyService).toBeDefined()
	})

	describe('signup', () => {
		it('should sign up a new user with email', async () => {
			const signupDto: SignupDto = {
				email: 'test@example.com'
			}

			jest.spyOn(usersService, 'create').mockResolvedValue(signupDto as User)

			const result = await service.signup(signupDto)

			expect(usersService.create).toHaveBeenCalledWith(signupDto)

			expect(result).toEqual(signupDto)
		})

		it('should throw an error if the user already exists', async () => {
			const signupDto: SignupDto = {
				email: 'test@example.com'
			}

			jest
				.spyOn(usersService, 'findByEmail')
				.mockResolvedValue(signupDto as User)

			await expect(service.signup(signupDto)).rejects.toThrow(ConflictException)
		})

		it('should create a new user with email and password if provided', async () => {
			const signupDto: SignupDto = {
				email: 'test@example.com',
				password: 'Password123!'
			}

			jest.spyOn(usersService, 'create').mockResolvedValue(signupDto as User)

			const result = await service.signup(signupDto)

			expect(usersService.create).toHaveBeenCalledWith(signupDto)

			expect(result).toEqual(signupDto)
		})

		it('should hash the password if provided', async () => {
			const signupDto: SignupDto = {
				email: 'test@example.com',
				password: 'Password123!'
			}

			const hashedPassword = 'hashed-password'

			jest.spyOn(hashingService, 'hash').mockResolvedValue(hashedPassword)

			jest.spyOn(usersService, 'create').mockResolvedValue(signupDto as User)

			const result = await service.signup(signupDto)

			expect(usersService.create).toHaveBeenCalledWith(signupDto)

			expect(result.password).toBeDefined()
			expect(result.password).toEqual(hashedPassword)
		})
	})

	describe('sendAccessKey', () => {
		it('should send a new access key with email', async () => {
			const sendAccessKeyDto: SendAccessKeyDto = {
				email: 'test@example.com'
			}

			const newAccessKey = {
				id: 1,
				code: '123456',
				expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes,
				email: sendAccessKeyDto.email
			}

			jest
				.spyOn(accessKeyService, 'create')
				.mockResolvedValue(newAccessKey as AccessKey)

			const result = await service.sendAccessKey(sendAccessKeyDto)

			expect(accessKeyService.create).toHaveBeenCalledWith(sendAccessKeyDto)

			expect(result).toEqual(newAccessKey)
		})

		it('should throw an error if the email is not provided', async () => {
			const sendAccessKeyDto: SendAccessKeyDto = {
				email: ''
			}

			await expect(service.sendAccessKey(sendAccessKeyDto)).rejects.toThrow(
				BadRequestException
			)
		})
	})

	describe('verifyAccessKey', () => {
		it('should verify an access key with email and code', async () => {
			const verifyAccessKeyDto: VerifyAccessKeyDto = {
				email: 'test@example.com',
				code: '123456'
			}

			jest.spyOn(accessKeyService, 'verify').mockResolvedValue(true)

			await service.verifyAccessKey(verifyAccessKeyDto)

			expect(accessKeyService.verify).toHaveBeenCalledWith(
				verifyAccessKeyDto.email,
				verifyAccessKeyDto.code
			)
		})

		it('should return a existing user if the access key is valid and not expired', async () => {
			const verifyAccessKeyDto: VerifyAccessKeyDto = {
				email: 'test@example.com',
				code: '123456'
			}

			const signupDto: SignupDto = {
				email: 'test@example.com'
			}

			jest.spyOn(accessKeyService, 'verify').mockResolvedValue(true)
			jest
				.spyOn(usersService, 'findByEmail')
				.mockResolvedValue(signupDto as User)

			const result = await service.verifyAccessKey(verifyAccessKeyDto)

			expect(accessKeyService.verify).toHaveBeenCalledWith(
				verifyAccessKeyDto.email,
				verifyAccessKeyDto.code
			)

			expect(usersService.findByEmail).toHaveBeenCalledWith(
				verifyAccessKeyDto.email
			)

			expect(result).not.toBeNull()
			expect(result).toEqual(signupDto)
		})

		it('should return a new user if the access key is valid and not expired and the user does not exist', async () => {
			const verifyAccessKeyDto: VerifyAccessKeyDto = {
				email: 'test@example.com',
				code: '123456'
			}

			const signupDto: SignupDto = {
				email: 'test@example.com'
			}

			jest.spyOn(accessKeyService, 'verify').mockResolvedValue(true)
			jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null)
			jest.spyOn(usersService, 'create').mockResolvedValue(signupDto as User)

			const result = await service.verifyAccessKey(verifyAccessKeyDto)

			expect(usersService.findByEmail).toHaveBeenCalledWith(
				verifyAccessKeyDto.email
			)

			expect(usersService.create).toHaveBeenCalledWith(signupDto)
			expect(result).not.toBeNull()
			expect(result).toEqual(signupDto)
		})
	})

	describe('signin', () => {
		it('should sign in a user', async () => {
			const user = {
				id: 1,
				email: 'test@example.com'
			} as User

			const tokenPayload = {
				sub: user.id,
				email: user.email
			} as TokenPayload

			const accessToken = 'token'
			const refreshToken = 'refresh-token'

			jest
				.spyOn(jwtService, 'signAsync')
				.mockResolvedValueOnce(accessToken)
				.mockResolvedValueOnce(refreshToken)

			const res = {
				cookie: jest.fn()
			} as unknown as Response

			const result = await service.signin(user, res)

			expect(jwtService.signAsync).toHaveBeenCalledWith(tokenPayload)

			expect(result.accessToken).toBeDefined()
			expect(result.refreshToken).toBeDefined()

			expect(result).toEqual({
				accessToken,
				refreshToken
			})
		})

		it('should save the access token in a cookie', async () => {
			const user = {
				id: 1,
				email: 'test@example.com'
			} as User

			const accessToken = 'token'

			const res = {
				cookie: jest.fn()
			} as unknown as Response

			jest.spyOn(jwtService, 'signAsync').mockResolvedValue(accessToken)

			await service.signin(user, res)

			expect(res.cookie).toHaveBeenCalledWith(
				cookieConfiguration.accessToken.name,
				accessToken,
				{
					name: cookieConfiguration.accessToken.name,
					httpOnly: cookieConfiguration.accessToken.httpOnly,
					secure: cookieConfiguration.accessToken.secure,
					expires: new Date(
						Date.now() + cookieConfiguration.accessToken.expires * 1000
					)
				}
			)
		})

		it('should throw an error if the user is not provided', async () => {
			const res = {
				cookie: jest.fn()
			} as unknown as Response

			await expect(
				service.signin(null as unknown as User, res)
			).rejects.toThrow(BadRequestException)
		})
	})

	describe('verifyRefreshToken', () => {
		it('should verify a refresh token', async () => {
			const verifyRefreshTokenDto: VerifyRefreshTokenDto = {
				refreshToken: 'refresh-token'
			}

			const user = {
				id: 1,
				email: 'test@example.com'
			} as User

			jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({
				sub: 1,
				email: 'test@example.com',
				iat: 1714857600,
				exp: 1714861200,
				aud: 'refresh-token',
				iss: 'https://example.com'
			})

			jest.spyOn(usersService, 'findById').mockResolvedValue(user)

			const result = await service.verifyRefreshToken(verifyRefreshTokenDto)

			expect(jwtService.verifyAsync).toHaveBeenCalledWith(
				verifyRefreshTokenDto.refreshToken,
				{
					...jwtRefreshConfiguration
				}
			)

			expect(usersService.findById).toHaveBeenCalledWith(1)

			expect(result).toBeDefined()
			expect(result).toEqual(user)
		})

		it('should throw an error if the refresh token is invalid', async () => {
			const verifyRefreshTokenDto: VerifyRefreshTokenDto = {
				refreshToken: 'invalid-refresh-token'
			}

			await expect(
				service.verifyRefreshToken(verifyRefreshTokenDto)
			).rejects.toThrow(UnauthorizedException)
		})

		it('should throw an error if the refresh token is not found', async () => {
			const verifyRefreshTokenDto: VerifyRefreshTokenDto = {
				refreshToken: ''
			}

			await expect(
				service.verifyRefreshToken(verifyRefreshTokenDto)
			).rejects.toThrow(UnauthorizedException)
		})

		it('should throw an error if user not found', async () => {
			const verifyRefreshTokenDto: VerifyRefreshTokenDto = {
				refreshToken: 'refresh-token'
			}

			jest
				.spyOn(usersService, 'findById')
				.mockResolvedValue(null as unknown as User)

			await expect(
				service.verifyRefreshToken(verifyRefreshTokenDto)
			).rejects.toThrow(UnauthorizedException)
		})
	})

	describe('verifyUserWithEmailAndPassword', () => {
		it('should verify a user with email and password', async () => {
			const verifyUserWithEmailAndPasswordDto: VerifyUserWithEmailAndPasswordDto =
				{
					email: 'test@example.com',
					password: 'Password123!'
				}

			const user = {
				id: 1,
				email: 'test@example.com',
				password: 'hashed-password'
			} as User

			jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user)
			jest.spyOn(hashingService, 'verify').mockResolvedValue(true)

			await service.verifyUserWithEmailAndPassword(
				verifyUserWithEmailAndPasswordDto
			)

			expect(usersService.findByEmail).toHaveBeenCalledWith(
				verifyUserWithEmailAndPasswordDto.email
			)

			expect(hashingService.verify).toHaveBeenCalledWith(
				verifyUserWithEmailAndPasswordDto.password,
				user.password
			)
		})

		it('should throw an error if user not found', async () => {
			const verifyUserWithEmailAndPasswordDto: VerifyUserWithEmailAndPasswordDto =
				{
					email: 'test@example.com',
					password: 'Password123!'
				}

			jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null)

			await expect(
				service.verifyUserWithEmailAndPassword(
					verifyUserWithEmailAndPasswordDto
				)
			).rejects.toThrow(UnauthorizedException)
		})

		it('should throw an error if user does not have password', async () => {
			const verifyUserWithEmailAndPasswordDto: VerifyUserWithEmailAndPasswordDto =
				{
					email: 'test@example.com',
					password: 'Password123!'
				}

			const user = {
				id: 1,
				email: 'test@example.com',
				password: ''
			} as User

			jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user)

			await expect(
				service.verifyUserWithEmailAndPassword(
					verifyUserWithEmailAndPasswordDto
				)
			).rejects.toThrow(UnauthorizedException)

			expect(usersService.findByEmail).toHaveBeenCalledWith(
				verifyUserWithEmailAndPasswordDto.email
			)

			expect(hashingService.verify).not.toHaveBeenCalled()
		})

		it('should throw an error if password is invalid', async () => {
			const verifyUserWithEmailAndPasswordDto: VerifyUserWithEmailAndPasswordDto =
				{
					email: 'test@example.com',
					password: 'invalid-password'
				}

			const user = {
				id: 1,
				email: 'test@example.com',
				password: 'hashed-password'
			} as User

			jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user)
			jest.spyOn(hashingService, 'verify').mockRejectedValue(false)

			await expect(
				service.verifyUserWithEmailAndPassword(
					verifyUserWithEmailAndPasswordDto
				)
			).rejects.toThrow(UnauthorizedException)

			expect(usersService.findByEmail).toHaveBeenCalledWith(
				verifyUserWithEmailAndPasswordDto.email
			)

			expect(hashingService.verify).toHaveBeenCalledWith(
				verifyUserWithEmailAndPasswordDto.password,
				user.password
			)
		})
	})
})
