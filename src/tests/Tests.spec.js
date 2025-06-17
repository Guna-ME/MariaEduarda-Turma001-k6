import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export const options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '3m', target: 300 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<5700'],
    http_req_failed: ['rate<0.12'],
    my_duration_trend: ['p(95)<5700'],
    my_status_rate: ['rate>0.88'],
  },
};

const myDuration = new Trend('my_duration_trend');
const myStatusRate = new Rate('my_status_rate');

export default function () {
  const res = http.get('https://jsonplaceholder.typicode.com/posts/1');

  if (res && res.timings && res.status) {
    myDuration.add(res.timings.duration);
    myStatusRate.add(res.status >= 200 && res.status < 400);
  }

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
