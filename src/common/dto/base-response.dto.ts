import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponseDto<T = any> {
  @ApiProperty()
  success: boolean = true;

  @ApiProperty()
  data: T;

  @ApiProperty({ required: false })
  message?: string;

  constructor(data: T, message?: string) {
    this.data = data;
    this.message = message;
  }
}

export class PaginatedResponseDto<T = any> {
  @ApiProperty()
  success: boolean = true;

  @ApiProperty()
  data: T[];

  @ApiProperty()
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  constructor(data: T[], meta: any) {
    this.data = data;
    this.meta = meta;
  }
}

export class ErrorResponseDto {
  @ApiProperty()
  success: boolean = false;

  @ApiProperty()
  error: {
    statusCode: number;
    message: string | string[];
    error: string;
  };
}

