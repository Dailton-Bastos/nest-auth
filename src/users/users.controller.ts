import { Controller, Get, UseGuards } from '@nestjs/common'
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard'
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
// biome-ignore lint/style/useImportType: <Nest can't resolve dependencies>
import { User } from './entities/user.entity'

@Controller('users')
export class UsersController {
	@Get('/whoami')
	@UseGuards(AuthenticatedGuard)
	async whoami(@CurrentUser() user: User) {
		return user
	}
}
