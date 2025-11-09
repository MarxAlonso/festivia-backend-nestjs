import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../database/entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async findMy(organizerId: string): Promise<Event[]> {
    return this.eventRepository.find({
      where: { organizerId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async create(dto: CreateEventDto, organizerId: string): Promise<Event> {
    const event = this.eventRepository.create({ ...dto, organizerId });
    return this.eventRepository.save(event);
  }

  async update(id: string, organizerId: string, dto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);
    if (event.organizerId !== organizerId) {
      throw new ForbiddenException('You do not own this event');
    }
    Object.assign(event, dto);
    return this.eventRepository.save(event);
  }

  async remove(id: string, organizerId: string): Promise<void> {
    const event = await this.findOne(id);
    if (event.organizerId !== organizerId) {
      throw new ForbiddenException('You do not own this event');
    }
    await this.eventRepository.remove(event);
  }
}