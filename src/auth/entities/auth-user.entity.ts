import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class AuthUserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  refreshToken: string;
}
