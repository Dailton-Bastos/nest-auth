import { registerAs } from '@nestjs/config'

export default registerAs('throttle', () => ({
	throttlers: [
		{
			ttl: Number(process.env.THROTTLE_TTL),
			limit: Number(process.env.THROTTLE_LIMIT)
		}
	]
}))
