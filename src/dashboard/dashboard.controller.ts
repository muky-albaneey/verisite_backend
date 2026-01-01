import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../database/entities';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getStats(@CurrentUser() user: User) {
    const stats = await this.dashboardService.getStats(user);
    return { data: stats };
  }

  @Get('recent-assignments')
  @ApiOperation({ summary: 'Get recent assignments' })
  async getRecentAssignments(
    @CurrentUser() user: User,
    @Query('limit') limit: number = 5,
  ) {
    const assignments = await this.dashboardService.getRecentAssignments(user, limit);
    return { data: assignments };
  }
}

