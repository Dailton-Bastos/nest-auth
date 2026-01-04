/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */
import {
	BadRequestException,
	ConflictException,
	Injectable
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AccessKeyService } from 'src/access-key/access-key.service'
import type { TokenPayload } from 'src/common/interfaces/token-payload.interface'
import { User } from 'src/users/entities/user.entity'
import { UsersService } from 'src/users/users.service'
import { SendAccessKeyDto } from './dtos/send-access-key.dto'
import { SignupDto } from './dtos/signup.dto'
import { VerifyAccessKeyDto } from './dtos/verify-access-key.dto'

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly accessKeyService: AccessKeyService,
		private readonly jwtService: JwtService
	) {}

	async signup(signupDto: SignupDto) {
		const existingUser = await this.usersService.findByEmail(signupDto.email)

		if (existingUser) {
			throw new ConflictException('user already exists')
		}

		return this.usersService.create(signupDto)
	}

	async signin(user: User) {
		const tokenPayload: TokenPayload = {
			userId: user.id,
			email: user.email
		}

		const accessToken = this.jwtService.sign(tokenPayload)

		return {
			accessToken: accessToken
		}
	}

	async sendAccessKey(sendAccessKeyDto: SendAccessKeyDto) {
		if (!sendAccessKeyDto.email) {
			throw new BadRequestException('email is required')
		}

		return this.accessKeyService.create(sendAccessKeyDto)
	}

	async verifyAccessKey(verifyAccessKeyDto: VerifyAccessKeyDto) {
		await this.accessKeyService.verify(
			verifyAccessKeyDto.email,
			verifyAccessKeyDto.code
		)

		const existingUser = await this.usersService.findByEmail(
			verifyAccessKeyDto.email
		)

		if (existingUser) return existingUser

		return this.usersService.create({
			email: verifyAccessKeyDto.email
		})
	}
}
