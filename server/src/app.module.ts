import { Module, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ClaimsModule } from './modules/claims/claims.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    ClaimsModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnApplicationBootstrap {
  private readonly logger = new Logger('MongoDB');

  constructor(@InjectConnection() private readonly connection: Connection) {}

  onApplicationBootstrap() {
    if (this.connection.readyState === 1) {
      this.logger.log(`Database connected successfully! Host: ${this.connection.host}`);
    } else {
      this.logger.warn(`Database connection status: ${this.connection.readyState}`);
    }
  }
}