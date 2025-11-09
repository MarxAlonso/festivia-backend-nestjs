import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { EventType } from '../../database/entities/event.entity';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(EventType)
  type: EventType;

  @IsDateString()
  eventDate: Date;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  // address is JSON; validation kept simple for MVP
  address?: Record<string, any>;

  @IsOptional()
  // settings is JSON; validation kept simple for MVP
  settings?: Record<string, any>;

  @IsOptional()
  @IsString()
  coverImage?: string;
}