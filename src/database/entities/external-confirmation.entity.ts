import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Invitation } from './invitation.entity';

@Entity('external_confirmations')
export class ExternalConfirmation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'invitation_id' })
  invitationId: string;

  @ManyToOne(() => Invitation)
  @JoinColumn({ name: 'invitation_id' })
  invitation: Invitation;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}