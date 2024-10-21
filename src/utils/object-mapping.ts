import { TCounter, TGauge, THistrogram } from './request.type';
import { getTIMESTAMPTZ } from './util-functions';

export const promHistogram2Req = (histogram: any): THistrogram => {
	const { name, type, labelNames, buckets, hashMap } = histogram;
	return {
		time: getTIMESTAMPTZ(),
		name,
		type,
		labelNames,
		buckets,
		hashMap,
	};
};

export const promCounter2Req = (counter: any): TCounter => {
	const { name, type, labelNames, hashMap } = counter;
	return {
		time: getTIMESTAMPTZ(),
		name,
		type,
		labelNames,
		hashMap,
	};
};

export const promGauge2Req = (gauge: any): TGauge => {
	const { name, type, labelNames, hashMap } = gauge;
	return {
		time: getTIMESTAMPTZ(),
		name,
		type,
		labelNames,
		hashMap,
	};
};
