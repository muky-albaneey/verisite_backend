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
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UpdateProfileDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto, createPaginationMeta } from '../common/dto/pagination.dto';
import { User } from '../database/entities';
import { ApiRole } from '../contracts';
import { toApiRole, toApiUserStatus } from '../common/utils/enum-mapper';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(ApiRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  async create(@Body() dto: CreateUserDto, @CurrentUser() user: User) {
    const newUser = await this.usersService.create(dto, user);
    return {
      user: this.serializeUser(newUser),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination' })
  async findAll(
    @Query() pagination: PaginationDto,
    @Query('search') search?: string,
    @Query('role') role?: ApiRole,
    @Query('status') status?: string,
    @CurrentUser() user: User = null,
  ) {
    const { users, total } = await this.usersService.findAll(
      pagination.page,
      pagination.limit,
      search,
      role,
      status,
      user,
    );

    return {
      data: users.map((u) => this.serializeUser(u)),
      meta: createPaginationMeta(pagination.page, pagination.limit, total),
    };
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: any) {
    const profile = await this.usersService.getProfile(user.id);
    return { user: this.serializeUser(profile) };
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    const updated = await this.usersService.updateProfile(user.id, dto);
    return { user: this.serializeUser(updated) };
  }

  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload user avatar' })
  async uploadAvatar(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const updated = await this.usersService.uploadAvatar(user.id, file);
    return { user: this.serializeUser(updated) };
  }

  @Get('admins')
  @Roles(ApiRole.ADMIN)
  @ApiOperation({ summary: 'Get all admins' })
  async getAdmins() {
    const admins = await this.usersService.findByRole(ApiRole.ADMIN);
    return { data: admins.map((u) => this.serializeUser(u)) };
  }

  @Get('developers')
  @ApiOperation({ summary: 'Get all developers' })
  async getDevelopers() {
    const developers = await this.usersService.findByRole(ApiRole.DEVELOPER);
    return { data: developers.map((u) => this.serializeUser(u)) };
  }

  @Get('field-ops')
  @ApiOperation({ summary: 'Get all field ops' })
  async getFieldOps() {
    const fieldOps = await this.usersService.findByRole(ApiRole.FIELD_OPS);
    return { data: fieldOps.map((u) => this.serializeUser(u)) };
  }

  @Get('customers')
  @ApiOperation({ summary: 'Get all clients/customers' })
  async getCustomers() {
    const clients = await this.usersService.findByRole(ApiRole.CLIENT);
    return { data: clients.map((u) => this.serializeUser(u)) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    const foundUser = await this.usersService.findOne(id, user);
    return { user: this.serializeUser(foundUser) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: User,
  ) {
    const updated = await this.usersService.update(id, dto, user);
    return { user: this.serializeUser(updated) };
  }

  @Patch(':id/status')
  @Roles(ApiRole.ADMIN)
  @ApiOperation({ summary: 'Update user status (Admin only)' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
    @CurrentUser() user: User,
  ) {
    const updated = await this.usersService.updateStatus(id, status, user);
    return { user: this.serializeUser(updated) };
  }

  @Get(':id/projects')
  @ApiOperation({ summary: 'Get user projects' })
  async getUserProjects(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const projects = await this.usersService.getUserProjects(id, user);
    return { data: projects };
  }

  @Delete(':id')
  @Roles(ApiRole.ADMIN)
  @ApiOperation({ summary: 'Delete user (Admin only, soft delete)' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    await this.usersService.remove(id, user);
    return { message: 'User deleted successfully' };
  }

  private serializeUser(user: User) {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      location: user.location,
      avatarUrl: user.avatarUrl,
      language: user.language,
      timezone: user.timezone,
      role: toApiRole(user.role),
      status: toApiUserStatus(user.status),
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

