import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ThaiTime } from '@midas-soft/midas-common';
import * as os from 'os';
import { TRequestValue } from './utils/metrics.type';
import { Metric } from './utils/Metric';
import { promMetrics } from './metrics';

export let MACHINE_ID = `${os.hostname()}`;
export let SERVICE = '';

interface MonitorMiddlewareConfig {
  jobName: string;
  machineId?: string;
  controllerName?: string;
}

interface ResponseData {
  errTitle?: string;
  [key: string]: any;
}

@Injectable()
export class MonitorMiddleware implements NestMiddleware {
  private readonly job: string;
  private readonly controller: string;
  private readonly requestMetric: Metric;
  private readonly cpuMetric: Metric;
  private readonly memMetric: Metric;
  private readonly networkMetric: Metric;

  constructor({ jobName, machineId, controllerName }: MonitorMiddlewareConfig) {
    this.job = jobName;
    MACHINE_ID = machineId ?? MACHINE_ID;
    SERVICE = this.job;
    this.controller = controllerName ?? '';
  }

  private handleResponse(
    requestObj: TRequestValue,
    startTime: number,
    res: Response,
    responseBody: ResponseData,
  ): void {
    const endTime = new ThaiTime().epoch;
    const resTime = endTime - startTime;
    const status = res.statusCode;

    requestObj.responseTime = resTime;
    requestObj.statusCode = responseBody.errTitle ? 500 : status;

    if (Number(status) >= 400 || responseBody.errTitle) {
      requestObj.errorMessage = responseBody.errMsg;
      promMetrics.error.inc({
        service: this.job,
        machine: MACHINE_ID,
        controller: this.controller,
        path: requestObj.path,
        statusCode: requestObj.statusCode,
        reason: requestObj.errorMessage.slice(30),
      });
    }

    promMetrics.totalRequest.inc({
      service: this.job,
      machine: MACHINE_ID,
      controller: this.controller,
      path: requestObj.path,
      statusCode: requestObj.statusCode,
    });

    promMetrics.responseTime.observe(
      {
        service: this.job,
        machine: MACHINE_ID,
        controller: this.controller,
        path: requestObj.path,
        statusCode: requestObj.statusCode,
      },
      requestObj.responseTime,
    );
  }

  use = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { path } = req;
      const requestObj: TRequestValue = {
        time: new Date().getTime(),
        path,
      };
      const startTime = new ThaiTime().epoch;
      const originalSend = res.send;
      let responseBody: ResponseData;

      res.send = function (body: any) {
        responseBody = JSON.parse(body);
        return originalSend.call(res, body);
      };

      res.on('finish', () => {
        this.handleResponse(requestObj, startTime, res, responseBody);
      });
    } catch (error) {
      console.error('Monitor middleware error:', error);
    }
    next();
  };
}

export function MonitorMiddlewareFactory(
  job: string,
  machineId: string,
  controller: string,
): MonitorMiddleware {
  return new MonitorMiddleware({
    jobName: job,
    machineId,
    controllerName: controller,
  });
}
