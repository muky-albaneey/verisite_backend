import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../database/entities';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@CurrentUser() user: User) {
    const profile = await this.settingsService.getProfile(user.id);
    return { profile };
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(@CurrentUser() user: User, @Body() data: any) {
    const profile = await this.settingsService.updateProfile(user.id, data);
    return { profile };
  }

  @Patch('security/change-password')
  @ApiOperation({ summary: 'Change password' })
  async changePassword(
    @CurrentUser() user: User,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    await this.settingsService.changePassword(user.id, currentPassword, newPassword);
    return { message: 'Password changed successfully' };
  }

  @Get('security/sessions')
  @ApiOperation({ summary: 'Get active sessions' })
  async getSessions(@CurrentUser() user: User) {
    const sessions = await this.settingsService.getSessions(user.id);
    return { data: sessions };
  }

  @Patch('security/logout-all')
  @ApiOperation({ summary: 'Logout all sessions' })
  async logoutAll(@CurrentUser() user: User) {
    await this.settingsService.logoutAll(user.id);
    return { message: 'Logged out from all devices' };
  }
}

