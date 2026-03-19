import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { LearningPathsService } from './learning-paths.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('learning-paths')
export class LearningPathsController {
  constructor(private learningPathsService: LearningPathsService) {}

  // Get all published learning paths
  @Get()
  findAll() {
    return this.learningPathsService.findAll();
  }

  // Get all learning paths (admin/instructor/manager view)
  @Roles('ADMIN', 'INSTRUCTOR', 'MANAGER')
  @Get('manage')
  findAllManage() {
    return this.learningPathsService.findAllManage();
  }

  // Get my enrolled paths (employee view)
  @Get('my')
  getMyPaths(@Request() req) {
    return this.learningPathsService.getMyPaths(req.user.sub);
  }

  // Get single learning path
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.learningPathsService.findOne(id);
  }

  // Create learning path (Admin, Instructor, Manager)
  @Roles('ADMIN', 'INSTRUCTOR', 'MANAGER')
  @Post()
  create(@Body() body: any, @Request() req) {
    return this.learningPathsService.create({ ...body, createdById: req.user.sub });
  }

  // Update learning path
  @Roles('ADMIN', 'INSTRUCTOR', 'MANAGER')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.learningPathsService.update(id, body);
  }

  // Delete learning path
  @Roles('ADMIN', 'INSTRUCTOR')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.learningPathsService.remove(id);
  }

  // Publish / unpublish
  @Roles('ADMIN', 'INSTRUCTOR', 'MANAGER')
  @Patch(':id/publish')
  publish(@Param('id') id: string, @Body() body: { isPublished: boolean }) {
    return this.learningPathsService.publish(id, body.isPublished);
  }

  // Assign to department or individual users
  @Roles('ADMIN', 'INSTRUCTOR', 'MANAGER')
  @Post(':id/assign')
  assign(@Param('id') id: string, @Body() body: { departmentId?: string; userIds?: string[]; deadline?: string }) {
    return this.learningPathsService.assign(id, body);
  }

  // Self enroll
  @Post(':id/enroll')
  enroll(@Param('id') id: string, @Request() req) {
    return this.learningPathsService.enroll(req.user.sub, id);
  }
}