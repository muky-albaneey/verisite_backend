import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsEnum } from 'class-validator';
import { ApiUserStatus } from '../../contracts';
import { toDbUserStatus } from '../../common/utils/enum-mapper';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ enum: ApiUserStatus })
  @IsOptional()
  @IsEnum(ApiUserStatus)
  @Transform(({ value }) => toDbUserStatus(value))
  status?: ApiUserStatus;
}

