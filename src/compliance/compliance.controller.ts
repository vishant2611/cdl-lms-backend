import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('compliance')
export class ComplianceController {
  constructor(private complianceService: ComplianceService) {}

  @Get('my')
  getMyCompliance(@Request() req) {
    return this.complianceService.getMyCompliance(req.user.sub);
  }

  @Roles('ADMIN', 'MANAGER')
  @Get()
  getRules() {
    return this.complianceService.getRules();
  }

  @Roles('ADMIN')
  @Post()
  createRule(@Body() body: any) {
    return this.complianceService.createRule(body);
  }

  @Roles('ADMIN')
  @Delete(':id')
  deleteRule(@Param('id') id: string) {
    return this.complianceService.deleteRule(id);
  }
}