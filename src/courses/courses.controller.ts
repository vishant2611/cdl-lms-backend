import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Get()
  findAll(@Query('published') published?: string) {
    const isPublished = published === 'true' ? true : published === 'false' ? false : undefined;
    return this.coursesService.findAll(isPublished);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Roles('INSTRUCTOR', 'ADMIN')
  @Post()
  create(@Body() body: any, @Request() req) {
    return this.coursesService.create({ ...body, createdById: req.user.sub });
  }

  @Roles('INSTRUCTOR', 'ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.coursesService.update(id, body);
  }

  @Roles('INSTRUCTOR', 'ADMIN')
  @Patch(':id/publish')
  publish(@Param('id') id: string) {
    return this.coursesService.publish(id);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }
}