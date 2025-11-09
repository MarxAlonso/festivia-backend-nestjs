import { IsUUID, IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { InvitationType } from '../../database/entities/invitation.entity';

export class CreateInvitationDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsEnum(InvitationType)
  type?: InvitationType;

  @IsUUID()
  eventId: string;

  @IsOptional()
  @IsUUID()
  templateId?: string;

  @IsOptional()
  @IsObject()
  customDesign?: Record<string, any>;
}