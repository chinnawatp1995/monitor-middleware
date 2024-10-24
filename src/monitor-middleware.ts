import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ThaiTime } from '@midas-soft/midas-common';
import * as os from 'os';
import { TRequestValue } from './utils/metrics.type';
import { getTIMESTAMPTZ } from './utils/util-functions';
import { Metric } from './utils/Metric';
import { requestMetric, cpuMetric, memMetric, networkMetric } from './metrics';

// export let MACHINE_ID = `${os.hostname()}_${os.networkInterfaces['eth0'].mac}`;
export let MACHINE_ID = `${os.hostname()}`;

@Injectable()
export class MonitorMiddleware implements NestMiddleware {
  private job: string;
  private controller: string;
  private requestMetric: Metric;
  private cpuMetric: Metric;
  private memMetric: Metric;
  private networkMetric: Metric;
  constructor(
    private readonly jobName: string,
    private readonly machineId?: string,
    private readonly controllerName?: string,
  ) {
    this.job = jobName;
    MACHINE_ID = machineId ?? MACHINE_ID;
    this.controller = controllerName ?? '';
    this.requestMetric = requestMetric;
    this.cpuMetric = cpuMetric;
    this.memMetric = memMetric;
    this.networkMetric = networkMetric;

    this.requestMetric.setLabels([this.job, MACHINE_ID]);
    this.cpuMetric.setLabels([MACHINE_ID]);
    this.memMetric.setLabels([MACHINE_ID]);
    this.networkMetric.setLabels([MACHINE_ID]);
  }

  use = (req: Request, res: Response, next: NextFunction) => {
    try {
      const { method, path } = req;

      const requestObj: TRequestValue = {
        time: getTIMESTAMPTZ(),
        method,
        path: path,
        errorMessage: '',
      };

      const startTime = new ThaiTime().epoch;

      const originalSend = res.send;
      let responseBody: any;

      res.send = (body: any) => {
        responseBody = JSON.parse(body);
        return originalSend.call(res, body);
      };

      res.on('finish', () => {
        const endTime = new ThaiTime().epoch;
        const resTime = endTime - startTime;
        const status = res.statusCode;

        requestObj.responseTime = resTime;
        requestObj.statusCode = responseBody.errTitle ? 500 : status;

        if (Number(status) >= 400 || responseBody.errTitle) {
          requestObj.errorMessage = responseBody.errTitle;
        }
        this.requestMetric.add(
          [requestObj.path],
          [
            requestObj.time,
            requestObj.statusCode,
            requestObj.responseTime,
            requestObj.errorMessage,
            this.controller,
          ],
        );
      });
    } catch (e) {
      // TODO : Decide what action need to be done when failed
      debugger;
    }

    next();
  };
}

// Middleware Factory
export function MonitorMiddlewareFactory(
  job: string,
  machineId: string,
  controller: string,
) {
  // if (!machineId) {
  // 	throw new Error('MACHINE_ID_MUST_BE_DEFINED');
  // }
  console.log(machineId);
  return new MonitorMiddleware(job, machineId, controller);
}
