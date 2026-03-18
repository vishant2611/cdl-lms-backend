import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('announcements')
export class AnnouncementsController {
  constructor(private announcementsService: AnnouncementsService) {}

  @Get()
  findAll(@Query('departmentId') departmentId?: string) {
    return this.announcementsService.findAll(departmentId);
  }

  @Roles('ADMIN', 'MANAGER')
  @Post()
  create(@Body() body: { title: string; body: string; departmentId?: string }, @Request() req) {
    return this.announcementsService.create({ ...body, createdById: req.user.sub });
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.announcementsService.remove(id);
  }
}