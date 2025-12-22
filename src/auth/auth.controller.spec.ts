/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */
import { AccessKey } from '../access-key/entities/access-key.entity'
import { User } from '../users/entities/user.entity'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { CreateAccessKeyDto } from './dtos/create-access-key.dto'
import { SignupDto } from './dtos/signup.dto'

describe('AuthController', () => {
	let controller: AuthController
	const authService: AuthService = {
		signup: jest.fn(),
		createAccessKey: jest.fn()
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

	describe('createAccessKey', () => {
		it('should create a new access key with email', async () => {
			const createAccessKeyDto: CreateAccessKeyDto = {
				email: 'test@example.com'
			}

			const accessKey = {
				id: 1,
				code: '123456',
				expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes,
				email: createAccessKeyDto.email
			} as AccessKey

			jest.spyOn(authService, 'createAccessKey').mockResolvedValue(accessKey)

			const result = await controller.createAccessKey(createAccessKeyDto)

			expect(authService.createAccessKey).toHaveBeenCalledWith(
				createAccessKeyDto
			)

			expect(result).toEqual(accessKey)
		})
	})
})
