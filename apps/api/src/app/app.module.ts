import { getConfig } from "@accel-shooter/node-shared";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [getConfig] }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "frontend"),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
