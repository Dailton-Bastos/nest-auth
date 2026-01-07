/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */

import { BadRequestException, NotFoundException } from '@nestjs/common'
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
						save: jest.fn(),
						findOne: jest.fn(),
						findOneBy: jest.fn()
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

		it('should create a new user with email and password if provided', async () => {
			const createUserDto: CreateUserDto = {
				email: 'test@example.com',
				password: 'Password123!'
			}

			const newUser = {
				email: createUserDto.email,
				password: createUserDto.password
			}

			jest.spyOn(repository, 'create').mockReturnValue(newUser as User)

			const result = await service.create(createUserDto)

			expect(repository.create).toHaveBeenCalledWith(createUserDto)

			expect(repository.save).toHaveBeenCalledWith(newUser)

			expect(result).toEqual(newUser)
		})

		it('should throw an error if the email is not provided', async () => {
			const createUserDto: CreateUserDto = {
				email: ''
			}

			await expect(service.create(createUserDto)).rejects.toThrow(
				BadRequestException
			)
		})
	})

	describe('findByEmail', () => {
		it('should find a user by email', async () => {
			const email = 'test@example.com'

			const user = {
				email
			} as User

			jest.spyOn(repository, 'findOne').mockResolvedValue(user)

			const result = await service.findByEmail(email)

			expect(repository.findOne).toHaveBeenCalledWith({ where: { email } })

			expect(result).toEqual(user)
		})
	})

	describe('findById', () => {
		it('should find a user by id', async () => {
			const id = 1

			const user = {
				id
			} as User

			jest.spyOn(repository, 'findOneBy').mockResolvedValue(user)

			const result = await service.findById(id)

			expect(repository.findOneBy).toHaveBeenCalledWith({ id })

			expect(result).toEqual(user)
		})

		it('should throw an error if the user is not found', async () => {
			const id = 1

			jest.spyOn(repository, 'findOneBy').mockResolvedValue(null)

			await expect(service.findById(id)).rejects.toThrow(NotFoundException)

			expect(repository.findOneBy).toHaveBeenCalledWith({ id })
		})
	})
})
