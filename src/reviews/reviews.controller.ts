import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../database/entities';
import { ApiRole } from '../contracts';

@ApiTags('Reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all reviews' })
  async findAll(@Query('developerId') developerId?: string, @Query('projectId') projectId?: string) {
    const reviews = await this.reviewsService.findAll(developerId, projectId);
    return { data: reviews };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const review = await this.reviewsService.findOne(id);
    return { review };
  }

  @Post()
  @Roles(ApiRole.CLIENT)
  @ApiOperation({ summary: 'Create review (Client only)' })
  async create(
    @Body('developerId') developerId: string,
    @Body('projectId') projectId: string,
    @Body('rating') rating: number,
    @Body('text') text: string,
    @CurrentUser() user: User,
  ) {
    const review = await this.reviewsService.create(developerId, projectId, rating, text, user);
    return { review };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update review' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() data: any, @CurrentUser() user: User) {
    const review = await this.reviewsService.update(id, data, user);
    return { review };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete review' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    await this.reviewsService.remove(id, user);
    return { message: 'Review deleted successfully' };
  }
}

