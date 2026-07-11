import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectStatus } from '@mdms/types';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { FileService } from '../file/file.service';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsappService,
    private readonly fileService: FileService,
  ) {}

  async updateStatus(projectId: string, status: ProjectStatus) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        booking: {
          include: {
            client: {
              include: { user: true }
            }
          }
        }
      }
    });

    if (!project) throw new NotFoundException('Project not found');

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: { status },
    });

    // Send WhatsApp notification
    if (project.booking?.client?.user?.phone) {
      this.whatsappService.sendMessage(
        project.booking.client.user.phone,
        `MP Production: Project ${projectId.slice(0, 8).toUpperCase()} has moved to the ${status.replace('_', ' ')} stage. Track progress on your Client Dashboard.`
      );
    }

    return updated;
  }

  async getProjectDetails(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        booking: {
          include: {
            client: true,
            service: true
          }
        }
      },
    });

    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async getPresignedUrl(projectId: string, fileName: string, fileType: string) {
    await this.getProjectDetails(projectId);
    
    // Build S3 Key for general project files
    const key = `projects/${projectId}/uploads/${Date.now()}-${fileName}`;
    const result = await this.fileService.getUploadUrl({ key, contentType: fileType });

    return {
      url: result.uploadUrl,
      method: 'PUT',
      fields: {
        'Content-Type': fileType
      }
    };
  }
}
