import { getConfig } from "@accel-shooter/node-shared";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [getConfig] })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
