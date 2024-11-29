import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { DispatcherService } from "./dispatcher.service";
import { WebsocketsGateway } from "./websockets.gateway";

@Module({
  imports: [
    PrismaModule
  ],
  providers: [
    WebsocketsGateway,
    DispatcherService,
  ],
  exports: [
    DispatcherService
  ]
})
export class WebsocketsModule { }
