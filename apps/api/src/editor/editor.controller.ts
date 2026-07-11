import { Controller, Get, Param, Req, Patch, Body, Post } from '@nestjs/common';
import { EditorService } from './editor.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@mdms/types';

@Controller('editor')
export class EditorController {
  constructor(private readonly editorService: EditorService) {}

  @Roles(Role.EDITOR, Role.SUPER_ADMIN)
  @Get('projects')
  async getMyProjects(@Req() req: any) {
    return this.editorService.getAssignedProjects(req.user.id);
  }

  @Roles(Role.EDITOR, Role.SUPER_ADMIN)
  @Get('projects/:projectId')
  async getProjectDetails(@Req() req: any, @Param('projectId') projectId: string) {
    return this.editorService.getProjectDetails(projectId, req.user);
  }

  @Roles(Role.EDITOR, Role.SUPER_ADMIN)
  @Post('projects/:projectId/render-jobs')
  async addRenderJob(
    @Req() req: any, 
    @Param('projectId') projectId: string,
    @Body() data: { inputFile: string }
  ) {
    return this.editorService.createRenderJob(projectId, data.inputFile, req.user);
  }

  @Roles(Role.EDITOR, Role.SUPER_ADMIN)
  @Patch('render-jobs/:jobId/status')
  async updateRenderJobStatus(
    @Req() req: any, 
    @Param('jobId') jobId: string,
    @Body('status') status: any
  ) {
    return this.editorService.updateRenderJobStatus(jobId, status);
  }

  @Roles(Role.EDITOR, Role.SUPER_ADMIN)
  @Post('projects/:projectId/versions')
  async addVersion(
    @Req() req: any, 
    @Param('projectId') projectId: string,
    @Body() data: { fileUrl: string, fileName: string, fileSize: number, fileType: string, versionNumber: number }
  ) {
    return this.editorService.addVersion(projectId, data, req.user);
  }
}
