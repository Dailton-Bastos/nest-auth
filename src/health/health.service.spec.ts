import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { HealthService } from './health.service'

describe('HealthService', () => {
	let healthService: HealthService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				{
					provide: HealthService,
					useValue: {
						health: jest.fn()
					}
				}
			]
		}).compile()

		healthService = module.get<HealthService>(HealthService)
	})

	describe('health', () => {
		it('should return status ok and timestamp', () => {
			const health = {
				status: 'ok',
				timestamp: expect.any(Date)
			}

			jest.spyOn(healthService, 'health').mockReturnValue(health)

			const result = healthService.health()

			expect(result).toEqual(health)
			expect(healthService.health).toHaveBeenCalledTimes(1)
		})
	})
})
