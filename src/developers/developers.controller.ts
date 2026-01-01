import { Controller, Get, Patch, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DevelopersService } from './developers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto, createPaginationMeta } from '../common/dto/pagination.dto';
import { User } from '../database/entities';
import { ApiRole } from '../contracts';

@ApiTags('Developers')
@Controller('developers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DevelopersController {
  constructor(private readonly developersService: DevelopersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all developers' })
  async findAll(@Query() pagination: PaginationDto, @Query('search') search?: string) {
    const { developers, total } = await this.developersService.findAll(
      pagination.page,
      pagination.limit,
      search,
    );

    return {
      data: developers.map((d) => ({
        id: d.id,
        fullName: d.fullName,
        email: d.email,
        avatarUrl: d.avatarUrl,
        developerProfile: d.developerProfile,
      })),
      meta: createPaginationMeta(pagination.page, pagination.limit, total),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get developer by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const developer = await this.developersService.findOne(id);
    return { developer };
  }

  @Get(':id/projects')
  @ApiOperation({ summary: 'Get developer projects' })
  async getProjects(@Param('id', ParseUUIDPipe) id: string) {
    const projects = await this.developersService.getProjects(id);
    return { data: projects };
  }

  @Patch(':id')
  @Roles(ApiRole.DEVELOPER)
  @ApiOperation({ summary: 'Update developer profile' })
  async updateProfile(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User, @Query() data: any) {
    const profile = await this.developersService.updateProfile(id, data, user);
    return { profile };
  }

  @Patch(':id/verify')
  @Roles(ApiRole.ADMIN)
  @ApiOperation({ summary: 'Verify developer (Admin only)' })
  async verify(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    const profile = await this.developersService.verify(id, user);
    return { profile };
  }
}

