import { Module } from '@nestjs/common';
import { TalentCategoryService } from './talent-category.service';
import { TalentCategoryController } from './talent-category.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TalentCategoryController],
  providers: [TalentCategoryService],
  exports: [TalentCategoryService],
})
export class TalentCategoryModule {}
