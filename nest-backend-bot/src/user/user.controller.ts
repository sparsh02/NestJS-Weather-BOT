/* eslint-disable prettier/prettier */
// user/user.controller.ts

import { Controller, Get, Delete, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.schema';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.userService.getUsers();
  }

  @Delete(':chatId')
  async deleteUser(@Param('chatId') chatId: number) {
    const deletedUser = await this.userService.deleteUser(chatId);
    if (deletedUser) {
      return { message: 'User deleted successfully' };
    } else {
    //   throw new NotFoundException('User not found');
    }
  }
}
