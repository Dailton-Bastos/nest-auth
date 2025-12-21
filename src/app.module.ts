import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
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
		UsersModule
	]
})
export class AppModule {}
