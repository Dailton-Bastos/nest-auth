import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import cookieConfig from 'src/common/config/cookie.config'
import jwtConfig from 'src/common/config/jwt.config'
import { AccessKeyModule } from '../access-key/access-key.module'
import { UsersModule } from '../users/users.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AccessCodeStrategy } from './strategies/access-code.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'

@Module({
	imports: [
		UsersModule,
		AccessKeyModule,
		PassportModule,
		JwtModule.registerAsync(jwtConfig.asProvider()),
		ConfigModule.forFeature(cookieConfig)
	],
	exports: [ConfigModule],
	providers: [AuthService, AccessCodeStrategy, JwtStrategy],
	controllers: [AuthController]
})
export class AuthModule {}
