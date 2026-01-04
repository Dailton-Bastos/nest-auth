import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class AccessCodeAuthGuard extends AuthGuard('access-code') {}
