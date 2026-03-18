import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DepartmentsModule } from './departments/departments.module';
import { CoursesModule } from './courses/courses.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { LearningPathsModule } from './learning-paths/learning-paths.module';
import { GamificationModule } from './gamification/gamification.module';
import { CertificatesModule } from './certificates/certificates.module';
import { ComplianceModule } from './compliance/compliance.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { UploadModule } from './upload/upload.module';
import { AnnouncementsModule } from './announcements/announcements.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    DepartmentsModule,
    CoursesModule,
    EnrollmentsModule,
    QuizzesModule,
    LearningPathsModule,
    GamificationModule,
    CertificatesModule,
    ComplianceModule,
    AnalyticsModule,
    UploadModule,
    AnnouncementsModule,
  ],
})
export class AppModule {}