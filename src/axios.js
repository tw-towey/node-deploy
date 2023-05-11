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
    cfg.headers['access-token'] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhT3duZXJPcmdJZCI6IjEyOTE3OTE0NTY5MDI4ODEyOCIsImFjY291bnRJZCI6IjcwOWIzZWJmNjUyYjQ5YzQ5ZGNlOWZhNDQzMzA2OGZjIiwicHJvZHVjdElkIjoiMSIsImV4cCI6MTI0ODM3MzYzMDMsInVzZXJJZCI6IjkxODU2MjE3YzFmYzQ4ZmY5ODZlODUxNWUzODhlNzA3IiwidXVpZCI6IjI5ZDhiODZjZmNkMTRlNWFhYjI1MDg4MmY1MTMyOTQyIiwiaWF0IjoxNjgzNzM2MzAzLCJ1c2VybmFtZSI6IjEzNTUyNTIxNjk4In0.uNE27D-E-MR6KaWQ-ybHEQJz3FxzSS3Mrdj6YxX-d0M";
    return cfg;
  },
  err => Promise.resolve(err)
);

export default axios;