import argon2 from '@node-rs/argon2'
// biome-ignore lint/style/useImportType: <Nest can't resolve dependencies>
import { HashingService } from './hashing.service'

export class Argon2Service implements HashingService {
	async hash(value: string): Promise<string> {
		return await argon2.hash(value)
	}

	async verify(value: string, hash: string): Promise<boolean> {
		return await argon2.verify(hash, value)
	}
}
