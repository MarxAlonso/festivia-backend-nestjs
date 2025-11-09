import { IsObject } from 'class-validator';

export class UpdateInvitationDesignDto {
  @IsObject()
  customDesign: Record<string, any>;
}