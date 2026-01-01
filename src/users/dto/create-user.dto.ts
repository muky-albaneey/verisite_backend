import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiRole, ApiUserStatus } from '../../contracts';
import { toDbRole, toDbUserStatus } from '../../common/utils/enum-mapper';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ enum: ApiRole })
  @IsEnum(ApiRole)
  @Transform(({ value }) => toDbRole(value))
  role: ApiRole;

  @ApiProperty({ enum: ApiUserStatus, required: false })
  @IsOptional()
  @IsEnum(ApiUserStatus)
  @Transform(({ value }) => toDbUserStatus(value))
  status?: ApiUserStatus;
}

