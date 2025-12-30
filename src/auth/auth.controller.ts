/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { SendAccessKeyDto } from './dtos/send-access-key.dto'
import { SignupDto } from './dtos/signup.dto'
import { VerifyAccessKeyDto } from './dtos/verify-access-key.dto'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('signup')
	async signup(@Body() signupDto: SignupDto) {
		return this.authService.signup(signupDto)
	}

	@Post('accesskey/send')
	async sendAccessKey(@Body() sendAccessKeyDto: SendAccessKeyDto) {
		return this.authService.sendAccessKey(sendAccessKeyDto)
	}

	@HttpCode(HttpStatus.OK)
	@Post('accesskey/verify')
	async verifyAccessKey(@Body() verifyAccessKeyDto: VerifyAccessKeyDto) {
		return this.authService.verifyAccessKey(verifyAccessKeyDto)
	}
}
