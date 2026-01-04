import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { AccessKeyModule } from '../access-key/access-key.module'
import { UsersModule } from '../users/users.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AccessCodeStrategy } from './strategies/access-code.strategy'

@Module({
	imports: [UsersModule, AccessKeyModule, PassportModule],
	providers: [AuthService, AccessCodeStrategy],
	controllers: [AuthController]
})
export class AuthModule {}
