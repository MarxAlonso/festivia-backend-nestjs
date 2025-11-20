import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InvitationsService } from './invitations.service';

@ApiTags('public')
@Controller('public/invitations')
export class PublicInvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get(':slug')
  @ApiOperation({ summary: 'Get public invitation by share slug' })
  @ApiResponse({ status: 200, description: 'Public invitation retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.invitationsService.findByUniqueLink(slug);
  }

  @Post(':slug/confirmations')
  @ApiOperation({ summary: 'Create external confirmation for public invitation' })
  @ApiResponse({ status: 201, description: 'Confirmation created successfully' })
  createConfirmation(
    @Param('slug') slug: string,
    @Body() body: { name: string; lastName: string }
  ) {
    const name = body?.name || '';
    const lastName = body?.lastName || '';
    return this.invitationsService.createExternalConfirmationBySlug(slug, name, lastName);
  }
}