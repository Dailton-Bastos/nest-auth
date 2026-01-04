import type { ExecutionContext } from '@nestjs/common'
import { createParamDecorator } from '@nestjs/common'
import type { Request } from 'express'
// biome-ignore lint/style/useImportType: <Nest can't resolve dependencies>
import { User } from 'src/users/entities/user.entity'

export const CurrentUser = createParamDecorator(
	(_data: never, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest<Request & { user: User }>()

		return request.user
	}
)
