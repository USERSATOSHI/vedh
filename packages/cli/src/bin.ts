#!/usr/bin/env node
import { VedhCli } from './index.js';
await new VedhCli().run(process.argv.slice(2));
