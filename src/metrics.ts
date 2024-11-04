import { Metric } from './utils/Metric';
import * as promClient from 'prom-client';
export type MetricType = 'request' | 'cpu' | 'memory' | 'network';

export interface MetricInstance {
  request: Metric;
  cpu: Metric;
  memory: Metric;
  network: Metric;
}

export const promMetrics: any = {
  totalRequest: new promClient.Counter({
    name: 'total_request',
    help: 'total request',
    labelNames: ['service', 'machine', 'controller', 'path'],
  }),
  responseTime: new promClient.Histogram({
    name: 'avg_response_time',
    help: 'average_response_time',
    labelNames: ['service', 'machine', 'controller', 'path', 'statusCode'],
    buckets: [25, 50, 100, 200, 400, 800, 1600, 3200, 6400, 1280],
  }),
  error: new promClient.Counter({
    name: 'total_error',
    help: 'total error',
    labelNames: [
      'service',
      'machine',
      'controller',
      'path',
      'statusCode',
      'reason',
    ],
  }),
  // errorReason: new promClient.Counter({
  //   name: 'error_ranking',
  //   help: 'error ranking',
  //   labelNames: ['service', 'machine', 'controller', 'path', 'errorReason'],
  // }),
  cpu: new promClient.Gauge({
    name: 'avg_cpu',
    help: 'average cpu usage',
    labelNames: ['service', 'machine'],
  }),
  mem: new promClient.Gauge({
    name: 'avg_mem',
    help: 'average mem usage',
    labelNames: ['service', 'machine'],
  }),
  rxNetwork: new promClient.Gauge({
    name: 'rx_network',
    help: 'received network',
    labelNames: ['service', 'machine'],
  }),
  txNetwork: new promClient.Gauge({
    name: 'tx_network',
    help: 'transfered network',
    labelNames: ['service', 'machine'],
  }),
};
