#!/usr/bin/env node

import { pullCommand } from "./pull-command.ts";

const command = process.argv[2];
const args = process.argv.slice(3);

if (command === "pull") {
  await pullCommand(args);
} else {
  console.error("Unknown command. Supported command: pull");
  process.exit(1);
}
