import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/entities/user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@ApiTags('events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @ApiOperation({ summary: 'Create a new event (organizer only)' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  create(@Body() dto: CreateEventDto, @Request() req: any) {
    const organizerId: string = req.user?.userId;
    return this.eventsService.create(dto, organizerId);
  }

  @Get('mine')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @ApiOperation({ summary: 'Get my events (organizer only)' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  findMine(@Request() req: any) {
    const organizerId: string = req.user?.userId;
    return this.eventsService.findMy(organizerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiResponse({ status: 200, description: 'Event retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @ApiOperation({ summary: 'Update event (organizer only)' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  update(@Param('id') id: string, @Body() dto: UpdateEventDto, @Request() req: any) {
    const organizerId: string = req.user?.userId;
    return this.eventsService.update(id, organizerId, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @ApiOperation({ summary: 'Delete event (organizer only)' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  remove(@Param('id') id: string, @Request() req: any) {
    const organizerId: string = req.user?.userId;
    return this.eventsService.remove(id, organizerId);
  }
}
