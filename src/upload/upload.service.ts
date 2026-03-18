import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';


@Injectable()
export class UploadService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!,
  );

  private bucket = process.env.SUPABASE_BUCKET || 'cdl-lms-files';

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'courses',
  ): Promise<{ fileUrl: string; fileName: string; fileSize: number; fileType: string }> {
    if (!file) throw new BadRequestException('No file provided');

    const fileType = this.getFileType(file.mimetype, file.originalname);

    // Handle SCORM ZIP — extract and upload all files
    if (fileType === 'SCORM') {
      return await this.uploadScorm(file, folder);
    }

    // Regular file upload
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${folder}/${timestamp}_${safeName}`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw new BadRequestException('Upload failed: ' + error.message);

    const { data: urlData } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(filePath);

    return {
      fileUrl: urlData.publicUrl,
      fileName: file.originalname,
      fileSize: file.size,
      fileType,
    };
  }

  private async uploadScorm(
  file: Express.Multer.File,
  folder: string,
): Promise<{ fileUrl: string; fileName: string; fileSize: number; fileType: string }> {
  const timestamp = Date.now();
  const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = folder + '/scorm_' + timestamp + '_' + safeName;

  const { error } = await this.supabase.storage
    .from(this.bucket)
    .upload(filePath, file.buffer, {
      contentType: 'application/zip',
      upsert: false,
    });

  if (error) throw new BadRequestException('Upload failed: ' + error.message);

  const { data: urlData } = this.supabase.storage
    .from(this.bucket)
    .getPublicUrl(filePath);

  return {
    fileUrl: urlData.publicUrl,
    fileName: file.originalname,
    fileSize: file.size,
    fileType: 'SCORM',
  };
}

  

  getFileType(mimetype: string, filename?: string): string {
    const ext = filename?.split('.').pop()?.toLowerCase();
    if (ext === 'zip' || mimetype.includes('zip')) return 'SCORM';
    if (mimetype === 'application/pdf') return 'PDF';
    if (mimetype.startsWith('video/')) return 'VIDEO';
    if (ext === 'ppt' || ext === 'pptx' || mimetype.includes('presentation') || mimetype.includes('powerpoint')) return 'PPT';
    if (ext === 'doc' || ext === 'docx' || mimetype.includes('word')) return 'PDF';
    return 'PDF';
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const urlParts = fileUrl.split(`${this.bucket}/`);
    if (urlParts.length < 2) return;
    const filePath = urlParts[1];
    await this.supabase.storage.from(this.bucket).remove([filePath]);
  }
}