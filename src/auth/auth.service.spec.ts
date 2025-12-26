/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */

import { ConflictException } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import { AccessKeyService } from '../access-key/access-key.service'
import { AccessKey } from '../access-key/entities/access-key.entity'
import { User } from '../users/entities/user.entity'
import { UsersService } from '../users/users.service'
import { AuthService } from './auth.service'
import { SendAccessKeyDto } from './dtos/send-access-key.dto'
import { SignupDto } from './dtos/signup.dto'

describe('AuthService', () => {
	let service: AuthService
	let usersService: UsersService
	let accessKeyService: AccessKeyService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: UsersService,
					useValue: {
						create: jest.fn(),
						findByEmail: jest.fn()
					}
				},
				{
					provide: AccessKeyService,
					useValue: {
						create: jest.fn()
					}
				}
			]
		}).compile()

		service = module.get<AuthService>(AuthService)
		usersService = module.get<UsersService>(UsersService)
		accessKeyService = module.get<AccessKeyService>(AccessKeyService)
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

		jest.spyOn(usersService, 'findByEmail').mockResolvedValue(signupDto as User)

		await expect(service.signup(signupDto)).rejects.toThrow(ConflictException)
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
	})
})
