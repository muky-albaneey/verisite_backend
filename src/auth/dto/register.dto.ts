import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiRole } from '../../contracts';
import { toDbRole } from '../../common/utils/enum-mapper';
import { Transform } from 'class-transformer';

export class RegisterDto {
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

  @ApiProperty({ enum: ApiRole, required: false })
  @IsOptional()
  @IsEnum(ApiRole)
  @Transform(({ value }) => toDbRole(value))
  role?: ApiRole;
}

