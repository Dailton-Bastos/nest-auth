import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import cookieConfig from 'src/common/config/cookie.config'
import jwtConfig from 'src/common/config/jwt.config'
import jwtRefreshConfig from 'src/common/config/jwt-refresh.config'
import { User } from 'src/users/entities/user.entity'
import { AccessKeyModule } from '../access-key/access-key.module'
import { UsersModule } from '../users/users.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AccessCodeStrategy } from './strategies/access-code.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy'
import { LocalStrategy } from './strategies/local.strategy'

@Module({
	imports: [
		UsersModule,
		AccessKeyModule,
		PassportModule,
		JwtModule.registerAsync(jwtConfig.asProvider()),
		ConfigModule.forFeature(cookieConfig),
		ConfigModule.forFeature(jwtRefreshConfig),
		TypeOrmModule.forFeature([User])
	],
	exports: [ConfigModule],
	providers: [
		AuthService,
		AccessCodeStrategy,
		JwtStrategy,
		JwtRefreshStrategy,
		LocalStrategy
	],
	controllers: [AuthController]
})
export class AuthModule {}
