/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */
import { Injectable } from '@nestjs/common'
import { PassportSerializer } from '@nestjs/passport'
import { User } from '../users/entities/user.entity'
import { UsersService } from '../users/users.service'

@Injectable()
export class SessionSerializer extends PassportSerializer {
	constructor(private readonly usersService: UsersService) {
		super()
	}

	serializeUser(user: User, done: (_err: Error | null, user: User) => void) {
		done(null, user)
	}

	async deserializeUser(
		payload: { id: number },
		done: (_err: Error | null, user: User) => void
	) {
		const user = await this.usersService.findById(payload.id)

		done(null, user)
	}
}
