import { Module, ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_PIPE } from '@nestjs/core'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccessKeyModule } from './access-key/access-key.module'
import { AuthModule } from './auth/auth.module'
import databaseConfig from './common/config/database.config'
import { HealthModule } from './health/health.module'
import { UsersModule } from './users/users.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true
		}),
		TypeOrmModule.forRootAsync(databaseConfig.asProvider()),
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
		}
	]
})
export class AppModule {}
