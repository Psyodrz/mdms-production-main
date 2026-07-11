import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { BlogPostStatus } from '@mdms/types';
import sanitizeHtml from 'sanitize-html';
import { randomUUID } from 'crypto';
import { PaginationDto } from '../common/dto/pagination.dto';

const REORDER_MODELS = [
  'portfolioItem',
  'testimonial',
  'teamMember',
  'faqItem',
  'service',
  'announcement',
] as const;

type ReorderModel = (typeof REORDER_MODELS)[number];

@Injectable()
export class CmsService {
  private readonly logger = new Logger(CmsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  private getModel(modelType: string) {
    const MODEL_MAP = {
      blog:         this.prisma.blogPost,
      blogPost:     this.prisma.blogPost,
      portfolio:    this.prisma.portfolioItem,
      portfolioItem:this.prisma.portfolioItem,
      testimonial:  this.prisma.testimonial,
      team:         this.prisma.teamMember,
      teamMember:   this.prisma.teamMember,
      faq:          this.prisma.faqItem,
      faqItem:      this.prisma.faqItem,
      service:      this.prisma.service,
      announcement: this.prisma.announcement,
      contactSubmission: this.prisma.contactSubmission,
    } as const;

    const model = MODEL_MAP[modelType as keyof typeof MODEL_MAP];
    if (!model) {
      throw new BadRequestException(`Unknown content type: ${modelType}`);
    }
    return model;
  }

  private async audit(params: {
    actorId: string;
    action: string;
    resource: string;
    resourceId?: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  }): Promise<void> {
    try {
      await this.auditService.log(params);
    } catch (err) {
      this.logger.error(
        `Failed to write audit log for ${params.action} ${params.resource}`,
        err as Error,
      );
    }
  }

  // ── Portfolio ──────────────────────────────────────────────
  async getPortfolioItems(publishedOnly: boolean = false, dto?: PaginationDto) {
    if (dto) {
      const { page = 1, limit = 20, orderBy = 'sortOrder', direction = 'asc' } = dto;
      const [data, total] = await Promise.all([
        this.prisma.portfolioItem.findMany({
          where: {
            deletedAt: null,
            ...(publishedOnly ? { isPublished: true } : {})
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [orderBy]: direction }
        }),
        this.prisma.portfolioItem.count({
          where: {
            deletedAt: null,
            ...(publishedOnly ? { isPublished: true } : {})
          }
        })
      ]);
      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }

    return this.prisma.portfolioItem.findMany({
      where: {
        deletedAt: null,
        ...(publishedOnly ? { isPublished: true } : {})
      },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async getPortfolioItem(slug: string) {
    const item = await this.prisma.portfolioItem.findFirst({
      where: { slug, deletedAt: null }
    });
    if (!item) throw new NotFoundException('Portfolio item not found');
    return item;
  }

  async upsertPortfolioItem(slug: string, data: any, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const existing = await this.prisma.portfolioItem.findUnique({ where: { slug } });
    const isNew = !existing;

    const result = await this.prisma.portfolioItem.upsert({
      where: { slug },
      update: { ...data, deletedAt: null },
      create: { slug, ...data }
    });

    await this.audit({
      actorId,
      action: isNew ? 'CREATE_PORTFOLIO_ITEM' : 'UPDATE_PORTFOLIO_ITEM',
      resource: 'PortfolioItem',
      resourceId: result.id,
      before: existing ? (existing as any) : undefined,
      after: result as any
    });
    return result;
  }

  async softDeletePortfolioItem(id: string, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const result = await this.prisma.portfolioItem.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    await this.audit({ actorId, action: 'DELETE_PORTFOLIO_ITEM', resource: 'PortfolioItem', resourceId: id });
    return result;
  }

  // ── Blog ───────────────────────────────────────────────────
  async getBlogPosts(status?: BlogPostStatus, dto?: PaginationDto) {
    if (dto) {
      const { page = 1, limit = 20, orderBy = 'createdAt', direction = 'desc' } = dto;
      const [data, total] = await Promise.all([
        this.prisma.blogPost.findMany({
          where: {
            deletedAt: null,
            ...(status ? { status } : {})
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [orderBy]: direction }
        }),
        this.prisma.blogPost.count({
          where: {
            deletedAt: null,
            ...(status ? { status } : {})
          }
        })
      ]);
      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }

    return this.prisma.blogPost.findMany({
      where: {
        deletedAt: null,
        ...(status ? { status } : {})
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getBlogPostBySlug(slug: string, token?: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: { slug, deletedAt: null }
    });
    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    if (token) {
      if (post.previewToken !== token) {
        throw new ForbiddenException('Invalid preview token');
      }
      return post;
    }

    if (post.status !== BlogPostStatus.PUBLISHED) {
      throw new NotFoundException('Blog post not found');
    }

    return post;
  }

  async upsertBlogPost(slug: string, data: any, authorId?: string) {
    if (!authorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const existing = await this.prisma.blogPost.findUnique({ where: { slug } });
    const isNew = !existing;

    const cleanContent = data.content ? sanitizeHtml(data.content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'figure', 'figcaption']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src', 'alt', 'width', 'height'],
        a: ['href', 'target', 'rel'],
      },
    }) : undefined;

    const previewToken = randomUUID();
    const updateData = {
      ...data,
      ...(cleanContent && { content: cleanContent }),
      previewToken,
      deletedAt: null,
    };
    const createData = {
      slug,
      authorId,
      ...data,
      ...(cleanContent && { content: cleanContent }),
      previewToken,
    };

    const result = await this.prisma.blogPost.upsert({
      where: { slug },
      update: updateData,
      create: createData
    });

    await this.audit({
      actorId: authorId,
      action: isNew ? 'CREATE_BLOG_POST' : 'UPDATE_BLOG_POST',
      resource: 'BlogPost',
      resourceId: result.id,
      before: existing ? (existing as any) : undefined,
      after: result as any
    });
    return result;
  }

  async softDeleteBlogPost(id: string, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const result = await this.prisma.blogPost.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    await this.audit({ actorId, action: 'DELETE_BLOG_POST', resource: 'BlogPost', resourceId: id });
    return result;
  }

  async getActiveCastingCalls() {
    return this.prisma.castingCall.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' }
    });
  }

  // ── Testimonials ───────────────────────────────────────────
  async getTestimonials(publishedOnly: boolean = false, dto?: PaginationDto) {
    if (dto) {
      const { page = 1, limit = 20, orderBy = 'sortOrder', direction = 'asc' } = dto;
      const [data, total] = await Promise.all([
        this.prisma.testimonial.findMany({
          where: {
            deletedAt: null,
            ...(publishedOnly ? { isPublished: true, isApproved: true } : {})
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [orderBy]: direction }
        }),
        this.prisma.testimonial.count({
          where: {
            deletedAt: null,
            ...(publishedOnly ? { isPublished: true, isApproved: true } : {})
          }
        })
      ]);
      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }

    return this.prisma.testimonial.findMany({
      where: {
        deletedAt: null,
        ...(publishedOnly ? { isPublished: true, isApproved: true } : {})
      },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async createTestimonial(data: any, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const result = await this.prisma.testimonial.create({ data });
    await this.audit({ actorId, action: 'CREATE_TESTIMONIAL', resource: 'Testimonial', resourceId: result.id, after: result as any });
    return result;
  }

  async updateTestimonial(id: string, data: any, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const existing = await this.prisma.testimonial.findUnique({ where: { id } });
    const result = await this.prisma.testimonial.update({ where: { id }, data });
    await this.audit({
      actorId,
      action: 'UPDATE_TESTIMONIAL',
      resource: 'Testimonial',
      resourceId: id,
      before: existing ? (existing as any) : undefined,
      after: result as any
    });
    return result;
  }

  async softDeleteTestimonial(id: string, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const result = await this.prisma.testimonial.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    await this.audit({ actorId, action: 'DELETE_TESTIMONIAL', resource: 'Testimonial', resourceId: id });
    return result;
  }

  // ── Team ───────────────────────────────────────────────────
  async getTeamMembers(publishedOnly: boolean = false, dto?: PaginationDto) {
    if (dto) {
      const { page = 1, limit = 20, orderBy = 'sortOrder', direction = 'asc' } = dto;
      const [data, total] = await Promise.all([
        this.prisma.teamMember.findMany({
          where: {
            deletedAt: null,
            ...(publishedOnly ? { isPublished: true } : {})
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [orderBy]: direction }
        }),
        this.prisma.teamMember.count({
          where: {
            deletedAt: null,
            ...(publishedOnly ? { isPublished: true } : {})
          }
        })
      ]);
      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }

    return this.prisma.teamMember.findMany({
      where: {
        deletedAt: null,
        ...(publishedOnly ? { isPublished: true } : {})
      },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async upsertTeamMember(id: string | null, data: any, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const existing = id ? await this.prisma.teamMember.findUnique({ where: { id } }) : null;
    const isNew = !existing;

    const result = id
      ? await this.prisma.teamMember.update({ where: { id }, data })
      : await this.prisma.teamMember.create({ data });

    await this.audit({
      actorId,
      action: isNew ? 'CREATE_TEAM_MEMBER' : 'UPDATE_TEAM_MEMBER',
      resource: 'TeamMember',
      resourceId: result.id,
      before: existing ? (existing as any) : undefined,
      after: result as any
    });
    return result;
  }

  async softDeleteTeamMember(id: string, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const result = await this.prisma.teamMember.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    await this.audit({ actorId, action: 'DELETE_TEAM_MEMBER', resource: 'TeamMember', resourceId: id });
    return result;
  }

  // ── FAQ ────────────────────────────────────────────────────
  async getFaqItems(publishedOnly: boolean = false, dto?: PaginationDto) {
    if (dto) {
      const { page = 1, limit = 20, orderBy = 'sortOrder', direction = 'asc' } = dto;
      const [data, total] = await Promise.all([
        this.prisma.faqItem.findMany({
          where: {
            deletedAt: null,
            ...(publishedOnly ? { isPublished: true } : {})
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [orderBy]: direction }
        }),
        this.prisma.faqItem.count({
          where: {
            deletedAt: null,
            ...(publishedOnly ? { isPublished: true } : {})
          }
        })
      ]);
      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }

    return this.prisma.faqItem.findMany({
      where: {
        deletedAt: null,
        ...(publishedOnly ? { isPublished: true } : {})
      },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async upsertFaqItem(id: string | null, data: any, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const existing = id ? await this.prisma.faqItem.findUnique({ where: { id } }) : null;
    const isNew = !existing;

    const result = id
      ? await this.prisma.faqItem.update({ where: { id }, data })
      : await this.prisma.faqItem.create({ data });

    await this.audit({
      actorId,
      action: isNew ? 'CREATE_FAQ_ITEM' : 'UPDATE_FAQ_ITEM',
      resource: 'FaqItem',
      resourceId: result.id,
      before: existing ? (existing as any) : undefined,
      after: result as any
    });
    return result;
  }

  async softDeleteFaqItem(id: string, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const result = await this.prisma.faqItem.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    await this.audit({ actorId, action: 'DELETE_FAQ_ITEM', resource: 'FaqItem', resourceId: id });
    return result;
  }

  // ── Services ───────────────────────────────────────────────
  async getServices(activeOnly: boolean = false, dto?: PaginationDto) {
    if (dto) {
      const { page = 1, limit = 20, orderBy = 'sortOrder', direction = 'asc' } = dto;
      const [data, total] = await Promise.all([
        this.prisma.service.findMany({
          where: {
            deletedAt: null,
            ...(activeOnly ? { isActive: true } : {})
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [orderBy]: direction }
        }),
        this.prisma.service.count({
          where: {
            deletedAt: null,
            ...(activeOnly ? { isActive: true } : {})
          }
        })
      ]);
      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }

    return this.prisma.service.findMany({
      where: {
        deletedAt: null,
        ...(activeOnly ? { isActive: true } : {})
      },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async getServiceBySlug(slug: string) {
    const service = await this.prisma.service.findFirst({
      where: { slug, deletedAt: null }
    });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async upsertService(slug: string, data: any, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const existing = await this.prisma.service.findUnique({ where: { slug } });
    const isNew = !existing;

    const result = await this.prisma.service.upsert({
      where: { slug },
      update: { ...data, deletedAt: null },
      create: { slug, ...data }
    });

    await this.audit({
      actorId,
      action: isNew ? 'CREATE_SERVICE' : 'UPDATE_SERVICE',
      resource: 'Service',
      resourceId: result.id,
      before: existing ? (existing as any) : undefined,
      after: result as any
    });
    return result;
  }

  async softDeleteService(id: string, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const result = await this.prisma.service.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    await this.audit({ actorId, action: 'DELETE_SERVICE', resource: 'Service', resourceId: id });
    return result;
  }

  // ── Contact Submissions ────────────────────────────────────
  async submitContactForm(data: { name: string; email: string; phone?: string; subject?: string; message: string }) {
    return this.prisma.contactSubmission.create({
      data
    });
  }

  async getContactSubmissions(dto?: PaginationDto) {
    if (dto) {
      const { page = 1, limit = 20, orderBy = 'createdAt', direction = 'desc' } = dto;
      const [data, total] = await Promise.all([
        this.prisma.contactSubmission.findMany({
          where: { deletedAt: null },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [orderBy]: direction }
        }),
        this.prisma.contactSubmission.count({
          where: { deletedAt: null }
        })
      ]);
      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }

    return this.prisma.contactSubmission.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });
  }

  async markContactRead(id: string, isRead: boolean = true) {
    return this.prisma.contactSubmission.update({
      where: { id },
      data: { isRead }
    });
  }

  async softDeleteContact(id: string, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const result = await this.prisma.contactSubmission.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    await this.audit({ actorId, action: 'DELETE_CONTACT_SUBMISSION', resource: 'ContactSubmission', resourceId: id });
    return result;
  }

  // ── Newsletter Subscribers ─────────────────────────────────
  async subscribeNewsletter(email: string) {
    return this.prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true, deletedAt: null },
      create: { email, isActive: true }
    });
  }

  async getNewsletterSubscribers(dto?: PaginationDto) {
    if (dto) {
      const { page = 1, limit = 20, orderBy = 'createdAt', direction = 'desc' } = dto;
      const [data, total] = await Promise.all([
        this.prisma.newsletterSubscriber.findMany({
          where: { deletedAt: null },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [orderBy]: direction }
        }),
        this.prisma.newsletterSubscriber.count({
          where: { deletedAt: null }
        })
      ]);
      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }

    return this.prisma.newsletterSubscriber.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });
  }

  async deleteNewsletterSubscriber(id: string, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const result = await this.prisma.newsletterSubscriber.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false }
    });
    await this.audit({ actorId, action: 'DELETE_NEWSLETTER_SUBSCRIBER', resource: 'NewsletterSubscriber', resourceId: id });
    return result;
  }

  // ── Announcements ──────────────────────────────────────────
  async getAnnouncements(activeOnly: boolean = false, dto?: PaginationDto) {
    if (dto) {
      const { page = 1, limit = 20, orderBy = 'sortOrder', direction = 'asc' } = dto;
      const [data, total] = await Promise.all([
        this.prisma.announcement.findMany({
          where: {
            deletedAt: null,
            ...(activeOnly ? { isActive: true } : {})
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [orderBy]: direction }
        }),
        this.prisma.announcement.count({
          where: {
            deletedAt: null,
            ...(activeOnly ? { isActive: true } : {})
          }
        })
      ]);
      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }

    return this.prisma.announcement.findMany({
      where: {
        deletedAt: null,
        ...(activeOnly ? { isActive: true } : {})
      },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async upsertAnnouncement(id: string | null, data: any, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const existing = id ? await this.prisma.announcement.findUnique({ where: { id } }) : null;
    const isNew = !existing;

    const result = id
      ? await this.prisma.announcement.update({ where: { id }, data })
      : await this.prisma.announcement.create({ data });

    await this.audit({
      actorId,
      action: isNew ? 'CREATE_ANNOUNCEMENT' : 'UPDATE_ANNOUNCEMENT',
      resource: 'Announcement',
      resourceId: result.id,
      before: existing ? (existing as any) : undefined,
      after: result as any
    });
    return result;
  }

  async softDeleteAnnouncement(id: string, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const result = await this.prisma.announcement.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    await this.audit({ actorId, action: 'DELETE_ANNOUNCEMENT', resource: 'Announcement', resourceId: id });
    return result;
  }

  // ── System / Site Configs (Hero, Navbar, Footer, SEO) ──────
  async getConfig(key: string) {
    const config = await this.prisma.systemConfig.findUnique({ where: { key } });
    if (!config) return null;
    try {
      return JSON.parse(config.value);
    } catch {
      return config.value;
    }
  }

  async setConfig(key: string, value: any, type: string = 'json', actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    const existing = await this.prisma.systemConfig.findUnique({ where: { key } });
    const result = await this.prisma.systemConfig.upsert({
      where: { key },
      update: { value: stringValue, type },
      create: { key, value: stringValue, type }
    });
    await this.audit({
      actorId,
      action: 'SET_CONFIG',
      resource: 'SystemConfig',
      resourceId: key,
      before: existing ? { value: existing.value } : undefined,
      after: { value: stringValue }
    });
    return result;
  }

  // ── Reordering (Batch SortOrder Update) ────────────────────
  async reorderItems(model: string, items: { id: string; sortOrder: number }[], actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    if (!REORDER_MODELS.includes(model as ReorderModel)) {
      throw new BadRequestException(`Invalid model for reorder: ${model}`);
    }
    const delegate = this.prisma[model as ReorderModel] as any;
    const queries = items.map(item =>
      delegate.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder }
      })
    );
    const result = await this.prisma.$transaction(queries);
    await this.audit({ actorId, action: 'CMS_REORDER', resource: model });
    return result;
  }

  // ── Recycle Bin (Soft Deleted Items & Purge) ───────────────
  async getRecycleBinItems() {
    const [portfolio, blog, testimonials, team, faq, services, contact, announcements] = await Promise.all([
      this.prisma.portfolioItem.findMany({ where: { deletedAt: { not: null } } }),
      this.prisma.blogPost.findMany({ where: { deletedAt: { not: null } } }),
      this.prisma.testimonial.findMany({ where: { deletedAt: { not: null } } }),
      this.prisma.teamMember.findMany({ where: { deletedAt: { not: null } } }),
      this.prisma.faqItem.findMany({ where: { deletedAt: { not: null } } }),
      this.prisma.service.findMany({ where: { deletedAt: { not: null } } }),
      this.prisma.contactSubmission.findMany({ where: { deletedAt: { not: null } } }),
      this.prisma.announcement.findMany({ where: { deletedAt: { not: null } } })
    ]);

    return [
      ...portfolio.map(i => ({ ...i, modelType: 'portfolioItem' })),
      ...blog.map(i => ({ ...i, modelType: 'blogPost' })),
      ...testimonials.map(i => ({ ...i, modelType: 'testimonial' })),
      ...team.map(i => ({ ...i, modelType: 'teamMember' })),
      ...faq.map(i => ({ ...i, modelType: 'faqItem' })),
      ...services.map(i => ({ ...i, modelType: 'service' })),
      ...contact.map(i => ({ ...i, modelType: 'contactSubmission' })),
      ...announcements.map(i => ({ ...i, modelType: 'announcement' }))
    ];
  }

  async restoreRecycleBinItem(modelType: string, id: string, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const model = this.getModel(modelType);
    const result = await (model as any).update({
      where: { id },
      data: { deletedAt: null }
    });
    await this.audit({ actorId, action: 'RESTORE_CMS_ITEM', resource: modelType, resourceId: id });
    return result;
  }

  async permanentDeleteRecycleBinItem(modelType: string, id: string, actorId?: string) {
    if (!actorId) {
      throw new InternalServerErrorException('User ID is required for audit trail.');
    }
    const model = this.getModel(modelType);
    const result = await (model as any).delete({
      where: { id }
    });
    await this.audit({ actorId, action: 'PERMANENT_DELETE_CMS_ITEM', resource: modelType, resourceId: id });
    return result;
  }
}
