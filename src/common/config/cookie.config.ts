import { registerAs } from '@nestjs/config'

export default registerAs('cookie', () => ({
	secret: process.env.COOKIE_SECRET,
	accessToken: {
		name: 'Authentication',
		expires: Number(process.env.JWT_ACCESS_TOKEN_EXPIRATION_MS),
		secure: process.env.NODE_ENV === 'production',
		httpOnly: true
	}
}))
