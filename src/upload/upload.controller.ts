import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('url')
  getUploadUrl(@Body() body: { filename: string; contentType: string }) {
    return this.uploadService.getUploadUrl(body.filename, body.contentType);
  }
}