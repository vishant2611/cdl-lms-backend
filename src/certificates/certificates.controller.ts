import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('certificates')
export class CertificatesController {
  constructor(private certificatesService: CertificatesService) {}

  @Get('my')
  getMyCertificates(@Request() req) {
    return this.certificatesService.getMyCertificates(req.user.sub);
  }

  @Roles('ADMIN', 'INSTRUCTOR')
  @Get()
  getAll() {
    return this.certificatesService.getAll();
  }

  @Post('issue')
  issue(@Body() body: { userId: string; courseId: string }) {
    return this.certificatesService.issue(body.userId, body.courseId);
  }
}