/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import fetch from 'node-fetch';
import * as cron from 'node-cron';
import { config } from 'dotenv';
config();
import { AdminService } from './admin/admin.service';
import { UserService } from './user/user.service';


// Replace with your Telegram bot token
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CITY = process.env.CITY;


// Interface to represent the expected structure of the weather API response
interface WeatherResponse {
  weather: {
    description: string;
  }[];
  main: {
    temp: number;
  };
}

@Injectable()
export class TelegramBotService {
  private bot: TelegramBot;
  private subscribedUsers: Set<number> = new Set<number>();
  private pendingSubscriptions: Map<number, { chatId: number; username: string }> = new Map<number, { chatId: number; username: string }>();

  constructor(private readonly adminService: AdminService, private readonly userService: UserService,) {
    
    this.bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

    this.loadSubscribedUsers();

    this.registerCommands();

    // Schedule the sendWeatherUpdates function to run every hour
    cron.schedule('0 * * * *', () => {
        console.log("sending update");
        
      this.sendWeatherUpdatesToAll();
    });
  }

  private registerCommands() {
    console.log("hello");

    this.bot.onText(/\/start/, async(msg)=>{
      const chatId = msg.chat.id;
      const first_name = msg.from.first_name

      this.bot.sendMessage(chatId, `Hi ${first_name}, welcome to the weather bot, you can subscribe by using the /subscribe command, and unsubscribe using /unsubscribe command}`)
      

    })
    // this.bot.onText(/\/subscribe/, async (msg) => {
      
    //   const chatId = msg.chat.id;
    //   const userId = msg.from.id;
    //   const username = msg.from.first_name;
  
    //   const existingUser = await this.userService.getUserByChatId(chatId);
    //   console.log(existingUser);
      
  
    //   if (existingUser) {
    //     this.bot.sendMessage(chatId, 'You are already registered.');
    //   } else {
    //     const user = await this.userService.createUser(userId, username);
    //     if (user) {
    //       this.bot.sendMessage(chatId, 'You have been registered.');
    //       this.subscribedUsers.add(chatId);
    //       this.sendWeatherUpdate(chatId);
    //     } else {
    //       this.bot.sendMessage(chatId, 'Registration failed. Please try again.');
    //     }
    //   }
    // });

    this.bot.onText(/\/subscribe/, async (msg) => {
      console.log(msg);

      const chatId = msg.chat.id;
      const userId = msg.from.id;
      const username = msg.from.first_name;

      // Prompt the user to share their location
      this.bot.sendMessage(chatId, 'To subscribe, please share your location:', {
        reply_markup: {
          keyboard: [
            [
              {
                text: 'Share Location',
                request_location: true, // Request the user's location
              },
            ]
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });


      this.pendingSubscriptions.set(userId, { chatId, username });
    });

    this.bot.on('location', async (msg) => {

      console.log(msg);
      
      const userId = msg.from.id;
      const location = msg.location;
      const chatId = msg.chat.id;

      const userData = this.pendingSubscriptions.get(userId);

      if (userData) {
        const latitude = location.latitude;
        const longitude = location.longitude;

        const weatherData = await this.fetchWeatherData(latitude, longitude);
        const { chatId, username } = userData;
        const existingUser = await this.userService.getUserByChatId(chatId);

        // Send the weather update to the user
        this.bot.sendMessage(chatId, `Weather in your location:\n${weatherData}`);

        if (!existingUser) {
          await this.userService.createUser(userId, username);
        }

        // Add the user to the list of subscribed users
        this.subscribedUsers.add(chatId);

        // Remove the user's information from the pending subscriptions
        this.pendingSubscriptions.delete(userId);
      }
    });
  
    
  
    this.bot.onText(/\/unsubscribe/, async (msg) => {
      const chatId = msg.chat.id;
  
      const existingUser = await this.userService.getUserByChatId(chatId);
      if (existingUser) {
        const deletedUser = await this.userService.deleteUser(chatId);
        if (deletedUser) {
          this.subscribedUsers.delete(chatId);
          this.bot.sendMessage(chatId, 'You have been unregistered.');
        } else {
          this.bot.sendMessage(chatId, 'Unregistration failed. Please try again.');
        }
      } else {
        this.bot.sendMessage(chatId, 'You are not registered.');
      }
    });
  
  }

  private async sendWeatherUpdate(chatId: number) {

    const apiKey = this.adminService.getApiKey();    

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${apiKey}`,
      );

      if (!response.ok) {
        Logger.error('Failed to fetch weather data');
        return;
      }

      const data: WeatherResponse = (await response.json()) as WeatherResponse;

      const weatherDescription = data.weather[0]?.description;
      const temperature = (data.main?.temp - 273.15)?.toFixed(2); // Convert to Celsius

      const message = `Weather in ${CITY}:\n${weatherDescription}\nTemperature: ${temperature}°C`;

      this.bot.sendMessage(chatId, message);
    } catch (error) {
      Logger.error('Error fetching weather data', error);
    }
  }

  private async sendWeatherUpdatesToAll() {

    for (const chatId of this.subscribedUsers) {
      this.sendWeatherUpdate(chatId);
    }
  }

  private async loadSubscribedUsers() {
    const users = await this.userService.getUsers();
    users.forEach((user) => {
      this.subscribedUsers.add(user.chatId);
    });
  }
  

  //changes
  private async fetchWeatherData(latitude: number, longitude: number): Promise<string> {
    // Make an API request to fetch weather data based on the provided latitude and longitude
    // Implement the logic to fetch weather data from a weather service of your choice

    // For example, you can use the OpenWeatherMap API or any other weather data provider

    // Replace the following with actual weather data fetching logic
    const apiKey = this.adminService.getApiKey();
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`,
      );

      if (!response.ok) {
        Logger.error('Failed to fetch weather data');
        return 'Weather data not available';
      }

      const data: WeatherResponse = (await response.json()) as WeatherResponse;

      const weatherDescription = data.weather[0]?.description;
      const temperature = (data.main?.temp - 273.15)?.toFixed(2); // Convert to Celsius

      return `Weather:\n${weatherDescription}\nTemperature: ${temperature}°C`;
    } catch (error) {
      Logger.error('Error fetching weather data', error);
      return 'Error fetching weather data';
    }
  }

}
