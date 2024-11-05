import { Module } from '@nestjs/common';
import { MonitorService } from './monitor.service'; // Adjust the import path accordingly

@Module({
  providers: [MonitorService],
})
export class AppModule {}
