import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class AccessCodeAuthGuard extends AuthGuard('access-code') {
	// async canActivate(context: ExecutionContext) {
	// 	const result = (await super.canActivate(context)) as boolean
	// 	const request = context
	// 		.switchToHttp()
	// 		.getRequest<Request & { user: User }>()
	// 	await super.logIn(request)
	// 	return result
	// }
}
