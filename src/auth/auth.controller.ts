/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */
import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Res,
	UseGuards
} from '@nestjs/common'
import type { Response } from 'express'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { User } from 'src/users/entities/user.entity'
import { AuthService } from './auth.service'
import { SendAccessKeyDto } from './dtos/send-access-key.dto'
import { SignupDto } from './dtos/signup.dto'
import { AccessCodeAuthGuard } from './guards/access-code-auth.guard'

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

	@UseGuards(AccessCodeAuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('accesskey/verify')
	async verifyAccessKey(
		@CurrentUser() user: User,
		@Res({ passthrough: true }) res: Response
	) {
		return this.authService.signin(user, res)
	}

	@Post('refresh')
	async refreshToken(
		@CurrentUser() user: User,
		@Res({ passthrough: true }) res: Response
	) {
		return this.authService.signin(user, res)
	}
}
