import { Module } from '@nestjs/common';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FileModule } from '../file/file.module';

@Module({
  imports: [PrismaModule, FileModule],
  controllers: [ClientController],
  providers: [ClientService]
})
export class ClientModule {}
