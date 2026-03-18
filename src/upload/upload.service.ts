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
  ): Promise<{ fileUrl: string; fileName: string; fileSize: number }> {
    if (!file) throw new BadRequestException('No file provided');

    // Sanitize filename
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${folder}/${timestamp}_${safeName}`;

    // Upload to Supabase Storage
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw new BadRequestException('Upload failed: ' + error.message);

    // Get public URL
    const { data: urlData } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(filePath);

    return {
      fileUrl: urlData.publicUrl,
      fileName: file.originalname,
      fileSize: file.size,
    };
  }

  async deleteFile(fileUrl: string): Promise<void> {
    // Extract path from URL
    const urlParts = fileUrl.split(`${this.bucket}/`);
    if (urlParts.length < 2) return;
    const filePath = urlParts[1];
    await this.supabase.storage.from(this.bucket).remove([filePath]);
  }

  getFileType(mimetype: string): string {
    if (mimetype === 'application/pdf') return 'PDF';
    if (mimetype.startsWith('video/')) return 'VIDEO';
    if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return 'PPT';
    if (mimetype.includes('zip') || mimetype.includes('scorm')) return 'SCORM';
    if (mimetype.includes('word')) return 'PDF'; // treat word as PDF category
    return 'PDF';
  }
}