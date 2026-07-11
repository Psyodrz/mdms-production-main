import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CmsSchedulerService {
  private readonly logger = new Logger(CmsSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async publishScheduledPosts() {
    const now = new Date();
    const posts = await this.prisma.blogPost.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: { lte: now },
        deletedAt: null,
      },
    });

    for (const post of posts) {
      await this.prisma.blogPost.update({
        where: { id: post.id },
        data: { status: 'PUBLISHED', publishedAt: now },
      });
      this.logger.log(`Auto-published blog post: ${post.slug}`);
      await this.auditService.log({
        actorId: undefined, // Avoid foreign key constraint failure
        action: 'AUTO_PUBLISH_BLOG_POST',
        resource: 'blogPost',
        resourceId: post.id,
        after: { slug: post.slug, status: 'PUBLISHED' },
      });
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async purgeOldRecycleBinItems() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30); // 30 days

    // Permanently delete soft-deleted items older than 30 days
    const models = ['blogPost', 'portfolioItem', 'testimonial', 'teamMember'] as const;
    for (const model of models) {
      const deleted = await (this.prisma[model] as any).deleteMany({
        where: { deletedAt: { lte: cutoff } },
      });
      if (deleted.count > 0) {
        this.logger.log(`Purged ${deleted.count} old ${model} items from recycle bin.`);
      }
    }
  }
}
