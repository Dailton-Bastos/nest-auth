import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import session from 'express-session'
import passport from 'passport'
import { AppModule } from './app.module'
import { sessionConstants } from './common/constants'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	app.setGlobalPrefix('api')

	app.use(
		session({
			name: sessionConstants.name,
			secret: sessionConstants.secret,
			resave: false,
			saveUninitialized: false,
			cookie: {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				maxAge: sessionConstants.maxAge
			}
		})
	)

	app.use(passport.initialize())
	app.use(passport.session())

	const PORT = process.env.PORT ?? 3000
	const ENV = process.env.NODE_ENV ?? 'development'

	await app.listen(PORT, () => {
		const logger = new Logger('Bootstrap')
		logger.log(`Server is running on port ${PORT} in ${ENV} mode`)
	})
}
bootstrap()
