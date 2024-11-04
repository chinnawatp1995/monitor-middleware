export type TRequestValue = {
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
