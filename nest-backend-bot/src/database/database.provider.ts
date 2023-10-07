/* eslint-disable prettier/prettier */
import { Provider } from '@nestjs/common';
import * as mongoose from 'mongoose';

export const databaseProviders: Provider[] = [
  {
    provide: 'DATABASE_CONNECTION', // This token will be used for dependency injection
    useFactory: async (): Promise<typeof mongoose> => {
      try {
        const uri = process.env.DATABASE_CONNECTION_STRING;

        // Connect to the MongoDB database using Mongoose
        const connection = await mongoose.connect(uri);

        return connection;
      } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
      }
    },
  },
];

