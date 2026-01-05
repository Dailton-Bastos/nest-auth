import { registerAs } from '@nestjs/config'

export default registerAs('jwt', () => ({
	secret: process.env.JWT_ACCESS_TOKEN_SECRET,
	signOptions: {
		expiresIn: Number(process.env.JWT_ACCESS_TOKEN_EXPIRATION_MS),
		audience: process.env.JWT_ACCESS_TOKEN_AUDIENCE,
		issuer: process.env.JWT_ACCESS_TOKEN_ISSUER
	}
}))
