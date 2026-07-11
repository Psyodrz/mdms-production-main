import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TalentCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.talentCategory.findMany({
      where: { isActive: true },
      include: {
        specializations: true,
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.talentCategory.findUnique({
      where: { slug },
      include: {
        specializations: true,
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }
}
