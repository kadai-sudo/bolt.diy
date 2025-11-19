import type { ActionFunctionArgs, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';

// Node only: try to import child_process
let execSync: ((cmd: string, opts?: any) => string) | null = null;

try {
  if (typeof process !== 'undefined' && process.versions?.node) {
    // Safe dynamic import
    const cp = await import('child_process');
    execSync = cp.execSync;
  }
} catch {
  // Cloudflare environment → no child_process
  execSync = null;
}

const isDevelopment = process.env.NODE_ENV === 'development';

interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  command?: string;
  timestamp: string;
  error?: string;
}

const getProcessInfo = (): ProcessInfo[] => {
  // Cloudflare or environment where child_process unavailable
  if (!execSync) {
    return [
      {
        pid: 0,
        name: 'N/A',
        cpu: 0,
        memory: 0,
        timestamp: new Date().toISOString(),
        error: 'Process information not available in non-Node environment',
      },
    ];
  }

  // Real Node.js environment start
  const platform = process.platform;
  let processes: ProcessInfo[] = [];

  try {
    let cpuCount = 1;
    try {
      if (platform === 'linux') {
        cpuCount = parseInt(execSync('nproc', { encoding: 'utf-8' }), 10);
      } else if (platform === 'darwin') {
        cpuCount = parseInt(execSync('sysctl -n hw.ncpu', { encoding: 'utf-8' }), 10);
      } else if (platform === 'win32') {
        const out = execSync('wmic cpu get NumberOfCores', { encoding: 'utf-8' });
        const match = out.match(/\d+/);
        cpuCount = match ? parseInt(match[0], 10) : 1;
      }
    } catch {
      cpuCount = 1;
    }

    if (platform === 'linux' || platform === 'darwin') {
      const cmd =
        platform === 'linux'
          ? 'ps -eo pid,pcpu,pmem,comm --sort=-pmem | head -n 11'
          : 'ps -eo pid,pcpu,pmem,comm -r | head -n 11';

      const output = execSync(cmd, { encoding: 'utf-8' });
      const lines = output.split('\n').slice(1);

      processes = lines.map((line) => {
        const p = line.trim().split(/\s+/);
        const pid = parseInt(p[0], 10);
        const cpu = parseFloat(p[1]) / cpuCount;
        const memory = parseFloat(p[2]);
        const command = p.slice(3).join(' ');

        return {
          pid,
          name: command.split('/').pop() || command,
          cpu,
          memory,
          command,
          timestamp: new Date().toISOString(),
        };
      });
    }

    if (platform === 'win32') {
      const out = execSync(
        'powershell "Get-Process | Sort-Object -Property WorkingSet64 -Descending | Select-Object -First 10 Id, CPU, @{Name=\'Memory\';Expression={$_.WorkingSet64/1MB}}, ProcessName | ConvertTo-Json"',
        { encoding: 'utf-8' },
      );

      const arr = JSON.parse(out);
      const list = Array.isArray(arr) ? arr : [arr];

      processes = list.map((proc: any) => ({
        pid: proc.Id,
        name: proc.ProcessName,
        cpu: (proc.CPU || 0) / cpuCount,
        memory: proc.Memory,
        timestamp: new Date().toISOString(),
      }));
    }

    return processes;
  } catch (error) {
    console.error('Process info error:', error);
    return [
      {
        pid: 0,
        name: 'N/A',
        cpu: 0,
        memory: 0,
        timestamp: new Date().toISOString(),
        error: 'Failed to get process info',
      },
    ];
  }
};

export const loader: LoaderFunction = async () => {
  return json(getProcessInfo());
};

export const action = async () => {
  return json(getProcessInfo());
};
