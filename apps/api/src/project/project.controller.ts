import { Controller, Get, Patch, Param, Body, Req } from '@nestjs/common';
import { ProjectService } from './project.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, ProjectStatus } from '@mdms/types';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Roles(Role.CLIENT, Role.PROJECT_MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  @Get(':id')
  async getProject(@Param('id') id: string) {
    const project = await this.projectService.getProjectDetails(id);
    return {
      success: true,
      data: project,
    };
  }

  @Roles(Role.PROJECT_MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ProjectStatus,
  ) {
    const project = await this.projectService.updateStatus(id, status);
    return {
      success: true,
      data: project,
    };
  }

  @Roles(Role.CLIENT, Role.PROJECT_MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  @Get(':id/upload-url')
  async getUploadUrl(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    // Basic validation
    const fileName = req.query.fileName as string || 'upload.bin';
    const fileType = req.query.fileType as string || 'application/octet-stream';
    
    const urlData = await this.projectService.getPresignedUrl(id, fileName, fileType);
    return {
      success: true,
      data: urlData,
    };
  }
}
