import { Controller, Get, Req, Post, Body, Param } from '@nestjs/common';
import { ClientService } from './client.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@mdms/types';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Roles(Role.CLIENT)
  @Get('projects')
  async getMyProjects(@Req() req: any) {
    return {
      success: true,
      data: await this.clientService.getClientProjects(req.user.id),
    };
  }

  @Roles(Role.CLIENT)
  @Get('projects/:projectId')
  async getProjectDetails(@Req() req: any, @Param('projectId') projectId: string) {
    return {
      success: true,
      data: await this.clientService.getProjectDetails(req.user.id, projectId),
    };
  }

  @Roles(Role.CLIENT)
  @Post('projects/:projectId/comments')
  async addComment(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Body('content') content: string,
    @Body('timestampSec') timestampSec?: number,
    @Body('versionId') versionId?: string
  ) {
    return {
      success: true,
      data: await this.clientService.addComment(req.user.id, projectId, content, timestampSec, versionId),
    };
  }
}
