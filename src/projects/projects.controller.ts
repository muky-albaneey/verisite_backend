import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, AssignDeveloperDto, RejectProjectDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto, createPaginationMeta } from '../common/dto/pagination.dto';
import { User, Project } from '../database/entities';
import { ApiRole, ApiProjectStatus } from '../contracts';
import { toApiProjectStatus } from '../common/utils/enum-mapper';

@ApiTags('Projects')
@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Roles(ApiRole.CLIENT, ApiRole.ADMIN)
  @ApiOperation({ summary: 'Create a new project' })
  async create(@Body() dto: CreateProjectDto, @CurrentUser() user: User) {
    const project = await this.projectsService.create(dto, user);
    return { project: this.serializeProject(project) };
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects with pagination' })
  async findAll(
    @Query() pagination: PaginationDto,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('clientId') clientId?: string,
    @Query('developerId') developerId?: string,
    @CurrentUser() user: User = null,
  ) {
    const { projects, total } = await this.projectsService.findAll(
      pagination.page,
      pagination.limit,
      search,
      status,
      clientId,
      developerId,
      user,
    );

    return {
      data: projects.map((p) => this.serializeProject(p)),
      meta: createPaginationMeta(pagination.page, pagination.limit, total),
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get project statistics' })
  async getStats(@CurrentUser() user: User) {
    const stats = await this.projectsService.getStats(user);
    return { data: stats };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    const project = await this.projectsService.findOne(id, user);
    return { project: this.serializeProject(project) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: User,
  ) {
    const project = await this.projectsService.update(id, dto, user);
    return { project: this.serializeProject(project) };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project (soft delete)' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    await this.projectsService.remove(id, user);
    return { message: 'Project deleted successfully' };
  }

  @Post(':id/assign-developer')
  @Roles(ApiRole.CLIENT, ApiRole.ADMIN)
  @ApiOperation({ summary: 'Assign developer to project' })
  async assignDeveloper(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignDeveloperDto,
    @CurrentUser() user: User,
  ) {
    const project = await this.projectsService.assignDeveloper(id, dto, user);
    return { project: this.serializeProject(project) };
  }

  @Post(':id/accept')
  @Roles(ApiRole.DEVELOPER)
  @ApiOperation({ summary: 'Accept project (Developer only)' })
  async accept(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    const project = await this.projectsService.acceptProject(id, user);
    return { project: this.serializeProject(project) };
  }

  @Post(':id/reject')
  @Roles(ApiRole.DEVELOPER)
  @ApiOperation({ summary: 'Reject project (Developer only)' })
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectProjectDto,
    @CurrentUser() user: User,
  ) {
    const project = await this.projectsService.rejectProject(id, dto, user);
    return { project: this.serializeProject(project) };
  }

  private serializeProject(project: Project) {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      typeOfConstruction: project.typeOfConstruction,
      city: project.city,
      location: project.location,
      status: toApiProjectStatus(project.status),
      progress: project.progress,
      clientId: project.clientId,
      developerId: project.developerId,
      fieldOpsId: project.fieldOpsId,
      developerAcceptanceStatus: project.developerAcceptanceStatus?.toLowerCase(),
      developerAcceptedAt: project.developerAcceptedAt,
      developerRejectedAt: project.developerRejectedAt,
      developerRejectionReason: project.developerRejectionReason,
      coverImageUrl: project.coverImageUrl,
      dueDate: project.dueDate,
      startDate: project.startDate,
      endDate: project.endDate,
      note: project.note,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      client: project.client ? {
        id: project.client.id,
        fullName: project.client.fullName,
        email: project.client.email,
      } : null,
      developer: project.developer ? {
        id: project.developer.id,
        fullName: project.developer.fullName,
        email: project.developer.email,
      } : null,
      fieldOps: project.fieldOps ? {
        id: project.fieldOps.id,
        fullName: project.fieldOps.fullName,
        email: project.fieldOps.email,
      } : null,
    };
  }
}

