/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */

import { BadRequestException } from '@nestjs/common'
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
						save: jest.fn()
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
	})

	describe('find', () => {
		it('should find a access key by email', async () => {
			const email = 'test@example.com'

			const accessKey = {
				email
			} as AccessKey

			jest.spyOn(repository, 'findOne').mockResolvedValue(accessKey)

			const result = await service.findByEmail(email)

			expect(repository.findOne).toHaveBeenCalledWith({ where: { email } })

			expect(result?.email).toEqual(email)
		})

		it('should return null if the access key is not found', async () => {
			const email = 'test@example.com'

			jest.spyOn(repository, 'findOne').mockResolvedValue(null)

			const result = await service.findByEmail(email)

			expect(result).toBeNull()
		})
	})
})
