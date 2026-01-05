import { Controller, Get, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
// biome-ignore lint/style/useImportType: <Nest can't resolve dependencies>
import { User } from './entities/user.entity'

@Controller('users')
export class UsersController {
	@Get('/whoami')
	@UseGuards(JwtAuthGuard)
	async whoami(@CurrentUser() user: User) {
		return user
	}
}
