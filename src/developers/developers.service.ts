import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, DeveloperProfile, Project } from '../database/entities';
import { DbRole } from '../contracts';

@Injectable()
export class DevelopersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(DeveloperProfile)
    private developerProfileRepository: Repository<DeveloperProfile>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const query = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.developerProfile', 'profile')
      .where('user.role = :role', { role: DbRole.DEVELOPER });

    if (search) {
      query.andWhere('(user.fullName ILIKE :search OR user.email ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    const skip = (page - 1) * limit;
    const [developers, total] = await query.skip(skip).take(limit).getManyAndCount();

    return { developers, total };
  }

  async findOne(id: string) {
    const developer = await this.userRepository.findOne({
      where: { id, role: DbRole.DEVELOPER },
      relations: ['developerProfile'],
    });

    if (!developer) throw new NotFoundException('Developer not found');
    return developer;
  }

  async getProjects(developerId: string) {
    return this.projectRepository.find({
      where: { developerId },
      relations: ['client'],
    });
  }

  async updateProfile(developerId: string, data: any, currentUser: User) {
    if (currentUser.id !== developerId) {
      throw new ForbiddenException('You can only update your own profile');
    }

    let profile = await this.developerProfileRepository.findOne({
      where: { userId: developerId },
    });

    if (!profile) {
      const user = await this.userRepository.findOne({ where: { id: developerId } });
      if (!user) throw new NotFoundException('Developer not found');

      profile = this.developerProfileRepository.create({
        userId: developerId,
        name: user.fullName,
      });
    }

    Object.assign(profile, data);
    return this.developerProfileRepository.save(profile);
  }

  async verify(developerId: string, currentUser: User) {
    if (currentUser.role !== DbRole.ADMIN) {
      throw new ForbiddenException('Only admins can verify developers');
    }

    let profile = await this.developerProfileRepository.findOne({
      where: { userId: developerId },
    });

    if (!profile) {
      const user = await this.userRepository.findOne({ where: { id: developerId } });
      if (!user) throw new NotFoundException('Developer not found');

      profile = this.developerProfileRepository.create({
        userId: developerId,
        name: user.fullName,
        verified: true,
      });
    } else {
      profile.verified = true;
    }

    return this.developerProfileRepository.save(profile);
  }
}

