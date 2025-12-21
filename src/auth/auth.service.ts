/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */
import { Injectable } from '@nestjs/common'
import { UsersService } from 'src/users/users.service'
import { SignupDto } from './dtos/signup.dto'

@Injectable()
export class AuthService {
	constructor(private readonly usersService: UsersService) {}

	async signup(signupDto: SignupDto) {
		return this.usersService.create(signupDto)
	}
}
