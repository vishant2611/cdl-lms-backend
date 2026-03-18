import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { LearningPathsService } from './learning-paths.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('learning-paths')
export class LearningPathsController {
  constructor(private learningPathsService: LearningPathsService) {}

  @Get()
  findAll() {
    return this.learningPathsService.findAll();
  }

  @Get('my')
  getMyPaths(@Request() req) {
    return this.learningPathsService.getMyPaths(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.learningPathsService.findOne(id);
  }

  @Roles('INSTRUCTOR', 'ADMIN')
  @Post()
  create(@Body() body: any, @Request() req) {
    return this.learningPathsService.create({ ...body, createdById: req.user.sub });
  }

  @Post(':id/enroll')
  enroll(@Param('id') id: string, @Request() req) {
    return this.learningPathsService.enroll(req.user.sub, id);
  }
}