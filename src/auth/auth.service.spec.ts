/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */
import { Test, type TestingModule } from '@nestjs/testing'
import { UsersService } from 'src/users/users.service'
import { User } from '../users/entities/user.entity'
import { AuthService } from './auth.service'
import { SignupDto } from './dtos/signup.dto'

describe('AuthService', () => {
	let service: AuthService
	let usersService: UsersService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: UsersService,
					useValue: {
						create: jest.fn()
					}
				}
			]
		}).compile()

		service = module.get<AuthService>(AuthService)
		usersService = module.get<UsersService>(UsersService)
	})

	it('AuthService should be defined', () => {
		expect(service).toBeDefined()
	})

	it('UsersService should be defined', () => {
		expect(usersService).toBeDefined()
	})

	it('should sign up a new user with email', async () => {
		const signupDto: SignupDto = {
			email: 'test@example.com'
		}

		jest.spyOn(usersService, 'create').mockResolvedValue(signupDto as User)

		const result = await service.signup(signupDto)

		expect(usersService.create).toHaveBeenCalledWith(signupDto)

		expect(result).toEqual(signupDto)
	})
})
