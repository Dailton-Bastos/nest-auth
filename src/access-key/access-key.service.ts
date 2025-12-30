/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */
import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
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

		await this.deleteByEmail(createAccessKeyDto.email)

		const accessKey = this.accessKeyRepository.create(createAccessKeyDto)

		const hashedCode = await this.generateHashedCode()

		accessKey.code = hashedCode

		accessKey.expiresAt =
			process.env.NODE_ENV === 'test'
				? new Date(Date.now() + 5000) // 5 seconds
				: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

		await this.accessKeyRepository.save(accessKey)

		return accessKey
	}

	async findByEmail(email: string) {
		return this.accessKeyRepository.findOne({
			where: { email },
			order: { expiresAt: 'DESC' }
		})
	}

	async verify(email: string, code: string) {
		const accessKey = await this.findByEmail(email)

		if (!accessKey) throw new NotFoundException('access key not found')

		const isValid = await this.hashingService.verify(code, accessKey.code)

		if (!isValid) throw new BadRequestException('invalid code')

		const isExpired = accessKey.expiresAt < new Date()

		if (isExpired) throw new BadRequestException('access key expired')

		return true
	}

	async deleteByEmail(email: string) {
		const accessKeys = await this.accessKeyRepository.find({
			where: { email }
		})

		return this.accessKeyRepository.remove(accessKeys)
	}

	private async generateHashedCode() {
		const code = generateSecureSixDigitOTP()

		return this.hashingService.hash(code)
	}
}
