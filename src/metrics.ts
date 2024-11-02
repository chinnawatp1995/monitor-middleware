import { Metric } from './utils/Metric';

export type MetricType = 'request' | 'cpu' | 'memory' | 'network';

export interface MetricInstance {
  request: Metric;
  cpu: Metric;
  memory: Metric;
  network: Metric;
}

export const metrics: MetricInstance = {
  request: new Metric('request', []),
  cpu: new Metric('cpu', []),
  memory: new Metric('memory', []),
  network: new Metric('network', []),
};

export const {
  request: requestMetric,
  cpu: cpuMetric,
  memory: memMetric,
  network: networkMetric,
} = metrics;
