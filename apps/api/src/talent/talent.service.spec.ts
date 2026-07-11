import { Test, TestingModule } from '@nestjs/testing';
import { TalentService } from './talent.service';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

describe('TalentService', () => {
  let service: TalentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TalentService,
        { provide: PrismaService, useValue: {} },
        { provide: WhatsappService, useValue: {} },
      ],
    }).compile();

    service = module.get<TalentService>(TalentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
