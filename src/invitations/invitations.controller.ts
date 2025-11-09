import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InvitationsService } from './invitations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/entities/user.entity';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDesignDto } from './dto/update-invitation-design.dto';

@ApiTags('invitations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @ApiOperation({ summary: 'Create a new invitation (organizer only)' })
  @ApiResponse({ status: 201, description: 'Invitation created successfully' })
  create(@Body() dto: CreateInvitationDto, @Request() req: any) {
    const organizerId: string = req.user?.userId;
    return this.invitationsService.createForOrganizer(dto, organizerId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all invitations' })
  @ApiResponse({ status: 200, description: 'Invitations retrieved successfully' })
  findAll() {
    return this.invitationsService.findAll();
  }

  @Get('mine')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @ApiOperation({ summary: 'Get my invitations (organizer only)' })
  @ApiResponse({ status: 200, description: 'Invitations retrieved successfully' })
  findMine(@Request() req: any) {
    const organizerId: string = req.user?.sub;
    return this.invitationsService.findMy(organizerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invitation by ID' })
  @ApiResponse({ status: 200, description: 'Invitation retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  findOne(@Param('id') id: string) {
    return this.invitationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update invitation' })
  @ApiResponse({ status: 200, description: 'Invitation updated successfully' })
  update(@Param('id') id: string, @Body() invitationData: any) {
    return this.invitationsService.update(id, invitationData);
  }

  @Patch(':id/design')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @ApiOperation({ summary: 'Update invitation design (organizer only)' })
  @ApiResponse({ status: 200, description: 'Invitation design updated successfully' })
  updateDesign(@Param('id') id: string, @Body() dto: UpdateInvitationDesignDto, @Request() req: any) {
    const organizerId: string = req.user?.userId;
    return this.invitationsService.updateDesign(id, organizerId, dto.customDesign);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete invitation' })
  @ApiResponse({ status: 200, description: 'Invitation deleted successfully' })
  remove(@Param('id') id: string) {
    return this.invitationsService.remove(id);
  }

  @Post(':id/guests')
  @ApiOperation({ summary: 'Add guest to invitation' })
  @ApiResponse({ status: 201, description: 'Guest added successfully' })
  addGuest(@Param('id') id: string, @Body() guestData: any) {
    return this.invitationsService.addGuest(id, guestData);
  }
}
