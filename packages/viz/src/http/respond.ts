import type { IncomingMessage, ServerResponse } from 'node:http';

type ResultLike = {
  isErr(): boolean;
  error?: unknown;
  value?: unknown;
};

export function fromResult(response: ServerResponse, result: ResultLike) {
  return result.isErr()
    ? json(response, { error: String(result.error) }, 500)
    : json(response, result.value);
}

export function json(response: ServerResponse, value: unknown, status = 200) {
  response.writeHead(status, {
    'access-control-allow-origin': '*',
    'content-type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(value));
}

export function readBody(
  request: IncomingMessage,
): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let body = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => (body += chunk));
    request.on('end', () => {
      try {
        resolve(JSON.parse(body) as Record<string, unknown>);
      } catch {
        resolve({});
      }
    });
  });
}
