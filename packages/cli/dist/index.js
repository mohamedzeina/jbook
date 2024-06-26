#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const serve_1 = require("./commands/serve");
commander_1.program.addCommand(serve_1.serveCommand); // We only have one command to add, if we had others we would add them here
commander_1.program.parse(process.argv);
