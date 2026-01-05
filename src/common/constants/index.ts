export const jwtConstants = {
	secret: process.env.JWT_ACCESS_TOKEN_SECRET as string
}

export const sessionConstants = {
	name: process.env.SESSION_NAME as string,
	secret: process.env.SESSION_SECRET as string,
	maxAge: Number(process.env.SESSION_MAX_AGE_MS)
} as const
