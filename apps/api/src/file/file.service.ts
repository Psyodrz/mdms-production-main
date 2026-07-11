import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * File Service — S3/R2 operations for media and document storage.
 * Reference: SRS Section 6.3 (File Storage Rules)
 */
@Injectable()
export class FileService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {
    this.bucket = this.configService.get<string>('S3_BUCKET_NAME', 'mdms');
    this.s3 = new S3Client({
      endpoint: this.configService.get<string>('S3_ENDPOINT'),
      region: this.configService.get<string>('S3_REGION', 'auto'),
      credentials: {
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY', ''),
        secretAccessKey: this.configService.get<string>('S3_SECRET_KEY', ''),
      },
      forcePathStyle: true, // Required for MinIO
    });
  }

  /**
   * Generate a pre-signed upload URL.
   * Client uploads directly to S3 — no data passes through API server.
   */
  async getUploadUrl(params: {
    key: string;
    contentType: string;
    expiresIn?: number;
  }): Promise<{ uploadUrl: string; fileKey: string }> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: params.key,
      ContentType: params.contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: params.expiresIn || 3600, // 1 hour
    });

    return { uploadUrl, fileKey: params.key };
  }

  /**
   * Generate a pre-signed download URL.
   * Deliverables: 72-hour expiry per SRS.
   */
  async getDownloadUrl(key: string, expiresIn = 259200): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3, command, { expiresIn });
  }

  /**
   * Delete a file from S3.
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    await this.s3.send(command);
  }

  /**
   * Build client upload path per SRS Section 6.3:
   * s3://mdms/clients/{clientId}/projects/{projectId}/uploads/
   */
  buildClientUploadKey(clientId: string, projectId: string, fileName: string): string {
    return `clients/${clientId}/projects/${projectId}/uploads/${Date.now()}-${fileName}`;
  }

  /**
   * Build deliverable path:
   * s3://mdms/clients/{clientId}/projects/{projectId}/deliverables/
   */
  buildDeliverableKey(clientId: string, projectId: string, fileName: string): string {
    return `clients/${clientId}/projects/${projectId}/deliverables/${Date.now()}-${fileName}`;
  }

  /**
   * Build talent portfolio path.
   */
  buildTalentMediaKey(talentId: string, type: 'photos' | 'videos', fileName: string): string {
    return `talent/${talentId}/${type}/${Date.now()}-${fileName}`;
  }

  /**
   * Build editor version path.
   */
  buildEditorVersionKey(projectId: string, versionNumber: number, fileName: string): string {
    return `projects/${projectId}/versions/v${versionNumber}/${Date.now()}-${fileName}`;
  }

  /**
   * Upload media asset from backend (Task 3.2 / Task 3.4)
   */
  async uploadMediaAsset(file: Express.Multer.File, actorId: string) {
    const key = `media/${Date.now()}-${file.originalname}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    await this.s3.send(command);

    const endpoint = this.configService.get<string>('S3_ENDPOINT') || '';
    let url = '';
    if (endpoint.includes('localhost') || endpoint.includes('127.0.0.1')) {
      url = `${endpoint}/${this.bucket}/${key}`;
    } else {
      if (endpoint.includes('/storage/v1/s3')) {
        const base = endpoint.replace('/storage/v1/s3', '');
        url = `${base}/storage/v1/object/public/${this.bucket}/${key}`;
      } else {
        url = `${endpoint}/${this.bucket}/${key}`;
      }
    }

    const asset = await this.prisma.mediaAsset.create({
      data: {
        filename: file.originalname,
        originalName: file.originalname,
        url,
        mimeType: file.mimetype,
        size: file.size,
        uploadedById: actorId,
      },
    });

    await this.auditService.log({
      actorId,
      action: 'UPLOAD_MEDIA_ASSET',
      resource: 'MediaAsset',
      resourceId: asset.id,
      after: { filename: file.originalname, url } as any,
    });

    return asset;
  }

  /**
   * List media assets paginated
   */
  async listAssets(dto: PaginationDto) {
    const { page = 1, limit = 20, orderBy = 'createdAt', direction = 'desc' } = dto;
    const [data, total] = await Promise.all([
      this.prisma.mediaAsset.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [orderBy]: direction },
        include: {
          uploadedBy: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      this.prisma.mediaAsset.count(),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Delete media asset
   */
  async deleteAsset(id: string, actorId: string) {
    const asset = await this.prisma.mediaAsset.findUnique({
      where: { id },
    });
    if (!asset) {
      throw new NotFoundException(`Media asset with ID ${id} not found.`);
    }

    // Key is derived from URL or constructed
    const key = `media/${asset.url.split('/media/')[1] || asset.filename}`;
    await this.deleteFile(key);

    await this.prisma.mediaAsset.delete({
      where: { id },
    });

    await this.auditService.log({
      actorId,
      action: 'DELETE_MEDIA_ASSET',
      resource: 'MediaAsset',
      resourceId: id,
      before: { filename: asset.filename, url: asset.url } as any,
    });

    return { message: 'Asset deleted successfully.' };
  }
}
