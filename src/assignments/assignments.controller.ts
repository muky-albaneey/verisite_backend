import { Controller, Get, Post, Body, Param, Patch, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../database/entities';
import { ApiRole } from '../contracts';
import { toApiAssignmentStatus } from '../common/utils/enum-mapper';

@ApiTags('Assignments')
@Controller('assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @Roles(ApiRole.ADMIN, ApiRole.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Create assignment' })
  async create(
    @Body('projectId') projectId: string,
    @Body('fieldOpsId') fieldOpsId: string,
    @Body('milestone') milestone: string,
    @CurrentUser() user: User,
  ) {
    const assignment = await this.assignmentsService.create(projectId, fieldOpsId, milestone, user);
    return { assignment: this.serialize(assignment) };
  }

  @Get()
  @ApiOperation({ summary: 'Get all assignments' })
  async findAll(@CurrentUser() user: User) {
    const assignments = await this.assignmentsService.findAll(user);
    return { data: assignments.map((a) => this.serialize(a)) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assignment by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    const assignment = await this.assignmentsService.findOne(id, user);
    return { assignment: this.serialize(assignment) };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update assignment status' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
    @CurrentUser() user: User,
  ) {
    const assignment = await this.assignmentsService.updateStatus(id, status, user);
    return { assignment: this.serialize(assignment) };
  }

  private serialize(assignment: any) {
    return {
      id: assignment.id,
      projectId: assignment.projectId,
      fieldOpsId: assignment.fieldOpsId,
      milestone: assignment.milestone,
      status: toApiAssignmentStatus(assignment.status),
      assignedDate: assignment.assignedDate,
      dueDate: assignment.dueDate,
      progressPercent: assignment.progressPercent,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
    };
  }
}

