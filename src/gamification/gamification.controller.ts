import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('gamification')
export class GamificationController {
  constructor(private gamificationService: GamificationService) {}

  @Get('leaderboard')
  getLeaderboard(@Query('limit') limit?: string) {
    return this.gamificationService.getLeaderboard(limit ? parseInt(limit) : 20);
  }

  @Get('badges')
  getBadges() {
    return this.gamificationService.getBadges();
  }

  @Get('points/:userId')
  getUserPoints(@Param('userId') userId: string) {
    return this.gamificationService.getUserPoints(userId);
  }

  @Roles('ADMIN')
  @Post('badges')
  createBadge(@Body() body: { name: string; description: string; icon: string; pointsRequired: number }) {
    return this.gamificationService['prisma'].badge.create({ data: body });
  }
}