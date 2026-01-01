import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RejectProjectDto {
  @ApiProperty()
  @IsString()
  reason: string;
}

