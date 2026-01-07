import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from 'typeorm'

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ unique: true })
	email: string

	@Column({ nullable: true })
	password?: string

	@CreateDateColumn()
	createdAt: Date

	@UpdateDateColumn()
	updatedAt: Date
}
