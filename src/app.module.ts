import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
// ThrottlerModule removed - use express-rate-limit instead if needed
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import s3Config from './config/s3.config';
import paystackConfig from './config/paystack.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UploadModule } from './upload/upload.module';
import { HealthModule } from './health/health.module';
import { ProjectsModule } from './projects/projects.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { MilestonesModule } from './milestones/milestones.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { WalletModule } from './wallet/wallet.module';
import { PaystackModule } from './paystack/paystack.module';
import { EscrowModule } from './escrow/escrow.module';
import { DevelopersModule } from './developers/developers.module';
import { ReviewsModule } from './reviews/reviews.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SettingsModule } from './settings/settings.module';
import { ConversationsModule } from './conversations/conversations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, s3Config, paystackConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        return {
          type: 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          ssl: dbConfig.ssl,
          synchronize: dbConfig.synchronize,
          logging: dbConfig.logging,
          entities: dbConfig.entities,
          migrations: dbConfig.migrations,
          migrationsRun: false,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    UploadModule,
    HealthModule,
    ProjectsModule,
    AssignmentsModule,
    MilestonesModule,
    NotificationsModule,
    ReportsModule,
    WalletModule,
    PaystackModule,
    EscrowModule,
    DevelopersModule,
    ReviewsModule,
    DashboardModule,
    SettingsModule,
    ConversationsModule,
  ],
})
export class AppModule {}

