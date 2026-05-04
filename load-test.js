import http from 'k6/http';
import { check, sleep } from 'k6';
export const options = {
    scenarios: {
        /*
        load_test: {
            executor: 'ramping-vus',
            stages: [
                { duration: '1m', target: 100 }
            ],
        },

        stress_test: {
            executor: 'ramping-vus',
            stages: [
                { duration: '20s', target: 110 },
                { duration: '40s', target: 110 },
                { duration: '20s', target: 0 }
            ],
        },
        */
        spike_test: {
            executor: 'ramping-vus',
            stages: [
                { duration: '5s', target: 400 },
                { duration: '10s', target: 400 },
                { duration: '5s', target: 0 }
            ],
        },
    }
};
const BASE_URL = 'http://localhost:3000';
export default function () {
    const loginRes = http.post(`${BASE_URL}/login`, JSON.stringify({
        username: `tester_${__VU}`
    }), { headers: { 'Content-Type': 'application/json' } });
    check(loginRes, { 'logged in': (r) => r.status === 200 });
    const token = loginRes.json('token');
    if (!token) {
        sleep(1);
        return;
    }
    const payload = JSON.stringify({
        text: 'test one test two test three test four test five test six test seven test eight test nine test ten'
    });
    const tasksRes = http.post(`${BASE_URL}/tasks`, payload, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    check(tasksRes, { 'task created': (r) => r.status === 201 || r.status === 200 });
    sleep(1);
}