import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuizzesService {
  constructor(private prisma: PrismaService) {}

  async getQuizByCourse(courseId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { courseId },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
    if (!quiz) throw new NotFoundException('Quiz not found for this course');
    return quiz;
  }

  async createQuiz(courseId: string, passMark: number, questions: {
    question: string; options: string[]; correctAnswer: number; order: number;
  }[]) {
    return this.prisma.quiz.create({
      data: {
        courseId,
        passMark,
        questions: { create: questions },
      },
      include: { questions: true },
    });
  }

  async submitQuiz(userId: string, quizId: string, answers: Record<string, number>) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');

    let correct = 0;
    for (const q of quiz.questions) {
      if (answers[q.id] === q.correctAnswer) correct++;
    }

    const score = Math.round((correct / quiz.questions.length) * 100);
    const passed = score >= quiz.passMark;

    const submission = await this.prisma.quizSubmission.create({
      data: { userId, quizId, score, passed, answers },
    });

    return { score, passed, passMark: quiz.passMark, submission };
  }

  async getMySubmissions(userId: string) {
    return this.prisma.quizSubmission.findMany({
      where: { userId },
      include: { quiz: { include: { course: { select: { id: true, title: true } } } } },
      orderBy: { submittedAt: 'desc' },
    });
  }
}