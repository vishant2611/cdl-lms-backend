import {
  Controller, Post, UseInterceptors, UploadedFile,
  UseGuards, BadRequestException, Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

const ALLOWED_TYPES = [
  'application/pdf',
  'video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'video/webm',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-zip',
  'application/octet-stream',
  'multipart/x-zip',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_SIZE = 500 * 1024 * 1024; // 500MB

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Roles('INSTRUCTOR', 'ADMIN')
  @Post('file')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: MAX_SIZE },
    fileFilter: (req, file, cb) => {
      if (ALLOWED_TYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException(
          'File type not allowed. Supported: PDF, Video, PPT, SCORM (ZIP), Word'
        ), false);
      }
    },
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ) {
    const result = await this.uploadService.uploadFile(file, folder || 'courses');
    return {
      ...result,
      fileType: this.uploadService.getFileType(file.mimetype),
    };
  }
}