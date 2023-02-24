/*
 * @Author: tuWei
 * @Date: 2023-02-24 15:34:11
 * @LastEditors: 
 * @LastEditTime: 2023-02-24 15:38:31
 */
import axios from 'axios';

axios.interceptors.request.use(
  cfg => {
    cfg.headers['protocol-version'] = "2.0";
    cfg.headers['access-token'] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhT3duZXJPcmdJZCI6IjEyOTE3OTE0NTY5MDI4ODEyOCIsImFjY291bnRJZCI6ImRjNjg1ZTUzMzgyODRiMWY4ZmI1MGU5ZmU0ZDM5OTM1IiwicHJvZHVjdElkIjoiMSIsImV4cCI6MTI0NzYyMTEyMTgsInVzZXJJZCI6ImM3M2Y2NzYxYWUzNjQyZGE4ZDk1MzVkNWNhMDM4NTI1IiwidXVpZCI6IjQ0NjBmNTM3NzI3ZDQ2YTNiMTBkNGNiYjUxOGJmZjNhIiwiaWF0IjoxNjc2MjExMjE4LCJ1c2VybmFtZSI6IjE4NTk4NTkyMjg5In0.-iljI95Hs3a0pyew53Zn_reExdcZ3iMFkOxQV3Vj-3s";
    return cfg;
  },
  err => Promise.resolve(err)
);

export default axios;