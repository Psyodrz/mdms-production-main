import { Controller, Get, Param } from '@nestjs/common';
import { TalentCategoryService } from './talent-category.service';
import { Public } from '../common/decorators/roles.decorator';

@Public()
@Controller('talent-category')
export class TalentCategoryController {
  constructor(private readonly talentCategoryService: TalentCategoryService) {}

  @Get()
  findAll() {
    return this.talentCategoryService.findAll();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.talentCategoryService.findBySlug(slug);
  }
}
