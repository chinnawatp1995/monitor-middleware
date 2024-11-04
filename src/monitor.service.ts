import { Injectable } from '@nestjs/common';
import * as os from 'os';
import axios from 'axios';
import * as sysinfo from 'systeminformation';
import { MACHINE_ID, SERVICE } from './monitor-middleware';
import { promMetrics } from './metrics';
import { CpuUsage, MemoryUsage, NetworkBandwidth } from './utils/metrics.type';

@Injectable()
export class MonitorService {
  private metrics: any;
  private lastCpuUsage: CpuUsage | null = null;
  private readonly RESOURCE_COLLECTION_INTERVAL = 1000; // 1 second
  private readonly METRICS_PUSH_INTERVAL = 4000; // 4 seconds
  private readonly METRICS_ENDPOINT =
    'http://localhost:3010/monitor-server/collect-metrics';

  constructor() {
    this.metrics = promMetrics;
  }

  onModuleInit() {
    this.collectResourceUsage();
    this.push();
  }

  private calculateCpuUsage(): number {
    const cpus = os.cpus();
    const cpuUsage = cpus.reduce(
      (acc, cpu) => {
        const totalTime = Object.values(cpu.times).reduce(
          (sum, time) => sum + time,
          0,
        );
        return {
          idle: acc.idle + cpu.times.idle,
          total: acc.total + totalTime,
        };
      },
      { idle: 0, total: 0 },
    );

    if (!this.lastCpuUsage) {
      this.lastCpuUsage = cpuUsage;
      return 0;
    }

    const idleDiff = cpuUsage.idle - this.lastCpuUsage.idle;
    const totalDiff = cpuUsage.total - this.lastCpuUsage.total;
    const usage = 100 * (1 - idleDiff / totalDiff);

    this.lastCpuUsage = cpuUsage;
    return usage;
  }

  private calculateMemoryUsage(): MemoryUsage {
    const mem = process.memoryUsage();
    const totalMem = os.totalmem();

    return {
      rss: this.calculatePercentage(mem.rss, totalMem),
      heapTotal: this.calculatePercentage(mem.heapTotal, totalMem),
      heapUsed: this.calculatePercentage(mem.heapUsed, totalMem),
      external: this.calculatePercentage(mem.external, totalMem),
    };
  }

  private calculatePercentage(value: number, total: number): number {
    return 100 * (value / total);
  }

  private async calculatateNetworkBandwidth(): Promise<NetworkBandwidth[]> {
    const networkStats = await sysinfo.networkStats();
    return networkStats.map((stat) => ({
      interface: stat.iface,
      rx_bytes: stat.rx_bytes,
      tx_bytes: stat.tx_bytes,
      rx_sec: stat.rx_sec ?? 0,
      tx_sec: stat.tx_sec ?? 0,
    }));
  }

  private async collectResourceUsage(): Promise<void> {
    setInterval(async () => {
      try {
        const cpuUsage = this.calculateCpuUsage();
        const memoryUsage = this.calculateMemoryUsage();
        const networkUsage = await this.calculatateNetworkBandwidth();

        const labels = {
          service: SERVICE,
          machine: MACHINE_ID,
        };

        this.metrics.cpu.set(labels, cpuUsage);
        this.metrics.mem.set(labels, memoryUsage.rss);
        this.metrics.rxNetwork.set(labels, networkUsage[0].rx_sec);
        this.metrics.txNetwork.set(labels, networkUsage[0].tx_sec);
      } catch (error) {
        console.error('Error collecting resource usage:', error);
      }
    }, this.RESOURCE_COLLECTION_INTERVAL);
  }

  private resetMetrics(): void {
    for (const metric of Object.values(promMetrics)) {
      (metric as any).reset();
    }
  }

  private async push(): Promise<void> {
    setInterval(async () => {
      try {
        axios.post(this.METRICS_ENDPOINT, {
          time: new Date().getTime(),
          totalRequest: promMetrics.totalRequest.hashMap,
          responseTime: promMetrics.responseTime.hashMap,
          error: promMetrics.error.hashMap,
          cpu: promMetrics.cpu.hashMap,
          mem: promMetrics.mem.hashMap,
          rxNetwork: promMetrics.rxNetwork.hashMap,
          txNetwork: promMetrics.txNetwork.hashMap,
        });
        // console.log(promMetrics.totalRequest.hashMap);
      } catch (error) {
        // console.error('Error pushing metrics:', error.message);
      }
      // this.resetMetrics();
    }, this.METRICS_PUSH_INTERVAL);
  }
}
