/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateUserDto } from './dtos/create-user.dto'
import { User } from './entities/user.entity'

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	) {}

	async create(createUserDto: CreateUserDto) {
		const user = this.userRepository.create(createUserDto)

		await this.userRepository.save(user)

		return user
	}

	async findByEmail(email: string) {
		return this.userRepository.findOne({ where: { email } })
	}
}
