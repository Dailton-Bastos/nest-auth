import { HttpStatus } from '@nestjs/common'
import request from 'supertest'
import { app } from './setup'

describe('Auth (e2e)', () => {
	describe('POST /api/auth/signup', () => {
		it('should sign up a new user with email', async () => {
			const email = 'test@example.com'

			const response = await request(app.getHttpServer())
				.post('/api/auth/signup')
				.send({ email })

			expect(response.status).toBe(HttpStatus.CREATED)
			expect(response.body).toEqual({
				id: expect.any(Number),
				email,
				createdAt: expect.any(String),
				updatedAt: expect.any(String)
			})
		})

		it('should return a 400 error if the email is invalid', async () => {
			const response = await request(app.getHttpServer())
				.post('/api/auth/signup')
				.send({ email: 'invalid-email' })

			expect(response.status).toBe(HttpStatus.BAD_REQUEST)
			expect(response.body.message).toContain('email must be an email')
		})

		it('should return a 400 error if a property is not whitelisted', async () => {
			const response = await request(app.getHttpServer())
				.post('/api/auth/signup')
				.send({ email: 'test@example.com', password: 'password' })

			expect(response.status).toBe(HttpStatus.BAD_REQUEST)
			expect(response.body.message).toContain(
				'property password should not exist'
			)
		})

		it('should return a 409 error if the user already exists', async () => {
			const email = 'test@example.com'

			await request(app.getHttpServer())
				.post('/api/auth/signup')
				.send({ email })
				.expect(HttpStatus.CREATED)

			const response = await request(app.getHttpServer())
				.post('/api/auth/signup')
				.send({ email })

			expect(response.status).toBe(HttpStatus.CONFLICT)
			expect(response.body).toEqual({
				error: 'Conflict',
				statusCode: HttpStatus.CONFLICT,
				message: 'user already exists'
			})
		})
	})

	describe('POST /api/auth/accesskey/send', () => {
		it('should send a new access key with email', async () => {
			const email = 'test@example.com'

			const response = await request(app.getHttpServer())
				.post('/api/auth/accesskey/send')
				.send({ email })
				.expect(HttpStatus.CREATED)

			expect(response.body).toEqual({
				id: expect.any(Number),
				code: expect.any(String),
				expiresAt: expect.any(String),
				email
			})

			expect(response.body.code).not.toEqual('123456')
			expect(response.body.code.length).toBeGreaterThan(6)
		})

		it('should return a 400 error if the email is invalid', async () => {
			const response = await request(app.getHttpServer())
				.post('/api/auth/accesskey/send')
				.send({ email: '' })
				.expect(HttpStatus.BAD_REQUEST)

			expect(response.body.message).toContain('email must be an email')
		})
	})

	describe('POST /api/auth/accesskey/verify', () => {
		it('should throw an error if the access key is not found', async () => {
			const email = 'test@example.com'
			const code = '123456'

			const response = await request(app.getHttpServer())
				.post('/api/auth/accesskey/verify')
				.send({ email, code })
				.expect(HttpStatus.NOT_FOUND)

			expect(response.body.message).toContain('access key not found')
		})

		it('should throw an error if the code is incorrect', async () => {
			const email = 'test@example.com'
			const code = '000000'

			await request(app.getHttpServer())
				.post('/api/auth/accesskey/send')
				.send({ email })
				.expect(HttpStatus.CREATED)

			const response = await request(app.getHttpServer())
				.post('/api/auth/accesskey/verify')
				.send({ email, code })
				.expect(HttpStatus.BAD_REQUEST)

			expect(response.body.message).toContain('invalid code')
		})

		it('should throw an error if the access key is expired', async () => {
			const email = 'test@example.com'
			const code = '123456'

			await request(app.getHttpServer())
				.post('/api/auth/accesskey/send')
				.send({ email })
				.expect(HttpStatus.CREATED)

			await new Promise((resolve) => setTimeout(resolve, 5000))

			const response = await request(app.getHttpServer())
				.post('/api/auth/accesskey/verify')
				.send({ email, code })
				.expect(HttpStatus.BAD_REQUEST)

			expect(response.body.message).toContain('access key expired')
		})

		it('should return true if the access key is valid and not expired', async () => {
			const email = 'test@example.com'
			const code = '123456'

			await request(app.getHttpServer())
				.post('/api/auth/accesskey/send')
				.send({ email })
				.expect(HttpStatus.CREATED)

			const response = await request(app.getHttpServer())
				.post('/api/auth/accesskey/verify')
				.send({ email, code })
				.expect(HttpStatus.OK)

			expect(response.body).toBeDefined()
			expect(response.body).not.toBeNull()
		})
	})

	describe('POST /api/auth/refresh', () => {
		it('should refresh the access token', async () => {
			const email = 'test@example.com'
			const code = '123456'

			await request(app.getHttpServer())
				.post('/api/auth/accesskey/send')
				.send({ email })
				.expect(HttpStatus.CREATED)

			const tokens = await request(app.getHttpServer())
				.post('/api/auth/accesskey/verify')
				.send({ email, code })
				.expect(HttpStatus.OK)

			const response = await request(app.getHttpServer())
				.post('/api/auth/refresh')
				.set('Cookie', `Refresh=${tokens.body.refreshToken}`)
				.expect(HttpStatus.CREATED)

			expect(response.body).toBeDefined()
			expect(response.body.accessToken).toBeDefined()
			expect(response.body.refreshToken).toBeDefined()
		})

		it('should return a 401 error if the refresh token is invalid', async () => {
			const response = await request(app.getHttpServer())
				.post('/api/auth/refresh')
				.set('Cookie', `Refresh=invalid-refresh-token`)
				.expect(HttpStatus.UNAUTHORIZED)

			expect(response.body.message).toContain('Unauthorized')
		})

		it('should return a 401 error if the refresh token is not found', async () => {
			const response = await request(app.getHttpServer())
				.post('/api/auth/refresh')
				.set('Cookie', `Refresh=`)
				.expect(HttpStatus.UNAUTHORIZED)

			expect(response.body.message).toContain('Unauthorized')
		})
	})
})
