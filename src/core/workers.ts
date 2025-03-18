import { Worker } from 'worker_threads';
import { cpus } from 'os';

export class WorkerPool {
  private workers: Worker[];
  private queue: Array<() => Promise<void>> = [];
  private activeWorkers = 0;

  constructor(private readonly maxWorkers: number = cpus().length) {
    this.workers = [];
  }

  async execute<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const executeTask = async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.activeWorkers--;
          this.processNextTask();
        }
      };

      this.queue.push(executeTask);
      this.processNextTask();
    });
  }

  private processNextTask(): void {
    if (this.activeWorkers >= this.maxWorkers || this.queue.length === 0) {
      return;
    }

    const task = this.queue.shift();
    if (task) {
      this.activeWorkers++;
      task();
    }
  }

  async shutdown(): Promise<void> {
    // Wait for all active tasks to complete
    if (this.activeWorkers > 0 || this.queue.length > 0) {
      await new Promise<void>(resolve => {
        const check = () => {
          if (this.activeWorkers === 0 && this.queue.length === 0) {
            resolve();
          } else {
            setTimeout(check, 100);
          }
        };
        check();
      });
    }

    // Terminate all workers
    await Promise.all(
      this.workers.map(worker => worker.terminate())
    );
  }
} 