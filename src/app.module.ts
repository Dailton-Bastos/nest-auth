import {
	Inject,
	type MiddlewareConsumer,
	Module,
	ValidationPipe
} from '@nestjs/common'
import { ConfigModule, type ConfigType } from '@nestjs/config'
import { APP_GUARD, APP_PIPE } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { TypeOrmModule } from '@nestjs/typeorm'
import cookieParser from 'cookie-parser'
import { AccessKeyModule } from './access-key/access-key.module'
import { AuthModule } from './auth/auth.module'
import cookieConfig from './common/config/cookie.config'
import databaseConfig from './common/config/database.config'
import throttleConfig from './common/config/throttle.config'
import { HashingModule } from './common/hashing/hashing.module'
import { HealthModule } from './health/health.module'
import { UsersModule } from './users/users.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true
		}),
		TypeOrmModule.forRootAsync(databaseConfig.asProvider()),
		ThrottlerModule.forRootAsync(throttleConfig.asProvider()),
		HashingModule,
		HealthModule,
		UsersModule,
		AuthModule,
		AccessKeyModule
	],
	providers: [
		{
			provide: APP_PIPE,
			useValue: new ValidationPipe({
				whitelist: true,
				transform: false,
				forbidNonWhitelisted: true
			})
		},
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard
		}
	],
	exports: [HashingModule]
})
export class AppModule {
	constructor(
		@Inject(cookieConfig.KEY)
		private readonly cookieConfiguration: ConfigType<typeof cookieConfig>
	) {}
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(cookieParser(this.cookieConfiguration.secret))
			.forRoutes('/*path')
	}
}
