/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */
import { ConflictException, Injectable } from '@nestjs/common'
import { UsersService } from 'src/users/users.service'
import { SignupDto } from './dtos/signup.dto'

@Injectable()
export class AuthService {
	constructor(private readonly usersService: UsersService) {}

	async signup(signupDto: SignupDto) {
		const existingUser = await this.usersService.findByEmail(signupDto.email)

		if (existingUser) {
			throw new ConflictException('user already exists')
		}

		return this.usersService.create(signupDto)
	}
}
