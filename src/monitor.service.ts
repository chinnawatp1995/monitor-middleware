import { Injectable } from '@nestjs/common';
import * as os from 'os';
import axios from 'axios';

import { MACHINE_ID } from './monitor-middleware';
import { cpuMetric, memMetric, requestMetric } from './metrics';
import { Metric } from './utils/Metric';

let previousCpuUsage = process.cpuUsage();

@Injectable()
export class MonitorService {
  private request: Metric;
  private cpu: Metric;
  private mem: Metric;

  constructor() {
    this.request = requestMetric;
    this.cpu = cpuMetric;
    this.mem = memMetric;
  }

  onModuleInit() {
    this.collectResourceUsage();
    this.push();
  }

  private collectResourceUsage() {
    setInterval(() => {
      const currentCpuUsage = process.cpuUsage();
      const elapsedUserCpu = currentCpuUsage.user - previousCpuUsage.user;
      const elapsedSystemCpu = currentCpuUsage.system - previousCpuUsage.system;
      const elapsedCpuTime = (elapsedUserCpu + elapsedSystemCpu) / 1000;

      const cpuUsage = elapsedCpuTime / os.cpus().length;

      previousCpuUsage = currentCpuUsage;

      const mem = process.memoryUsage();
      const memoryUsage = mem.rss / os.totalmem();
      this.cpu.add([MACHINE_ID], cpuUsage);
      this.mem.add([MACHINE_ID], memoryUsage);
    }, 2 * 1_000);
  }

  private resetMetrics() {
    this.request.reset();
    this.cpu.reset();
    this.mem.reset();
  }

  private async push() {
    setInterval(async () => {
      const endPoint = 'http://localhost:3010/monitor-server/collect-metrics';
      try {
        console.log(this.request.getAllValues());
        console.log(this.cpu.getAllValues());
        console.log(this.mem.getAllValues());
        await axios.post(
          // 'http://' +
          // 	(process.env.END_POINT || 'localhost:') +
          // 	(process.env.PORT || '3010') +
          // 	'/monitor-server',
          endPoint,
          {
            tags: this.request.getServiceLabels(),
            request: this.request.getAllValues(),
            cpu: this.cpu.getAllValues(),
            mem: this.mem.getAllValues(),
          },
        );

        this.resetMetrics();
      } catch (e) {
        console.log('pushing metrics failed');
      }
    }, 4 * 1_000);
  }
}
