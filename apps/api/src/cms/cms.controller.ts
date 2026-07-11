import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { CmsService } from './cms.service';
import { Public, Roles } from '../common/decorators/roles.decorator';
import { Role, BlogPostStatus } from '@mdms/types';
import {
  UpsertPortfolioDto,
  UpsertBlogDto,
  UpsertTeamDto,
  CreateTestimonialDto,
  UpsertFaqDto,
  UpsertServiceDto,
  UpsertAnnouncementDto,
  ReorderDto,
  ContactSubmissionDto,
  NewsletterDto,
  MarkContactReadDto,
  UpdateTestimonialDto,
} from './dto/cms.dto';

import { SetConfigDto } from './dto/set-config.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // ── Public Endpoints ───────────────────────────────────────
  @Public()
  @Get('portfolio')
  async getPublicPortfolio() {
    return this.cmsService.getPortfolioItems(true);
  }

  @Public()
  @Get('portfolio/:slug')
  async getPublicPortfolioItem(@Param('slug') slug: string) {
    return this.cmsService.getPortfolioItem(slug);
  }

  @Public()
  @Get('blog')
  async getPublicBlog() {
    return this.cmsService.getBlogPosts(BlogPostStatus.PUBLISHED);
  }

  @Public()
  @Get('blog/:slug')
  async getPublicBlogPost(@Param('slug') slug: string) {
    return this.cmsService.getBlogPostBySlug(slug);
  }

  @Public()
  @Get('preview/blog/:slug')
  async previewBlogPost(
    @Param('slug') slug: string,
    @Query('token') token: string,
  ) {
    return this.cmsService.getBlogPostBySlug(slug, token);
  }

  @Public()
  @Get('testimonials')
  async getPublicTestimonials() {
    return this.cmsService.getTestimonials(true);
  }

  @Public()
  @Get('team')
  async getPublicTeam() {
    const data = await this.cmsService.getTeamMembers(true);
    return { success: true, data };
  }

  @Public()
  @Get('casting-calls')
  async getPublicCastingCalls() {
    const data = await this.cmsService.getActiveCastingCalls();
    return { success: true, data };
  }

  @Public()
  @Get('faq')
  async getPublicFaq() {
    return this.cmsService.getFaqItems(true);
  }

  @Public()
  @Get('services')
  async getPublicServices() {
    return this.cmsService.getServices(true);
  }

  @Public()
  @Get('services/:slug')
  async getPublicServiceItem(@Param('slug') slug: string) {
    return this.cmsService.getServiceBySlug(slug);
  }

  @Public()
  @Get('announcements')
  async getPublicAnnouncements() {
    return this.cmsService.getAnnouncements(true);
  }

  @Public()
  @Get('hero')
  async getPublicHero(@Query('page') page?: string) {
    const key = page ? `hero_${page}` : 'hero';
    const data = await this.cmsService.getConfig(key);
    return { success: true, data };
  }

  @Public()
  @Get('stats')
  async getPublicStats() {
    const data = await this.cmsService.getConfig('stats');
    return { success: true, data };
  }

  @Public()
  @Get('pricing')
  async getPublicPricing() {
    const data = await this.cmsService.getConfig('pricing');
    return { success: true, data };
  }

  @Public()
  @Get('config/:key')
  async getPublicConfig(@Param('key') key: string) {
    const data = await this.cmsService.getConfig(key);
    return { success: true, data };
  }

  @Public()
  @Post('contact')
  async submitContact(@Body() body: ContactSubmissionDto) {
    const data = await this.cmsService.submitContactForm(body);
    return { success: true, data, message: 'Thank you for reaching out! We will contact you soon.' };
  }

  @Public()
  @Post('newsletter')
  async subscribeNewsletter(@Body() body: NewsletterDto) {
    const data = await this.cmsService.subscribeNewsletter(body.email);
    return { success: true, data, message: 'Subscribed successfully!' };
  }

  // ── Secure Admin Endpoints ─────────────────────────────────

  // Portfolio Admin
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get('admin/portfolio')
  async getAdminPortfolio(@Query() dto: PaginationDto) {
    return this.cmsService.getPortfolioItems(false, dto);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Post('admin/portfolio')
  async upsertPortfolio(@Req() req: any, @Body() data: UpsertPortfolioDto) {
    return this.cmsService.upsertPortfolioItem(data.slug, data, req.user?.id);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Delete('admin/portfolio/:id')
  async deletePortfolio(@Req() req: any, @Param('id') id: string) {
    return this.cmsService.softDeletePortfolioItem(id, req.user?.id);
  }

  // Blog Admin
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get('admin/blog')
  async getAdminBlog(@Query() dto: PaginationDto) {
    return this.cmsService.getBlogPosts(undefined, dto);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Post('admin/blog')
  async upsertBlog(@Req() req: any, @Body() data: UpsertBlogDto) {
    return this.cmsService.upsertBlogPost(data.slug, data, req.user?.id);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Delete('admin/blog/:id')
  async deleteBlog(@Req() req: any, @Param('id') id: string) {
    return this.cmsService.softDeleteBlogPost(id, req.user?.id);
  }

  // Testimonials Admin
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get('admin/testimonials')
  async getAdminTestimonials(@Query() dto: PaginationDto) {
    return this.cmsService.getTestimonials(false, dto);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Post('admin/testimonials')
  async createTestimonial(@Req() req: any, @Body() data: CreateTestimonialDto) {
    return this.cmsService.createTestimonial(data, req.user?.id);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Patch('admin/testimonials/:id')
  async updateTestimonial(@Req() req: any, @Param('id') id: string, @Body() data: UpdateTestimonialDto) {
    return this.cmsService.updateTestimonial(id, data, req.user?.id);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Delete('admin/testimonials/:id')
  async deleteTestimonial(@Req() req: any, @Param('id') id: string) {
    return this.cmsService.softDeleteTestimonial(id, req.user?.id);
  }

  // Team Admin
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get('admin/team')
  async getAdminTeam(@Query() dto: PaginationDto) {
    return this.cmsService.getTeamMembers(false, dto);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Post('admin/team')
  async upsertTeam(@Req() req: any, @Body() data: UpsertTeamDto) {
    return this.cmsService.upsertTeamMember(data.id || null, data, req.user?.id);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Delete('admin/team/:id')
  async deleteTeam(@Req() req: any, @Param('id') id: string) {
    return this.cmsService.softDeleteTeamMember(id, req.user?.id);
  }

  // FAQ Admin
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get('admin/faq')
  async getAdminFaq(@Query() dto: PaginationDto) {
    return this.cmsService.getFaqItems(false, dto);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Post('admin/faq')
  async upsertFaq(@Req() req: any, @Body() data: UpsertFaqDto) {
    return this.cmsService.upsertFaqItem(data.id || null, data, req.user?.id);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Delete('admin/faq/:id')
  async deleteFaq(@Req() req: any, @Param('id') id: string) {
    return this.cmsService.softDeleteFaqItem(id, req.user?.id);
  }

  // Services Admin
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get('admin/services')
  async getAdminServices(@Query() dto: PaginationDto) {
    return this.cmsService.getServices(false, dto);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Post('admin/services')
  async upsertService(@Req() req: any, @Body() data: UpsertServiceDto) {
    return this.cmsService.upsertService(data.slug, data, req.user?.id);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Delete('admin/services/:id')
  async deleteService(@Req() req: any, @Param('id') id: string) {
    return this.cmsService.softDeleteService(id, req.user?.id);
  }

  // Announcements Admin
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get('admin/announcements')
  async getAdminAnnouncements(@Query() dto: PaginationDto) {
    return this.cmsService.getAnnouncements(false, dto);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Post('admin/announcements')
  async upsertAnnouncement(@Req() req: any, @Body() data: UpsertAnnouncementDto) {
    return this.cmsService.upsertAnnouncement(data.id || null, data, req.user?.id);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Delete('admin/announcements/:id')
  async deleteAnnouncement(@Req() req: any, @Param('id') id: string) {
    return this.cmsService.softDeleteAnnouncement(id, req.user?.id);
  }

  // Configs Admin (Hero, Navbar, Footer, SEO)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Post('admin/config/:key')
  async setAdminConfig(@Req() req: any, @Param('key') key: string, @Body() body: SetConfigDto) {
    const data = await this.cmsService.setConfig(key, body.value, 'json', req.user?.id);
    return { success: true, data };
  }

  // Reordering Admin
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Patch('admin/reorder/:model')
  async reorderItems(@Req() req: any, @Param('model') model: string, @Body() body: ReorderDto) {
    await this.cmsService.reorderItems(model, body.items, req.user?.id);
    return { success: true };
  }

  // Recycle Bin Admin
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get('admin/recycle-bin')
  async getRecycleBin() {
    const data = await this.cmsService.getRecycleBinItems();
    return { success: true, data };
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Patch('admin/recycle-bin/:modelType/:id/restore')
  async restoreRecycleBinItem(@Req() req: any, @Param('modelType') modelType: string, @Param('id') id: string) {
    const data = await this.cmsService.restoreRecycleBinItem(modelType, id, req.user?.id);
    return { success: true, data };
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Delete('admin/recycle-bin/:modelType/:id/permanent')
  async permanentDeleteRecycleBinItem(@Req() req: any, @Param('modelType') modelType: string, @Param('id') id: string) {
    await this.cmsService.permanentDeleteRecycleBinItem(modelType, id, req.user?.id);
    return { success: true };
  }

  // Contact Admin
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get('admin/contact')
  async getAdminContacts(@Query() dto: PaginationDto) {
    const data = await this.cmsService.getContactSubmissions(dto);
    return { success: true, data };
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Patch('admin/contact/:id/read')
  async markContactRead(@Param('id') id: string, @Body() body: MarkContactReadDto) {
    const data = await this.cmsService.markContactRead(id, body.isRead !== undefined ? body.isRead : true);
    return { success: true, data };
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Delete('admin/contact/:id')
  async deleteContact(@Req() req: any, @Param('id') id: string) {
    return this.cmsService.softDeleteContact(id, req.user?.id);
  }

  // Newsletter Admin
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get('admin/newsletter')
  async getAdminNewsletters(@Query() dto: PaginationDto) {
    const data = await this.cmsService.getNewsletterSubscribers(dto);
    return { success: true, data };
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Delete('admin/newsletter/:id')
  async deleteNewsletter(@Req() req: any, @Param('id') id: string) {
    return this.cmsService.deleteNewsletterSubscriber(id, req.user?.id);
  }
}
