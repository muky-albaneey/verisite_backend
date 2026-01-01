import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Patch,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto, createPaginationMeta } from '../common/dto/pagination.dto';
import { User } from '../database/entities';
import { ApiRole } from '../contracts';
import { toApiReportStatus, toApiMediaType } from '../common/utils/enum-mapper';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all reports' })
  async findAll(@Query() pagination: PaginationDto, @CurrentUser() user: User) {
    const { reports, total } = await this.reportsService.findAll(user, pagination.page, pagination.limit);
    return {
      data: reports.map((r) => this.serializeReport(r)),
      meta: createPaginationMeta(pagination.page, pagination.limit, total),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    const report = await this.reportsService.findOne(id, user);
    return { report: this.serializeReport(report) };
  }

  @Post()
  @Roles(ApiRole.FIELD_OPS)
  @ApiOperation({ summary: 'Create report' })
  async create(
    @Body('assignmentId') assignmentId: string,
    @Body('title') title: string,
    @Body('reportText') reportText: string,
    @CurrentUser() user: User,
  ) {
    const report = await this.reportsService.create(assignmentId, title, reportText, user);
    return { report: this.serializeReport(report) };
  }

  @Post(':id/upload-media')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload report media' })
  async uploadMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    const media = await this.reportsService.uploadMedia(id, file, user);
    return { media: this.serializeMedia(media) };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update report' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() data: any, @CurrentUser() user: User) {
    const report = await this.reportsService.update(id, data, user);
    return { report: this.serializeReport(report) };
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit report for review' })
  async submit(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    const report = await this.reportsService.submit(id, user);
    return { report: this.serializeReport(report) };
  }

  @Patch(':id/review')
  @Roles(ApiRole.ADMIN, ApiRole.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Review report' })
  async review(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
    @CurrentUser() user: User,
  ) {
    const report = await this.reportsService.review(id, status, user);
    return { report: this.serializeReport(report) };
  }

  @Patch(':id/approve')
  @Roles(ApiRole.ADMIN, ApiRole.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Approve report' })
  async approve(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    const report = await this.reportsService.review(id, 'approved', user);
    return { report: this.serializeReport(report) };
  }

  @Patch(':id/reject')
  @Roles(ApiRole.ADMIN, ApiRole.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Reject report' })
  async reject(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    const report = await this.reportsService.review(id, 'rejected', user);
    return { report: this.serializeReport(report) };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete report' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    await this.reportsService.remove(id, user);
    return { message: 'Report deleted successfully' };
  }

  @Delete(':id/media/:mediaId')
  @ApiOperation({ summary: 'Delete report media' })
  async removeMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
    @CurrentUser() user: User,
  ) {
    await this.reportsService.removeMedia(mediaId, user);
    return { message: 'Media deleted successfully' };
  }

  private serializeReport(report: any) {
    return {
      id: report.id,
      reportCode: report.reportCode,
      projectId: report.projectId,
      assignmentId: report.assignmentId,
      createdById: report.createdById,
      title: report.title,
      reportText: report.reportText,
      status: toApiReportStatus(report.status),
      progressPercent: report.progressPercent,
      expectedCompletion: report.expectedCompletion,
      submittedAt: report.submittedAt,
      reviewedAt: report.reviewedAt,
      reviewedById: report.reviewedById,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      media: report.media ? report.media.map((m: any) => this.serializeMedia(m)) : [],
    };
  }

  private serializeMedia(media: any) {
    return {
      id: media.id,
      reportId: media.reportId,
      type: toApiMediaType(media.type),
      url: media.url,
      name: media.name,
      size: media.size,
      mimeType: media.mimeType,
      createdAt: media.createdAt,
    };
  }
}

