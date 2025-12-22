import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccessKeyService } from './access-key.service'
import { AccessKey } from './entities/access-key.entity'

@Module({
	imports: [TypeOrmModule.forFeature([AccessKey])],
	providers: [AccessKeyService]
})
export class AccessKeyModule {}
