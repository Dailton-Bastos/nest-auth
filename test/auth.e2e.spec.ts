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
})
