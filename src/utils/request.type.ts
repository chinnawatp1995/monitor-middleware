export type TMetricsRequest = {
  tags: string[];
  resourceCollectionTimes: number[];
  request: Record<string, (number | string)[]>;
  cpu: Record<string, (number | string)[]>;
  mem: Record<string, (number | string)[]>;
  network: Record<string, (number | string)[]>;
};
