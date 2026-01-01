import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, User, Project, DeveloperProfile } from '../database/entities';
import { DbRole, DbProjectStatus } from '../contracts';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(DeveloperProfile)
    private developerProfileRepository: Repository<DeveloperProfile>,
  ) {}

  async findAll(developerId?: string, projectId?: string) {
    const query = this.reviewRepository.createQueryBuilder('review')
      .leftJoinAndSelect('review.author', 'author')
      .leftJoinAndSelect('review.project', 'project');

    if (developerId) {
      query.where('review.developerId = :developerId', { developerId });
    }

    if (projectId) {
      query.andWhere('review.projectId = :projectId', { projectId });
    }

    return query.orderBy('review.createdAt', 'DESC').getMany();
  }

  async findOne(id: string) {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['author', 'developer', 'project'],
    });

    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async create(
    developerId: string,
    projectId: string,
    rating: number,
    text: string,
    currentUser: User,
  ): Promise<Review> {
    if (currentUser.role !== DbRole.CLIENT) {
      throw new ForbiddenException('Only clients can create reviews');
    }

    const project = await this.projectRepository.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    if (project.clientId !== currentUser.id) {
      throw new ForbiddenException('You can only review your own projects');
    }

    if (project.status !== DbProjectStatus.COMPLETED) {
      throw new BadRequestException('Can only review completed projects');
    }

    if (project.developerId !== developerId) {
      throw new BadRequestException('Developer not assigned to this project');
    }

    // Check if review already exists
    const existing = await this.reviewRepository.findOne({
      where: { projectId, authorId: currentUser.id },
    });

    if (existing) {
      throw new BadRequestException('You have already reviewed this project');
    }

    const review = this.reviewRepository.create({
      developerId,
      projectId,
      authorId: currentUser.id,
      rating,
      text,
    });

    const savedReview = await this.reviewRepository.save(review);

    // Update developer rating
    await this.updateDeveloperRating(developerId);

    return savedReview;
  }

  async update(id: string, data: any, currentUser: User): Promise<Review> {
    const review = await this.findOne(id);

    if (review.authorId !== currentUser.id) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    if (data.rating !== undefined) review.rating = data.rating;
    if (data.text !== undefined) review.text = data.text;

    const savedReview = await this.reviewRepository.save(review);

    // Update developer rating
    await this.updateDeveloperRating(review.developerId);

    return savedReview;
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const review = await this.findOne(id);

    if (review.authorId !== currentUser.id) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.reviewRepository.remove(review);

    // Update developer rating
    await this.updateDeveloperRating(review.developerId);
  }

  private async updateDeveloperRating(developerId: string) {
    const reviews = await this.reviewRepository.find({ where: { developerId } });

    if (reviews.length === 0) return;

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    let profile = await this.developerProfileRepository.findOne({
      where: { userId: developerId },
    });

    if (profile) {
      profile.ratingAvg = avgRating;
      profile.ratingCount = reviews.length;
      await this.developerProfileRepository.save(profile);
    }
  }
}

