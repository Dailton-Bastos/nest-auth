import { registerAs } from '@nestjs/config'

export default registerAs('jwt-refresh', () => ({
	secret: process.env.JWT_REFRESH_TOKEN_SECRET as string,
	expiresIn: Number(process.env.JWT_REFRESH_TOKEN_EXPIRATION_MS) ?? 86400 // 1 day
}))
