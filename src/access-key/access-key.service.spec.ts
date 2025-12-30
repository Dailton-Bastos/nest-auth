/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */

import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { HashingService } from 'src/common/hashing/hashing.service'
import { Repository } from 'typeorm'
import { AccessKeyService } from './access-key.service'
import { CreateAccessKeyDto } from './dtos/create-access-key.dto'
import { AccessKey } from './entities/access-key.entity'

describe('AccessKeyService', () => {
	let service: AccessKeyService
	let repository: Repository<AccessKey>
	let hashingService: HashingService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AccessKeyService,
				{
					provide: getRepositoryToken(AccessKey),
					useValue: {
						create: jest.fn(),
						findOne: jest.fn(),
						save: jest.fn(),
						remove: jest.fn(),
						find: jest.fn()
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

		service = module.get<AccessKeyService>(AccessKeyService)
		repository = module.get<Repository<AccessKey>>(
			getRepositoryToken(AccessKey)
		)
		hashingService = module.get<HashingService>(HashingService)
	})

	it('AccessKeyService should be defined', () => {
		expect(service).toBeDefined()
	})

	it('Repository<AccessKey> should be defined', () => {
		expect(repository).toBeDefined()
	})

	it('HashingService should be defined', () => {
		expect(hashingService).toBeDefined()
	})

	describe('create', () => {
		it('should create a new access key with email and hashed code', async () => {
			const createAccessKeyDto: CreateAccessKeyDto = {
				email: 'test@example.com'
			}

			const hashedCode = 'hashed-code'
			const code = '123456'
			const newAccessKey = {
				id: 1,
				code,
				expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes,
				email: createAccessKeyDto.email
			}

			jest.spyOn(hashingService, 'hash').mockResolvedValue(hashedCode)

			jest
				.spyOn(repository, 'create')
				.mockReturnValue(newAccessKey as AccessKey)

			const result = await service.create(createAccessKeyDto)

			expect(repository.create).toHaveBeenCalledWith(createAccessKeyDto)
			expect(repository.save).toHaveBeenCalledWith(newAccessKey)

			expect(result.code).toBeDefined()
			expect(result.code).not.toEqual(code)
			expect(result.code).toEqual(hashedCode)
		})

		it('should throw an error if the email is not provided', async () => {
			const createAccessKeyDto: CreateAccessKeyDto = {
				email: ''
			}

			await expect(service.create(createAccessKeyDto)).rejects.toThrow(
				BadRequestException
			)
		})

		it('should remove all existing access keys when the email is provided', async () => {
			const email = 'test@example.com'

			const accessKeys = [{ email }, { email }] as AccessKey[]

			jest.spyOn(service, 'deleteByEmail').mockResolvedValue(accessKeys)

			const result = await service.deleteByEmail(email)

			expect(service.deleteByEmail).toHaveBeenCalledWith(email)
			expect(result).toEqual(accessKeys)
		})
	})

	describe('find', () => {
		it('should find a access key by email', async () => {
			const email = 'test@example.com'

			const accessKey = {
				email
			} as AccessKey

			jest.spyOn(repository, 'findOne').mockResolvedValue(accessKey)

			const result = await service.findByEmail(email)

			expect(repository.findOne).toHaveBeenCalledWith({
				where: { email },
				order: { expiresAt: 'DESC' }
			})

			expect(result?.email).toEqual(email)
		})

		it('should return null if the access key is not found', async () => {
			const email = 'test@example.com'

			jest.spyOn(repository, 'findOne').mockResolvedValue(null)

			const result = await service.findByEmail(email)

			expect(result).toBeNull()
		})
	})

	describe('verify', () => {
		it('should throw an error if the access key is not found', async () => {
			const email = 'test@example.com'
			const code = '123456'

			jest.spyOn(service, 'findByEmail').mockResolvedValue(null)

			await expect(service.verify(email, code)).rejects.toThrow(
				NotFoundException
			)
		})

		it('should throw an error if the code is incorrect', async () => {
			const email = 'test@example.com'
			const code = 'incorrect-code'

			const accessKey = {
				email,
				code: 'hashed-code'
			} as AccessKey

			jest.spyOn(service, 'findByEmail').mockResolvedValue(accessKey)
			jest.spyOn(hashingService, 'verify').mockResolvedValue(false)

			await expect(service.verify(email, code)).rejects.toThrow(
				BadRequestException
			)
		})

		it('should throw an error if the access key is expired', async () => {
			const email = 'test@example.com'
			const code = '123456'

			const accessKey = {
				email,
				code: 'hashed-code',
				expiresAt: new Date(Date.now() - 1 * 60 * 1000) // 1 minute ago
			} as AccessKey

			jest.spyOn(service, 'findByEmail').mockResolvedValue(accessKey)
			jest.spyOn(hashingService, 'verify').mockResolvedValue(true)

			await expect(service.verify(email, code)).rejects.toThrow(
				BadRequestException
			)

			expect(service.findByEmail).toHaveBeenCalledWith(email)
			expect(hashingService.verify).toHaveBeenCalledWith(code, accessKey.code)
		})

		it('should return true if the access key is valid and not expired', async () => {
			const email = 'test@example.com'
			const code = '123456'

			const accessKey = {
				email,
				code: 'hashed-code'
			} as AccessKey

			jest.spyOn(service, 'findByEmail').mockResolvedValue(accessKey)
			jest.spyOn(hashingService, 'verify').mockResolvedValue(true)

			const result = await service.verify(email, code)

			expect(result).toBeTruthy()
		})
	})

	describe('delete', () => {
		it('should remove all access keys when the email is provided', async () => {
			const email = 'test@example.com'

			const accessKeys = [{ email }, { email }] as AccessKey[]

			jest.spyOn(repository, 'find').mockResolvedValue(accessKeys)

			await service.deleteByEmail(email)

			expect(repository.find).toHaveBeenCalledWith({ where: { email } })

			expect(repository.remove).toHaveBeenCalledWith(accessKeys)
		})
	})
})
