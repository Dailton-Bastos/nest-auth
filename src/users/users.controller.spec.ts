// biome-ignore lint/style/useImportType: <Nest can't resolve dependencies>
import { User } from './entities/user.entity'
import { UsersController } from './users.controller'

describe('UsersController', () => {
	let controller: UsersController

	beforeEach(async () => {
		controller = new UsersController()
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
	})

	describe('whoami', () => {
		it('should return the current user', async () => {
			const user = {
				id: 1,
				email: 'test@example.com'
			} as User

			jest.spyOn(controller, 'whoami').mockResolvedValue(user)

			const result = await controller.whoami(user)

			expect(result).toEqual(user)
		})
	})
})
