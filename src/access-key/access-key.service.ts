/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { HashingService } from '../common/hashing/hashing.service'
import { generateSecureSixDigitOTP } from '../common/utils'
import { CreateAccessKeyDto } from './dtos/create-access-key.dto'
import { AccessKey } from './entities/access-key.entity'

@Injectable()
export class AccessKeyService {
	constructor(
		@InjectRepository(AccessKey)
		private readonly accessKeyRepository: Repository<AccessKey>,
		private readonly hashingService: HashingService
	) {}

	async create(createAccessKeyDto: CreateAccessKeyDto) {
		if (!createAccessKeyDto.email) {
			throw new BadRequestException('email is required')
		}

		const accessKey = this.accessKeyRepository.create(createAccessKeyDto)

		const hashedCode = await this.generateHashedCode()

		accessKey.code = hashedCode

		accessKey.expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

		await this.accessKeyRepository.save(accessKey)

		return accessKey
	}

	async findByEmail(email: string) {
		return this.accessKeyRepository.findOne({ where: { email } })
	}

	private async generateHashedCode() {
		const code = generateSecureSixDigitOTP()

		return this.hashingService.hash(code)
	}
}
