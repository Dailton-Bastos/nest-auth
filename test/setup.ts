import { type INestApplication, ValidationPipe } from '@nestjs/common'
import { ConfigModule, type ConfigType } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import type { App } from 'supertest/types'
import { AuthModule } from '../src/auth/auth.module'
import databaseConfig from '../src/common/config/database.config'

export let app: INestApplication<App>

global.beforeEach(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [
			ConfigModule.forRoot({
				isGlobal: true
			}),
			TypeOrmModule.forRootAsync({
				imports: [ConfigModule.forFeature(databaseConfig)],
				inject: [databaseConfig.KEY],
				useFactory: (config: ConfigType<typeof databaseConfig>) => ({
					type: 'postgres',
					host: config.host,
					port: config.port,
					username: config.username,
					password: config.password,
					database: 'nest_auth_testing',
					synchronize: true,
					autoLoadEntities: true,
					dropSchema: true
				})
			}),
			AuthModule
		]
	}).compile()

	app = module.createNestApplication()

	app.setGlobalPrefix('api')

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: false,
			forbidNonWhitelisted: true
		})
	)

	await app.init()
})

global.afterEach(async () => {
	await app.close()
})
