/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */
import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { SignupDto } from './dtos/signup.dto'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('signup')
	async signup(@Body() signupDto: SignupDto) {
		return this.authService.signup(signupDto)
	}
}
