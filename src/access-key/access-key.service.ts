/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateAccessKeyDto } from './dtos/create-access-key.dto'
import { AccessKey } from './entities/access-key.entity'

@Injectable()
export class AccessKeyService {
	constructor(
		@InjectRepository(AccessKey)
		private readonly accessKeyRepository: Repository<AccessKey>
	) {}

	async create(createAccessKeyDto: CreateAccessKeyDto) {
		if (!createAccessKeyDto.email) {
			throw new BadRequestException('email is required')
		}

		const accessKey = this.accessKeyRepository.create(createAccessKeyDto)

		accessKey.code = '123456'
		accessKey.expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

		await this.accessKeyRepository.save(accessKey)

		return accessKey
	}
}
