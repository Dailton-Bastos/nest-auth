/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */
import { User } from '../users/entities/user.entity'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { SignupDto } from './dtos/signup.dto'

describe('AuthController', () => {
	let controller: AuthController
	const authService: AuthService = {
		signup: jest.fn()
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
})
