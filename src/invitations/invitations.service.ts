import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation } from '../database/entities/invitation.entity';
import { Guest } from '../database/entities/guest.entity';
import { EmailService } from '../email/email.service';
import { ExternalConfirmation } from '../database/entities/external-confirmation.entity';
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
    @InjectRepository(ExternalConfirmation)
    private confirmationRepository: Repository<ExternalConfirmation>,
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

  /**
   * Generate or reuse a unique public slug and return a share URL
   */
  async generateUniqueLink(id: string, organizerId: string, frontendBaseUrl: string): Promise<{ link: string; slug: string }> {
    const invitation = await this.findOne(id);
    if (invitation.createdById !== organizerId) {
      throw new ForbiddenException('You cannot share this invitation');
    }
    // Reuse existing slug if present; otherwise, generate a random UUID slug
    const slug = invitation.uniqueLink || (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
    invitation.uniqueLink = slug;
    await this.invitationRepository.save(invitation);
    const link = `${frontendBaseUrl.replace(/\/$/, '')}/invitation/${slug}`;
    return { link, slug };
  }

  /**
   * Find an invitation by its public slug (uniqueLink) with minimal public-safe fields
   */
  async findByUniqueLink(slug: string): Promise<any> {
    const invitation = await this.invitationRepository.findOne({
      where: { uniqueLink: slug },
      relations: ['event'],
    });
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }
    const event = invitation.event;
    return {
      id: invitation.id,
      title: invitation.title,
      message: invitation.message,
      customDesign: invitation.customDesign,
      event: event
        ? {
            title: event.title,
            description: event.description,
            eventDate: event.eventDate,
            location: event.location,
          }
        : undefined,
    };
  }

  async createExternalConfirmationBySlug(slug: string, name: string, lastName: string) {
    const invitation = await this.invitationRepository.findOne({ where: { uniqueLink: slug } });
    if (!invitation) throw new NotFoundException('Invitation not found');
    const entity = this.confirmationRepository.create({ invitationId: invitation.id, name, lastName });
    const saved = await this.confirmationRepository.save(entity);
    return { id: saved.id, name: saved.name, lastName: saved.lastName, createdAt: saved.createdAt };
  }

  async listExternalConfirmations(invitationId: string, organizerId: string) {
    const invitation = await this.invitationRepository.findOne({ where: { id: invitationId } });
    if (!invitation) throw new NotFoundException('Invitation not found');
    if (invitation.createdById !== organizerId) {
      throw new ForbiddenException('You do not own this invitation');
    }
    const list = await this.confirmationRepository.find({ where: { invitationId }, order: { createdAt: 'DESC' } });
    return list.map((c) => ({ id: c.id, name: c.name, lastName: c.lastName, createdAt: c.createdAt }));
  }

  async updateExternalConfirmation(
    invitationId: string,
    organizerId: string,
    confirmationId: string,
    patch: { name?: string; lastName?: string },
  ) {
    const invitation = await this.invitationRepository.findOne({ where: { id: invitationId } });
    if (!invitation) throw new NotFoundException('Invitation not found');
    if (invitation.createdById !== organizerId) {
      throw new ForbiddenException('You do not own this invitation');
    }
    const conf = await this.confirmationRepository.findOne({ where: { id: confirmationId } });
    if (!conf || conf.invitationId !== invitationId) {
      throw new NotFoundException('Confirmation not found');
    }
    if (typeof patch.name === 'string') conf.name = patch.name;
    if (typeof patch.lastName === 'string') conf.lastName = patch.lastName;
    const saved = await this.confirmationRepository.save(conf);
    return { id: saved.id, name: saved.name, lastName: saved.lastName, createdAt: saved.createdAt };
  }

  async removeExternalConfirmation(invitationId: string, organizerId: string, confirmationId: string) {
    const invitation = await this.invitationRepository.findOne({ where: { id: invitationId } });
    if (!invitation) throw new NotFoundException('Invitation not found');
    if (invitation.createdById !== organizerId) {
      throw new ForbiddenException('You do not own this invitation');
    }
    const conf = await this.confirmationRepository.findOne({ where: { id: confirmationId } });
    if (!conf || conf.invitationId !== invitationId) {
      throw new NotFoundException('Confirmation not found');
    }
    await this.confirmationRepository.remove(conf);
    return { ok: true };
  }
}