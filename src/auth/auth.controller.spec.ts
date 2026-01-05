/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */
import type { Response } from 'express'
import { AccessKey } from '../access-key/entities/access-key.entity'
import { User } from '../users/entities/user.entity'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { SendAccessKeyDto } from './dtos/send-access-key.dto'
import { SignupDto } from './dtos/signup.dto'
import { VerifyAccessKeyDto } from './dtos/verify-access-key.dto'

describe('AuthController', () => {
	let controller: AuthController
	const authService: AuthService = {
		signup: jest.fn(),
		sendAccessKey: jest.fn(),
		verifyAccessKey: jest.fn(),
		signin: jest.fn(),
		refreshAccessToken: jest.fn()
	} as unknown as AuthService

	beforeEach(async () => {
		controller = new AuthController(authService)
	})

	it('AuthController should be defined', () => {
		expect(controller).toBeDefined()
	})

	it('AuthService should be defined', () => {
		expect(authService).toBeDefined()
	})

	describe('signup', () => {
		it('should sign up a new user with email', async () => {
			const signupDto: SignupDto = {
				email: 'test@example.com'
			}

			const user = {
				email: signupDto.email
			} as User

			jest.spyOn(authService, 'signup').mockResolvedValue(user)

			const result = await controller.signup(signupDto)

			expect(authService.signup).toHaveBeenCalledWith(signupDto)

			expect(result).toEqual(user)
		})
	})

	describe('sendAccessKey', () => {
		it('should send a new access key with email', async () => {
			const sendAccessKeyDto: SendAccessKeyDto = {
				email: 'test@example.com'
			}

			const accessKey = {
				id: 1,
				code: '123456',
				expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes,
				email: sendAccessKeyDto.email
			} as AccessKey

			jest.spyOn(authService, 'sendAccessKey').mockResolvedValue(accessKey)

			const result = await controller.sendAccessKey(sendAccessKeyDto)

			expect(authService.sendAccessKey).toHaveBeenCalledWith(sendAccessKeyDto)

			expect(result).toEqual(accessKey)
		})
	})

	describe('verifyAccessKey', () => {
		it('should verify an access key and return the access token', async () => {
			const verifyAccessKeyDto: VerifyAccessKeyDto = {
				email: 'test@example.com',
				code: '123456'
			}

			const user = {
				id: 1,
				email: verifyAccessKeyDto.email
			} as User

			const res = {
				cookie: jest.fn()
			} as unknown as Response

			const accessToken = 'token'
			const refreshToken = 'refresh-token'

			jest.spyOn(authService, 'verifyAccessKey').mockResolvedValue(user)
			jest.spyOn(authService, 'signin').mockResolvedValue({
				accessToken,
				refreshToken
			})

			const result = await controller.verifyAccessKey(user, res)

			expect(authService.signin).toHaveBeenCalledWith(user, res)

			expect(result.accessToken).toEqual(accessToken)
		})
	})

	describe('refreshToken', () => {
		it('should refresh the access token', async () => {
			const user = {
				id: 1,
				email: 'test@example.com'
			} as User

			const res = {
				cookie: jest.fn()
			} as unknown as Response

			const accessToken = 'new-access-token'
			const refreshToken = 'new-refresh-token'

			jest.spyOn(authService, 'signin').mockResolvedValue({
				accessToken,
				refreshToken
			})

			const result = await controller.refreshToken(user, res)

			expect(authService.signin).toHaveBeenCalledWith(user, res)

			expect(result.refreshToken).toBeDefined()
			expect(result.refreshToken).toEqual(refreshToken)
		})
	})
})
