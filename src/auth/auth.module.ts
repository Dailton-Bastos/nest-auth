import { Module } from '@nestjs/common'
import { AccessKeyModule } from '../access-key/access-key.module'
import { UsersModule } from '../users/users.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
	imports: [UsersModule, AccessKeyModule],
	providers: [AuthService],
	controllers: [AuthController]
})
export class AuthModule {}
