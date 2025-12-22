/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */
import { ConflictException, Injectable } from '@nestjs/common'
import { AccessKeyService } from 'src/access-key/access-key.service'
import { UsersService } from 'src/users/users.service'
import { CreateAccessKeyDto } from './dtos/create-access-key.dto'
import { SignupDto } from './dtos/signup.dto'

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly accessKeyService: AccessKeyService
	) {}

	async signup(signupDto: SignupDto) {
		const existingUser = await this.usersService.findByEmail(signupDto.email)

		if (existingUser) {
			throw new ConflictException('user already exists')
		}

		return this.usersService.create(signupDto)
	}

	async createAccessKey(createAccessKeyDto: CreateAccessKeyDto) {
		return this.accessKeyService.create(createAccessKeyDto)
	}
}
