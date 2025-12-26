export abstract class HashingService {
	abstract hash(value: string): Promise<string>
	abstract verify(value: string, hash: string): Promise<boolean>
}
