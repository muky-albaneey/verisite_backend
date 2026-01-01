import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignDeveloperDto {
  @ApiProperty()
  @IsUUID()
  developerId: string;
}

