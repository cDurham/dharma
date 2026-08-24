import { Command } from "commander";
import { dbCommand } from "./commands/db.js";
import { depsCommand } from "./commands/deps.js";
import { devCommand } from "./commands/dev.js";
import { execCommand } from "./commands/exec.js";
import { lintCommand } from "./commands/lint.js";
import { logsCommand } from "./commands/logs.js";
import { prodCommand } from "./commands/prod.js";
import { statusCommand } from "./commands/status.js";
import { testCommand } from "./commands/test.js";
import { showBanner } from "./utils/banner.js";

const program = new Command();

program.name("dharma").description("Dharma development CLI").version("1.0.0");

// Show banner if no command or only --help/--version
const shouldShowBanner =
  process.argv.length === 2 ||
  process.argv.includes("--help") ||
  process.argv.includes("-h");

if (shouldShowBanner) {
  showBanner();
}

program.addCommand(devCommand);
program.addCommand(prodCommand);
program.addCommand(logsCommand);
program.addCommand(dbCommand);
program.addCommand(execCommand);
program.addCommand(statusCommand);
program.addCommand(lintCommand);
program.addCommand(testCommand);
program.addCommand(depsCommand);

program.parse(process.argv);
