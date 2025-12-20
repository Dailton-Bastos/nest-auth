import { Controller, Get } from '@nestjs/common'
// biome-ignore lint/style/useImportType: Nest can't resolve dependencies
import { HealthService } from './health.service'

@Controller('health')
export class HealthController {
	constructor(private readonly healthService: HealthService) {}

	@Get()
	health() {
		return this.healthService.health()
	}
}
