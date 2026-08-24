import "reflect-metadata";
import { applyTestEnv } from "./vitest.env.js";

// Setup files run before test-file imports; data-source.ts reads the
// environment at import time.
applyTestEnv();
