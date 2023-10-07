/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramBotService } from './telegram-bot';
import { AdminModule } from './admin/admin.module';
import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'dotenv';
config();
@Module({
  imports: [AdminModule, UserModule,DatabaseModule,MongooseModule.forRootAsync({
    useFactory: () => ({
      uri: process.env.DATABASE_CONNECTION_STRING,
      useNewUrlParser: true,
      useUnifiedTopology: true, 
    }),
  }),
  UserModule,],
  controllers: [AppController,AdminController],
  providers: [AppService,TelegramBotService,AdminService],
})
export class AppModule {}
