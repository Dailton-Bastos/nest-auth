import { HealthController } from './health.controller'

describe('HealthController', () => {
	let controller: HealthController
	const healthService = {
		health: jest.fn()
	}

	beforeEach(async () => {
		controller = new HealthController(healthService)
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
	})
})
