import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/roles.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'MDMS API',
      version: '1.0.0',
    };
  }
}
