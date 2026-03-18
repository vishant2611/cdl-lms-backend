import { Controller, Get, Patch, Delete, Body, Param, UseGuards, Request, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Admin: get all users
  @Roles('ADMIN', 'MANAGER')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Get my team (manager)
  @Roles('MANAGER', 'ADMIN')
  @Get('my-team')
  getMyTeam(@Request() req) {
    return this.usersService.findTeam(req.user.sub);
  }

  // Bulk create users (admin)
  @Roles('ADMIN')
  @Post('bulk')
  bulkCreate(@Body() body: { users: any[] }) {
    return this.usersService.bulkCreate(body.users);
  }

  // Get single user
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // Update user
  @Roles('ADMIN', 'MANAGER')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.usersService.update(id, body);
  }

  // Deactivate user
  @Roles('ADMIN')
  @Delete(':id')
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }
}