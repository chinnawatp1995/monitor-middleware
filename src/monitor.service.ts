import { Injectable } from '@nestjs/common';
import * as os from 'os';
import axios from 'axios';

import { MACHINE_ID } from './monitor-middleware';
import { cpuMetric, memMetric, requestMetric } from './metrics';
import { Metric } from './utils/Metric';

@Injectable()
export class MonitorService {
  private request: Metric;
  private cpu: Metric;
  private mem: Metric;
  private lastCpuUsage: { idle: number; total: number } | null = null;

  constructor() {
    this.request = requestMetric;
    this.cpu = cpuMetric;
    this.mem = memMetric;
  }

  onModuleInit() {
    this.collectResourceUsage();
    this.push();
  }

  private calculateCpuUsage(): number {
    const cpus = os.cpus();
    let idleTime = 0;
    let totalTime = 0;

    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTime += cpu.times[type];
      }
      idleTime += cpu.times.idle;
    }

    if (this.lastCpuUsage) {
      const idleDiff = idleTime - this.lastCpuUsage.idle;
      const totalDiff = totalTime - this.lastCpuUsage.total;
      const cpuUsage = 100 * (1 - idleDiff / totalDiff); // Convert to percentage
      this.lastCpuUsage = { idle: idleTime, total: totalTime };
      return cpuUsage;
    } else {
      this.lastCpuUsage = { idle: idleTime, total: totalTime };
      return 0;
    }
  }

  private calculateMemoryUsage(): { [key: string]: number } {
    const mem = process.memoryUsage();
    const totalMem = os.totalmem();

    return {
      rss: 100 * (mem.rss / totalMem),
      heapTotal: 100 * (mem.heapTotal / totalMem),
      heapUsed: 100 * (mem.heapUsed / totalMem),
      external: 100 * (mem.external / totalMem),
    };
  }

  private collectResourceUsage() {
    setInterval(() => {
      const cpuUsage = this.calculateCpuUsage();

      const memoryUsage = this.calculateMemoryUsage();

      this.cpu.add([MACHINE_ID], [cpuUsage]);
      this.mem.add([MACHINE_ID], [memoryUsage.rss]);
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
        // console.log(this.request.getAllValues());
        // console.log(this.cpu.getAllValues());
        // console.log(this.mem.getAllValues());
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
