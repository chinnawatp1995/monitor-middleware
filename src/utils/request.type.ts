export type TMetric<T> = {
  name: string;
  type: string;
  time: any;
  labelNames: string[];
  hashMap: Record<string, T>;
};

export type TCounter = TMetric<{ value: number }>;

export type TGauge = TMetric<{ value: number }>;

export type THistrogram = TMetric<{
  bucketValus: Record<string, number>;
  sum: number;
  count: number;
}> & {
  buckets: number[];
};
