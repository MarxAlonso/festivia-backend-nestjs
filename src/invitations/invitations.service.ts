import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation } from '../database/entities/invitation.entity';
import { Guest } from '../database/entities/guest.entity';
import { EmailService } from '../email/email.service';
import { Event } from '../database/entities/event.entity';
import { Template } from '../database/entities/template.entity';
import { CreateInvitationDto } from './dto/create-invitation.dto';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    @InjectRepository(Guest)
    private guestRepository: Repository<Guest>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Template)
    private templateRepository: Repository<Template>,
    private emailService: EmailService,
  ) {}

  async findAll(): Promise<Invitation[]> {
    return this.invitationRepository.find({ 
      relations: ['event', 'createdBy', 'template', 'guests'] 
    });
  }

  async findOne(id: string): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({ 
      where: { id },
      relations: ['event', 'createdBy', 'template', 'guests'] 
    });
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }
    return invitation;
  }

  async create(invitationData: Partial<Invitation>): Promise<Invitation> {
    const invitation = this.invitationRepository.create(invitationData);
    const savedInvitation = await this.invitationRepository.save(invitation);
    
    // Send invitation email
    const invAny = invitationData as any;
    if (invAny.email) {
      await this.emailService.sendInvitation(
        invAny.email,
        invAny.event?.name || 'Evento',
        savedInvitation,
      );
    }
    
    return savedInvitation;
  }

  /**
   * Create invitation by organizer
   * - Validates the event belongs to organizer
   * - Optionally clones template.design into customDesign
   */
  async createForOrganizer(dto: CreateInvitationDto, organizerId: string): Promise<Invitation> {
    const event = await this.eventRepository.findOne({ where: { id: dto.eventId } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.organizerId !== organizerId) {
      throw new ForbiddenException('You do not own this event');
    }

    let customDesign: Record<string, any> | undefined = undefined;
    let template: Template | null = null;
    if (dto.templateId) {
      template = await this.templateRepository.findOne({ where: { id: dto.templateId } });
      if (!template) {
        throw new NotFoundException('Template not found');
      }
      customDesign = template.design as any;
    }

    const invitation = this.invitationRepository.create({
      title: dto.title,
      message: dto.message,
      type: dto.type,
      eventId: dto.eventId,
      createdById: organizerId,
      templateId: dto.templateId,
      customDesign,
      status: undefined,
    });
    return this.invitationRepository.save(invitation);
  }

  async findMy(organizerId: string): Promise<Invitation[]> {
    return this.invitationRepository.find({
      where: { createdById: organizerId },
      relations: ['event', 'createdBy', 'template', 'guests'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateDesign(id: string, organizerId: string, customDesign: Record<string, any>): Promise<Invitation> {
    const invitation = await this.findOne(id);
    if (invitation.createdById !== organizerId) {
      throw new ForbiddenException('You cannot edit this invitation');
    }
    invitation.customDesign = customDesign;
    return this.invitationRepository.save(invitation);
  }

  async update(id: string, invitationData: Partial<Invitation>): Promise<Invitation> {
    const invitation = await this.findOne(id);
    Object.assign(invitation, invitationData);
    return this.invitationRepository.save(invitation);
  }

  async remove(id: string): Promise<void> {
    const invitation = await this.findOne(id);
    await this.invitationRepository.remove(invitation);
  }

  async addGuest(invitationId: string, guestData: Partial<Guest>): Promise<Guest> {
    const invitation = await this.findOne(invitationId);
    const guest = this.guestRepository.create({
      ...guestData,
      invitation,
    });
    return this.guestRepository.save(guest);
  }
}