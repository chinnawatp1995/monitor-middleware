import * as promClient from 'prom-client';

export type RequestObj = {
  time: number;
  path: string;
  statusCode?: number;
  responseTime?: number;
  errorMessage?: string;
};

export interface CpuUsage {
  idle: number;
  total: number;
}

export interface MemoryUsage {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
}

export interface NetworkBandwidth {
  interface: string;
  rx_bytes: number;
  tx_bytes: number;
  rx_sec: number;
  tx_sec: number;
}

export type TRequestValue = {
  time: number;
  path: string;
  statusCode?: number;
  responseTime?: number;
  errorMessage?: string;
};

export type CounterHashMap = Record<
  string,
  {
    value: number;
    labels: Record<string, string>;
  }
>;

export type GaugeHashMap = Record<
  string,
  {
    value: number;
    labels: Record<string, string>;
  }
>;

export type HistogramHashMap = Record<
  string,
  {
    value: number;
    sum: number;
    count: number;
    bucketValues: Record<string, number>;
    labels: Record<string, string>;
  }
>;

export interface MetricInstance {
  totalRequest: promClient.Counter;
  responseTime: promClient.Histogram;
  error: promClient.Counter;
  cpu: promClient.Gauge;
  mem: promClient.Gauge;
  rxNetwork: promClient.Gauge;
  txNetwork: promClient.Gauge;
}
