import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, RefreshToken } from '../database/entities';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async getProfile(userId: string) {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async updateProfile(userId: string, data: any) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    Object.assign(user, data);
    return this.userRepository.save(user);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new NotFoundException('Current password is incorrect');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    // Revoke all refresh tokens
    await this.refreshTokenRepository.update(
      { userId, revokedAt: null },
      { revokedAt: new Date() },
    );
  }

  async getSessions(userId: string) {
    const tokens = await this.refreshTokenRepository.find({
      where: { userId, revokedAt: null },
      order: { createdAt: 'DESC' },
    });

    return tokens.map((token) => ({
      id: token.id,
      createdAt: token.createdAt,
      expiresAt: token.expiresAt,
    }));
  }

  async logoutAll(userId: string) {
    await this.refreshTokenRepository.update(
      { userId },
      { revokedAt: new Date() },
    );
  }
}

