import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../database/entities';
import { PaginationDto, createPaginationMeta } from '../common/dto/pagination.dto';

@ApiTags('Conversations')
@Controller('conversations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all conversations' })
  async findAll(@CurrentUser() user: User) {
    const conversations = await this.conversationsService.findAll(user.id);
    return { data: conversations };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get conversation by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    const conversation = await this.conversationsService.findOne(id, user.id);
    return { conversation };
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get conversation messages' })
  async getMessages(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() pagination: PaginationDto,
    @CurrentUser() user: User,
  ) {
    const { messages, total } = await this.conversationsService.getMessages(
      id,
      user.id,
      pagination.page,
      pagination.limit,
    );
    return {
      data: messages,
      meta: createPaginationMeta(pagination.page, pagination.limit, total),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create conversation' })
  async create(
    @Body('projectId') projectId: string,
    @Body('userIds') userIds: string[],
    @CurrentUser() user: User,
  ) {
    const conversation = await this.conversationsService.create(projectId, userIds, user);
    return { conversation };
  }
}

