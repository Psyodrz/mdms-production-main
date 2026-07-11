import { Controller, Post, Get, Delete, Body, Param, Req, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileService } from './file.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@mdms/types';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Roles(Role.EDITOR, Role.SUPER_ADMIN, Role.ADMIN)
  @Post('editor/upload-url')
  async getEditorUploadUrl(
    @Body('projectId') projectId: string,
    @Body('versionNumber') versionNumber: number,
    @Body('fileName') fileName: string,
    @Body('contentType') contentType: string
  ) {
    const key = this.fileService.buildEditorVersionKey(projectId, versionNumber, fileName);
    return this.fileService.getUploadUrl({ key, contentType });
  }

  @Roles(Role.TALENT)
  @Post('talent/upload-url')
  async getTalentUploadUrl(
    @Req() req: any,
    @Body('fileName') fileName: string,
    @Body('contentType') contentType: string,
    @Body('type') type: 'photos' | 'videos'
  ) {
    const key = this.fileService.buildTalentMediaKey(req.user.id, type, fileName);
    return this.fileService.getUploadUrl({ key, contentType });
  }

  @Roles(Role.CLIENT, Role.SUPER_ADMIN, Role.ADMIN)
  @Get('download-url/:key')
  async getDownloadUrl(@Param('key') key: string) {
    const url = await this.fileService.getDownloadUrl(decodeURIComponent(key));
    return { url };
  }

  @Post('upload')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async uploadMedia(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    return this.fileService.uploadMediaAsset(file, req.user.id);
  }

  @Get('assets')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  async listAssets(@Query() dto: PaginationDto) {
    return this.fileService.listAssets(dto);
  }

  @Delete('assets/:id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async deleteAsset(@Param('id') id: string, @Req() req: any) {
    return this.fileService.deleteAsset(id, req.user.id);
  }
}
