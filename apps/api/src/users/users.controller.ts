import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { Role } from '@mdms/types';
import { Roles } from '../common/decorators/roles.decorator';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async findAll(
    @Query('role') role?: Role,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll({ role, page, limit, search });
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async create(
    @Body()
    body: {
      email: string;
      firstName: string;
      lastName: string;
      role: Role;
      password?: string;
      phone?: string;
    },
  ) {
    return this.usersService.createUser(body);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.usersService.updateUser(id, body);
  }

  @Patch(':id/deactivate')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async deactivate(@Param('id') id: string) {
    return this.usersService.deactivateUser(id);
  }

  @Patch(':id/activate')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async activate(@Param('id') id: string) {
    return this.usersService.activateUser(id);
  }
}
