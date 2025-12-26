import { Global, Module } from '@nestjs/common'
import { Argon2Service } from './argo2.service'
import { HashingService } from './hashing.service'

@Global()
@Module({
	providers: [
		{
			provide: HashingService,
			useClass: Argon2Service
		}
	],
	exports: [HashingService]
})
export class HashingModule {}
