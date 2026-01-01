import { Controller, Get, Put, Delete, Query, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto, createPaginationMeta } from '../common/dto/pagination.dto';
import { ApiRole } from '../contracts';
import { toApiNotificationType } from '../common/utils/enum-mapper';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  async findAll(@Query() pagination: PaginationDto, @CurrentUser() user: any) {
    const { notifications, total } = await this.notificationsService.findAll(
      user.id,
      pagination.page,
      pagination.limit,
    );

    return {
      data: notifications.map((n) => this.serialize(n)),
      meta: createPaginationMeta(pagination.page, pagination.limit, total),
    };
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get unread notifications' })
  async getUnread(@CurrentUser() user: any) {
    const notifications = await this.notificationsService.getUnread(user.id);
    return { data: notifications.map((n) => this.serialize(n)) };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  async getUnreadCount(@CurrentUser() user: any) {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { count };
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    const notification = await this.notificationsService.markAsRead(id, user.id);
    return { notification: this.serialize(notification) };
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUser() user: any) {
    await this.notificationsService.markAllAsRead(user.id);
    return { message: 'All notifications marked as read' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    await this.notificationsService.remove(id, user.id);
    return { message: 'Notification deleted successfully' };
  }

  private serialize(notification: any) {
    return {
      id: notification.id,
      userId: notification.userId,
      title: notification.title,
      message: notification.message,
      type: toApiNotificationType(notification.type),
      avatarUrl: notification.avatarUrl,
      isRead: notification.isRead,
      relatedEntityId: notification.relatedEntityId,
      relatedEntityType: notification.relatedEntityType,
      createdAt: notification.createdAt,
    };
  }
}

