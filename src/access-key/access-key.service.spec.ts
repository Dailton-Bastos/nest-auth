/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */

import { BadRequestException } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AccessKeyService } from './access-key.service'
import { CreateAccessKeyDto } from './dtos/create-access-key.dto'
import { AccessKey } from './entities/access-key.entity'

describe('AccessKeyService', () => {
	let service: AccessKeyService
	let repository: Repository<AccessKey>

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AccessKeyService,
				{
					provide: getRepositoryToken(AccessKey),
					useValue: {
						create: jest.fn(),
						save: jest.fn()
					}
				}
			]
		}).compile()

		service = module.get<AccessKeyService>(AccessKeyService)
		repository = module.get<Repository<AccessKey>>(
			getRepositoryToken(AccessKey)
		)
	})

	it('AccessKeyService should be defined', () => {
		expect(service).toBeDefined()
	})

	it('Repository<AccessKey> should be defined', () => {
		expect(repository).toBeDefined()
	})

	describe('create', () => {
		it('should create a new access key with email', async () => {
			const createAccessKeyDto: CreateAccessKeyDto = {
				email: 'test@example.com'
			}

			const newAccessKey = {
				id: 1,
				code: '123456',
				expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes,
				email: createAccessKeyDto.email
			}

			jest
				.spyOn(repository, 'create')
				.mockReturnValue(newAccessKey as AccessKey)

			const result = await service.create(createAccessKeyDto)

			expect(repository.create).toHaveBeenCalledWith(createAccessKeyDto)
			expect(repository.save).toHaveBeenCalledWith(newAccessKey)

			expect(result).toEqual(newAccessKey)
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
})
