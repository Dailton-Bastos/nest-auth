import { registerAs } from '@nestjs/config'

export default registerAs('database', () => ({
	host: process.env.DATABASE_HOST,
	port: Number(process.env.DATABASE_PORT),
	username: process.env.DATABASE_USERNAME,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE_NAME,
	type: 'postgres' as const,
	synchronize: Boolean(process.env.DATABASE_SYNCHRONIZE),
	entities: [`${__dirname}/../../**/*.entity.ts`]
}))
