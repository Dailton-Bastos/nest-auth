import { HttpStatus } from '@nestjs/common'
import request from 'supertest'
import { app } from './setup'

describe('Users (e2e)', () => {
	describe('GET /api/users/whoami', () => {
		it('should return the current user logged with access code', async () => {
			const email = 'test@example.com'
			const code = '123456'

			await request(app.getHttpServer())
				.post('/api/auth/accesskey/send')
				.send({ email })
				.expect(HttpStatus.CREATED)

			const accessToken = await request(app.getHttpServer())
				.post('/api/auth/accesskey/verify')
				.send({ email, code })
				.expect(HttpStatus.OK)

			expect(accessToken.body).toBeDefined()
			expect(accessToken.body.accessToken).toBeDefined()

			const response = await request(app.getHttpServer())
				.get('/api/users/whoami')
				.set('Authorization', `Bearer ${accessToken.body.accessToken}`)
				.expect(HttpStatus.OK)

			expect(response.body.id).toBeDefined()
			expect(response.body.email).toEqual(email)
		})
	})
})
