export type TMetrics<T> = {
  tag: string[];
  values: T[];
};

export type TRequestValue = {
  time: number;
  method: string;
  path: string;
  statusCode?: number;
  responseTime?: number;
  errorMessage?: string;
};

export type TResourceValue = {
  time: string;
  usage: number;
};
