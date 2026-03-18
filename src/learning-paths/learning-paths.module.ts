import { Module } from '@nestjs/common';
import { LearningPathsService } from './learning-paths.service';
import { LearningPathsController } from './learning-paths.controller';

@Module({
  providers: [LearningPathsService],
  controllers: [LearningPathsController],
})
export class LearningPathsModule {}