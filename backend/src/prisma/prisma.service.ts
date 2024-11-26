import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  public static instance: PrismaService;

  constructor() {
    super({
      // log: ['query', 'info', 'warn', 'error'],
    });
    PrismaService.instance = this;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    /*  this.$on('beforeExit', async () => {
       await app.close();
     }); */
  }
}