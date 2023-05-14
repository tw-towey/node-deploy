/*
 * @Author: tuWei
 * @Date: 2023-02-24 15:34:11
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-05-14 22:33:39
 */
import axios from 'axios';

axios.interceptors.request.use(
  cfg => {
    cfg.headers['protocol-version'] = "2.0";
    cfg.headers['access-token'] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhT3duZXJPcmdJZCI6IjEyOTE3OTE0NTY5MDI4ODEyOCIsImFjY291bnRJZCI6IjMyMDk0NTgzODc5MTRlNGVhMGM4NGJlYjJjYjE1MjBjIiwicHJvZHVjdElkIjoiMSIsImV4cCI6MTI0ODQwNjI2NzIsInVzZXJJZCI6IjFmNjZiY2MxZThhZTQ5ZjU5MjllYTlmYWJmYWU2Y2NiIiwidXVpZCI6IjUzZjQ3YzAxMzI5NjQ0Nzg4NmUzYTY4YzRmMDY3NzdlIiwiaWF0IjoxNjg0MDYyNjcyLCJ1c2VybmFtZSI6IjEzMTQ2MjcyNTExIn0.ehVGGD5HS8ISQi60NKXsctRpv8CQJsE2AQtq6v2kICw";
    return cfg;
  },
  err => Promise.resolve(err)
);

export default axios;