/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */

import type { ExecutionContext } from '@nestjs/common'
import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import type { Request } from 'express'
import { User } from 'src/users/entities/user.entity'

@Injectable()
export class AccessCodeAuthGuard extends AuthGuard('access-code') {
	async canActivate(context: ExecutionContext) {
		const result = (await super.canActivate(context)) as boolean

		const request = context
			.switchToHttp()
			.getRequest<Request & { user: User }>()

		await super.logIn(request)

		return result
	}
}
