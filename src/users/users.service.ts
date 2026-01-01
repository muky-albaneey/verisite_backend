import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, Project } from '../database/entities';
import { CreateUserDto, UpdateUserDto, UpdateProfileDto } from './dto';
import { DbRole, DbUserStatus, ApiRole } from '../contracts';
import { toApiRole, toDbRole, toDbUserStatus } from '../common/utils/enum-mapper';
import { UploadService, UploadFolder } from '../upload/upload.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private uploadService: UploadService,
  ) {}

  async create(dto: CreateUserDto, currentUser: User): Promise<User> {
    // Only admins can create users
    if (currentUser.role !== DbRole.ADMIN) {
      throw new ForbiddenException('Only admins can create users');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      fullName: dto.fullName,
      email: dto.email,
      passwordHash,
      phoneNumber: dto.phoneNumber,
      location: dto.location,
      role: toDbRole(dto.role as string),
      status: dto.status ? toDbUserStatus(dto.status as string) : DbUserStatus.PENDING,
      isActive: true,
      isVerified: false,
    });

    return this.userRepository.save(user);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: ApiRole,
    status?: string,
    currentUser: User = null,
  ): Promise<{ users: User[]; total: number }> {
    const query = this.userRepository.createQueryBuilder('user');

    if (search) {
      query.where(
        '(user.fullName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (role) {
      query.andWhere('user.role = :role', { role: toDbRole(role) });
    }

    if (status) {
      query.andWhere('user.status = :status', { status: toDbUserStatus(status) });
    }

    // Field ops can only see themselves
    if (currentUser && currentUser.role === DbRole.FIELD_OPS) {
      query.andWhere('user.id = :userId', { userId: currentUser.id });
    }

    const skip = (page - 1) * limit;
    const [users, total] = await query.skip(skip).take(limit).getManyAndCount();

    return { users, total };
  }

  async findOne(id: string, currentUser: User = null): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['wallet', 'developerProfile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Field ops can only access themselves
    if (currentUser && currentUser.role === DbRole.FIELD_OPS && currentUser.id !== id) {
      throw new ForbiddenException('Access denied');
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto, currentUser: User): Promise<User> {
    const user = await this.findOne(id, currentUser);

    // Only admins can update other users, or users can update themselves
    if (currentUser.role !== DbRole.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new BadRequestException('Email already in use');
      }
    }

    Object.assign(user, dto);
    return this.userRepository.save(user);
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const user = await this.findOne(id, currentUser);

    // Only admins can delete users
    if (currentUser.role !== DbRole.ADMIN) {
      throw new ForbiddenException('Only admins can delete users');
    }

    await this.userRepository.softDelete(id);
  }

  async updateStatus(id: string, status: string, currentUser: User): Promise<User> {
    // Only admins can update status
    if (currentUser.role !== DbRole.ADMIN) {
      throw new ForbiddenException('Only admins can update user status');
    }

    const user = await this.findOne(id, currentUser);
    user.status = toDbUserStatus(status);
    return this.userRepository.save(user);
  }

  async findByRole(role: ApiRole): Promise<User[]> {
    return this.userRepository.find({
      where: { role: toDbRole(role) },
    });
  }

  async getUserProjects(userId: string, currentUser: User): Promise<Project[]> {
    const user = await this.findOne(userId, currentUser);

    // Check access
    if (currentUser.role !== DbRole.ADMIN && currentUser.id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.projectRepository.find({
      where: [
        { clientId: userId },
        { developerId: userId },
        { fieldOpsId: userId },
      ],
      relations: ['client', 'developer', 'fieldOps'],
    });
  }

  async getProfile(userId: string): Promise<User> {
    return this.findOne(userId);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findOne(userId);
    Object.assign(user, dto);
    return this.userRepository.save(user);
  }

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<User> {
    const user = await this.findOne(userId);

    const uploadResult = await this.uploadService.uploadImage(
      file,
      UploadFolder.AVATARS,
      userId,
    );

    user.avatarUrl = uploadResult.url;
    return this.userRepository.save(user);
  }
}

