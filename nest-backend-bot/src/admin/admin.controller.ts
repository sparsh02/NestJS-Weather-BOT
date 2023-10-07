// admin.controller.ts

import { Controller, Get, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('api-key')
  getApiKey() {
    return this.adminService.getApiKey();
  }

  @Post('api-key')
  setApiKey(@Body() apiKey: { key: string }) {
    return this.adminService.setApiKey(apiKey.key);
  }

  @Get('users')
  getUsers() {
    return this.adminService.getUsers();
  }
}
