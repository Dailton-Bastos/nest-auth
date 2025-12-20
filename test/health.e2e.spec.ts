import type { INestApplication } from '@nestjs/common'
import { HttpStatus } from '@nestjs/common'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { HealthModule } from '../src/health/health.module'

describe('HealthE2E', () => {
	let app: INestApplication

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [HealthModule]
		}).compile()

		app = module.createNestApplication()

		await app.init()
	})

	afterEach(async () => {
		await app.close()
	})

	describe('GET /health', () => {
		it('should return status ok and timestamp', async () => {
			const response = await request(app.getHttpServer())
				.get('/health')
				.expect(HttpStatus.OK)

			expect(response.body.status).toBe('ok')
			expect(new Date(response.body.timestamp)).toBeInstanceOf(Date)
		})
	})
})
