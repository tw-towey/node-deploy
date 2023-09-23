/*
 * @Author: tuWei
 * @Date: 2023-02-24 15:34:11
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-09-23 23:14:04
 */
import axios from 'axios';

axios.interceptors.request.use(
  cfg => {
    cfg.headers['protocol-version'] = "2.0";
    cfg.headers['Access-Token'] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhT3duZXJPcmdJZCI6IjEyOTE3OTE0NTY5MDI4ODEyOCIsImFjY291bnRJZCI6ImY5NTlhODk1N2VmYTQ1NGY5ZmYyMDg1ODE2Y2NjOTNkIiwicHJvZHVjdElkIjoiMiIsImV4cCI6MTI0OTI4OTY3MDMsInVzZXJJZCI6ImY5NTlhODk1N2VmYTQ1NGY5ZmYyMDg1ODE2Y2NjOTNkIiwidXVpZCI6IjA5Mjk3MzcxM2JlMjQ4NmFhM2I5NTJlOGFjNzY1Nzk1IiwiaWF0IjoxNjkyODk2NzAzLCJ1c2VybmFtZSI6IjEzODEwNzU4NTUzIn0.v0ESpjpat8aZ0-nrf1_g8qsCVVCGOf2Jou0ucrwi0Zs";
    return cfg;
  },
  err => Promise.resolve(err)
);

export default axios;