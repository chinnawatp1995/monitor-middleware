export class Metric {
  private metricName: string;
  private labels: string[];
  private map: Record<string, any[]>;

  constructor(name: string, labels: string[]) {
    this.metricName = name;
    this.labels = labels;
    this.map = {};
  }

  getServiceLabels(): string[] {
    return this.labels;
  }

  setLabels(labels: string[]) {
    this.labels = labels;
  }

  add(labels: string[], value: (number | string)[]) {
    const key = labels.join(':');
    if (!this.map[key]) {
      this.map[key] = [];
    }
    this.map[key].push(value);
  }

  reset() {
    this.map = {};
  }

  getValues(labels: string[]) {
    const key = labels.join(':');
    return this.map[key] || [];
  }

  getAllValues(): Record<string, (number | string)[]> {
    return { ...this.map };
  }

  getName(): string {
    return this.metricName;
  }

  getLabels(): string[][] {
    return Object.keys(this.map).map((key) => key.split(':'));
  }

  toString(): string {
    return `Metric: ${this.metricName}\n${JSON.stringify(this.map, null, 2)}`;
  }
}
