#!/usr/bin/env node
import { exec } from 'node:child_process';
import { join } from 'node:path';

let serveRoot;

if(process.platform === 'darwin'){
  serveRoot = join(process.env.HOME, '/Desktop/blogs/');
}else if(process.platform === 'win32'){
  serveRoot = join(process.env.USERPROFILE, '/Desktop/blogs/');
}
exec(`pm2 start 'serve -p 80 ${serveRoot} '`, (error, stdout, stderr) => {
  if (error) {
    console.error(`执行出错: ${error}`);
    return;
  }
  stdout && console.log(`stdout: ${stdout}`);
  stderr && console.error(`stderr: ${stderr}`);
});

// # Logs

// pm2 logs [--raw]       # Display all processes logs in streaming
// pm2 flush              # Empty all log files
// pm2 reloadLogs         # Reload all logs

// pm2 stop all           # Stop all processes
// pm2 restart all        # Restart all processes

// pm2 reload all         # Will 0s downtime reload (for NETWORKED apps)

// pm2 stop 0             # Stop specific process id
// pm2 restart 0          # Restart specific process id

// pm2 delete 0           # Will remove process from pm2 list
// pm2 delete all         # Will remove all processes from pm2 list

