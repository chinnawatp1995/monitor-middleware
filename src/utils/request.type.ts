import { CounterHashMap, GaugeHashMap, HistogramHashMap } from './metrics.type';

export type TMetricsRequest = {
  time: number;
  totalRequest: CounterHashMap;
  responseTime: HistogramHashMap;
  error: CounterHashMap;
  cpu: GaugeHashMap;
  mem: GaugeHashMap;
  rxNetwork: GaugeHashMap;
  txNetwork: GaugeHashMap;
};
