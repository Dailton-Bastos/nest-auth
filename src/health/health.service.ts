import { Injectable } from '@nestjs/common'

@Injectable()
export class HealthService {
	health(): {
		status: string
		timestamp: Date
	} {
		return {
			status: 'ok',
			timestamp: new Date()
		}
	}
}
