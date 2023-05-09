/*
 * @Author: tuWei
 * @Date: 2023-02-24 15:34:11
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-05-09 11:30:48
 */
import axios from 'axios';

axios.interceptors.request.use(
  cfg => {
    cfg.headers['protocol-version'] = "2.0";
    cfg.headers['access-token'] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fn8L7pZ9wNsQYbEROV1aeZAmN3ZzaBT8O80RKwJgmvo";
    return cfg;
  },
  err => Promise.resolve(err)
);

export default axios;