import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class AccessKey {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ unique: true })
	code: string

	@Column()
	expiresAt: Date

	@Column()
	email: string
}
