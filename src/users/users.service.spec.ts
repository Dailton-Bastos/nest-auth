/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */
import { Test, type TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateUserDto } from './dtos/create-user.dto'
import { User } from './entities/user.entity'
import { UsersService } from './users.service'

describe('UsersService', () => {
	let service: UsersService
	let repository: Repository<User>

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UsersService,
				{
					provide: getRepositoryToken(User),
					useValue: {
						create: jest.fn(),
						save: jest.fn()
					}
				}
			]
		}).compile()

		service = module.get<UsersService>(UsersService)
		repository = module.get<Repository<User>>(getRepositoryToken(User))
	})

	it('UsersService should be defined', () => {
		expect(service).toBeDefined()
	})

	it('Repository<User> should be defined', () => {
		expect(repository).toBeDefined()
	})

	describe('create', () => {
		it('should create a new user with email', async () => {
			const createUserDto: CreateUserDto = {
				email: 'test@example.com'
			}

			const newUser = {
				email: createUserDto.email
			}

			jest.spyOn(repository, 'create').mockReturnValue(newUser as User)

			const result = await service.create(createUserDto)

			expect(repository.create).toHaveBeenCalledWith(createUserDto)

			expect(repository.save).toHaveBeenCalledWith(newUser)

			expect(result).toEqual(newUser)
		})
	})
})
