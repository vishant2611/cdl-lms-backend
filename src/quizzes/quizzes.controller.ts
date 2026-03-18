import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('quizzes')
export class QuizzesController {
  constructor(private quizzesService: QuizzesService) {}

  @Get('my-submissions')
  getMySubmissions(@Request() req) {
    return this.quizzesService.getMySubmissions(req.user.sub);
  }

  @Get('course/:courseId')
  getQuizByCourse(@Param('courseId') courseId: string) {
    return this.quizzesService.getQuizByCourse(courseId);
  }

  @Roles('INSTRUCTOR', 'ADMIN')
  @Post('course/:courseId')
  createQuiz(@Param('courseId') courseId: string, @Body() body: { passMark: number; questions: any[] }) {
    return this.quizzesService.createQuiz(courseId, body.passMark, body.questions);
  }

  @Post(':quizId/submit')
  submitQuiz(@Param('quizId') quizId: string, @Body() body: { answers: Record<string, number> }, @Request() req) {
    return this.quizzesService.submitQuiz(req.user.sub, quizId, body.answers);
  }
}