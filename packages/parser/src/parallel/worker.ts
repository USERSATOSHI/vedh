import { parentPort, workerData } from 'node:worker_threads';
import { ParserEngine } from '../engine/index.js';
import type { ParseWorkerJob, ParseWorkerResponse } from './type.js';

const { jobs } = workerData as { jobs: ParseWorkerJob[] };
const engine = new ParserEngine({ parallelism: false });
const responses: ParseWorkerResponse[] = [];
for (const job of jobs) {
  const result = await engine.parseFile(job.filePath, {
    projectRoot: job.projectRoot,
    language: job.language,
    eventCalls: job.eventCalls,
  });
  if (result.isOk())
    responses.push({ filePath: job.filePath, result: result.value });
  else
    responses.push({
      filePath: job.filePath,
      diagnostic: {
        code: 'worker-failed',
        severity: 'error',
        message: 'Worker could not parse file',
        filePath: job.filePath,
      },
    });
}
engine.dispose();
parentPort?.postMessage(responses);
