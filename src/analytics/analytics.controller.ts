import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Roles('ADMIN')
  @Get('company')
  getCompanyStats() {
    return this.analyticsService.getCompanyStats();
  }

  @Roles('ADMIN')
  @Get('departments')
  getDepartmentStats() {
    return this.analyticsService.getDepartmentStats();
  }

  @Roles('ADMIN')
  @Get('courses')
  getCourseStats() {
    return this.analyticsService.getCourseStats();
  }

  @Roles('MANAGER', 'ADMIN')
  @Get('my-team')
  getManagerStats(@Request() req) {
    return this.analyticsService.getManagerStats(req.user.sub);
  }
}