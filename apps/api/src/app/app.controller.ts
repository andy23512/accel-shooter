import { ClickUp, Task } from "@accel-shooter/node-shared";
import { Controller, Get, Param } from "@nestjs/common";

@Controller()
export class AppController {
  @Get("task/:id")
  async getData(@Param("id") taskId: string): Promise<Task> {
    const clickUp = new ClickUp(taskId);
    return clickUp.getTask();
  }
}
