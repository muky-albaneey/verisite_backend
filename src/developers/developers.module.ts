import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevelopersService } from './developers.service';
import { DevelopersController } from './developers.controller';
import { User, DeveloperProfile, Project } from '../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, DeveloperProfile, Project])],
  controllers: [DevelopersController],
  providers: [DevelopersService],
  exports: [DevelopersService],
})
export class DevelopersModule {}

