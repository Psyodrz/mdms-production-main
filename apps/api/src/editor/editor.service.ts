import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@mdms/types';
import { FileService } from '../file/file.service';

@Injectable()
export class EditorService {
  private readonly logger = new Logger(EditorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async getAssignedProjects(userId: string) {
    const projects = await this.prisma.project.findMany({
      where: {
        editors: {
          some: { id: userId }
        }
      },
      include: {
        booking: { include: { client: { include: { user: { select: { firstName: true, lastName: true, email: true } } } } } },
        renderJobs: { orderBy: { createdAt: 'desc' }, take: 5 }
      },
      orderBy: { shootDate: 'desc' }
    });

    return projects;
  }

  async getProjectDetails(projectId: string, user: { id: string; role: Role }) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        editors: true,
        renderJobs: true,
        versions: { orderBy: { versionNumber: 'desc' } },
        comments: { orderBy: { createdAt: 'desc' } },
        booking: { include: { client: { include: { user: { select: { firstName: true, lastName: true, email: true } } } } } }
      }
    });

    if (!project) throw new NotFoundException('Project not found');

    const isAssigned = project.editors.some((e: any) => e.id === user.id);
    if (!isAssigned && user.role !== Role.SUPER_ADMIN && user.role !== Role.ADMIN) {
      throw new ForbiddenException('You are not assigned to this project');
    }

    if (project.versions) {
      for (const version of project.versions) {
        if (version.fileUrl && !version.fileUrl.startsWith('http')) {
          version.fileUrl = await this.fileService.getDownloadUrl(version.fileUrl);
        }
      }
    }

    return project;
  }

  async createRenderJob(projectId: string, inputFile: string, user: { id: string; role: Role }) {
    // Verify assignment
    await this.getProjectDetails(projectId, user);

    return this.prisma.renderJob.create({
      data: {
        projectId,
        inputFile,
        status: 'QUEUED'
      }
    });
  }

  async updateRenderJobStatus(jobId: string, status: any) {
    const job = await this.prisma.renderJob.update({
      where: { id: jobId },
      data: { status }
    });
    return job;
  }

  async addVersion(projectId: string, data: { fileUrl: string, fileName: string, fileSize: number, fileType: string, versionNumber: number }, user: { id: string; role: Role }) {
    await this.getProjectDetails(projectId, user);

    return this.prisma.version.create({
      data: {
        projectId,
        uploadedById: user.id,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: BigInt(data.fileSize),
        fileType: data.fileType,
        versionNumber: data.versionNumber,
        status: 'UPLOADED',
        isWatermarked: true,
      }
    });
  }
}
