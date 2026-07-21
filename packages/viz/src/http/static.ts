import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import type { ServerResponse } from 'node:http';
import { fileURLToPath } from 'node:url';

function resolveAsset(distributionPath: string, workspacePath: string): URL {
  const distributionAsset = new URL(distributionPath, import.meta.url);
  return existsSync(fileURLToPath(distributionAsset))
    ? distributionAsset
    : new URL(workspacePath, import.meta.url);
}

const assets: Readonly<
  Record<string, { readonly path: URL; readonly type: string }>
> = {
  '/': {
    path: resolveAsset('./viz/index.html', '../../public/index.html'),
    type: 'text/html; charset=utf-8',
  },
  '/assets/styles.css': {
    path: resolveAsset('./viz/styles.css', '../../public/styles.css'),
    type: 'text/css; charset=utf-8',
  },
  '/assets/main.js': {
    path: resolveAsset('./viz/main.js', '../client/main.js'),
    type: 'text/javascript; charset=utf-8',
  },
};

export async function serveStatic(
  pathname: string,
  response: ServerResponse,
): Promise<boolean> {
  const asset = assets[pathname];
  if (!asset) return false;

  const contents = await readFile(fileURLToPath(asset.path));
  response.writeHead(200, {
    'cache-control': 'no-cache',
    'content-type': asset.type,
    'x-content-type-options': 'nosniff',
  });
  response.end(contents);
  return true;
}
