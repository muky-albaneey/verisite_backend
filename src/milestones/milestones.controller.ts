import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MilestonesService } from './milestones.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { toApiMilestoneStatus, toApiMilestoneName } from '../common/utils/enum-mapper';

@ApiTags('Milestones')
@Controller('milestones')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get milestones by project' })
  async findByProject(@Param('projectId', ParseUUIDPipe) projectId: string) {
    const milestones = await this.milestonesService.findByProject(projectId);
    return { data: milestones.map((m) => this.serialize(m)) };
  }

  @Post()
  @ApiOperation({ summary: 'Create milestone' })
  async create(
    @Body('projectId') projectId: string,
    @Body('name') name: string,
    @CurrentUser() user: any,
  ) {
    const milestone = await this.milestonesService.create(projectId, name, user);
    return { milestone: this.serialize(milestone) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update milestone' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() data: any) {
    const milestone = await this.milestonesService.update(id, data);
    return { milestone: this.serialize(milestone) };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete milestone' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.milestonesService.remove(id);
    return { message: 'Milestone deleted successfully' };
  }

  private serialize(milestone: any) {
    return {
      id: milestone.id,
      projectId: milestone.projectId,
      name: toApiMilestoneName(milestone.name),
      progress: milestone.progress,
      status: toApiMilestoneStatus(milestone.status),
      expectedCompletion: milestone.expectedCompletion,
      budget: milestone.budget,
      dateStarted: milestone.dateStarted,
      dateCompleted: milestone.dateCompleted,
      createdAt: milestone.createdAt,
      updatedAt: milestone.updatedAt,
    };
  }
}

