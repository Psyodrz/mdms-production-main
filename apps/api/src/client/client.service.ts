import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../file/file.service';

@Injectable()
export class ClientService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async getClientProjects(userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { userId },
      include: {
        bookings: {
          include: {
            project: {
              include: {
                versions: { orderBy: { versionNumber: 'desc' }, take: 1 }
              }
            }
          }
        }
      }
    });

    if (!client) throw new ForbiddenException('User is not registered as a client.');

    const projects = client.bookings.map((b: any) => b.project).filter(Boolean);

    for (const project of projects) {
      if (project.versions) {
        for (const version of project.versions) {
          if (version.fileUrl && !version.fileUrl.startsWith('http')) {
            version.fileUrl = await this.fileService.getDownloadUrl(version.fileUrl);
          }
        }
      }
    }

    return projects;
  }

  async getProjectDetails(userId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        booking: { include: { client: true } },
        versions: { orderBy: { versionNumber: 'desc' } },
        comments: { orderBy: { createdAt: 'desc' }, include: { author: { select: { firstName: true, lastName: true } } } }
      }
    });

    if (!project || project.booking.client.userId !== userId) {
      throw new ForbiddenException('Access denied to this project.');
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

  async addComment(userId: string, projectId: string, content: string, timestampSec?: number, versionId?: string) {
    await this.getProjectDetails(userId, projectId); // Verify access

    return this.prisma.comment.create({
      data: {
        projectId,
        authorId: userId,
        content,
        timestampSec,
        versionId,
      }
    });
  }
}
