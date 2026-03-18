import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private enrollmentsService: EnrollmentsService) {}

  @Get('my')
  getMyEnrollments(@Request() req) {
    return this.enrollmentsService.getMyEnrollments(req.user.sub);
  }

  @Post('enroll')
  enroll(@Body() body: { courseId: string }, @Request() req) {
    return this.enrollmentsService.enroll(req.user.sub, body.courseId);
  }

  @Patch('progress')
  updateProgress(@Body() body: { courseId: string; progressPct: number }, @Request() req) {
    return this.enrollmentsService.updateProgress(req.user.sub, body.courseId, body.progressPct);
  }

  @Roles('INSTRUCTOR', 'ADMIN', 'MANAGER')
  @Post('assign/user')
  assignToUser(@Body() body: { userId: string; courseId: string }, @Request() req) {
    return this.enrollmentsService.assignToUser(req.user.sub, body.userId, body.courseId);
  }

  @Roles('INSTRUCTOR', 'ADMIN', 'MANAGER')
  @Post('assign/group')
  assignToGroup(@Body() body: { groupId: string; courseId: string }) {
    return this.enrollmentsService.assignToGroup(body.groupId, body.courseId);
  }

  @Roles('INSTRUCTOR', 'ADMIN', 'MANAGER')
  @Post('assign/department')
  assignToDepartment(@Body() body: { departmentId: string; courseId: string }) {
    return this.enrollmentsService.assignToDepartment(body.departmentId, body.courseId);
  }

 @Roles('MANAGER', 'ADMIN')
 @Post('assign/team')
 assignToTeam(@Body() body: { courseId: string }, @Request() req) {
  return this.enrollmentsService.assignToTeam(req.user.sub, body.courseId);
}
}