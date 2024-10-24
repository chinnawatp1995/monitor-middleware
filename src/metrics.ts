import { Metric } from './utils/Metric';

export const requestMetric = new Metric('request', []);
export const cpuMetric = new Metric('cpu', []);
export const memMetric = new Metric('memory', []);
export const networkMetric = new Metric('network', []);
