import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FileModule } from '../file/file.module';

@Module({
  imports: [PrismaModule, FileModule],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
