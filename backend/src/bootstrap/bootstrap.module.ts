import { Module } from '@nestjs/common';
import { TwitterModule } from 'src/twitter/twitter.module';
import { BootstrapService } from './bootstrap.service';
import { BotsModule } from 'src/bots/bots.module';

@Module({
  providers: [
    BootstrapService
  ],
  imports: [
    TwitterModule,
    BotsModule
  ],
  exports: [
    BootstrapService
  ]
})
export class BootstrapModule { }
