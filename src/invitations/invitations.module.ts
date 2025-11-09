import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './invitations.controller';
import { Invitation } from '../database/entities/invitation.entity';
import { Guest } from '../database/entities/guest.entity';
import { Event } from '../database/entities/event.entity';
import { Template } from '../database/entities/template.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Invitation, Guest, Event, Template]), EmailModule],
  controllers: [InvitationsController],
  providers: [InvitationsService],
  exports: [InvitationsService],
})
export class InvitationsModule {}