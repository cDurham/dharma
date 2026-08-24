import chalk from "chalk";

/**
 * Beautiful ASCII lotus flower with gradient colors
 */
export function showBanner() {
  // Using string concatenation to avoid template literal quote issues
  const lines = [
    "         " + chalk.hex("#FF69B4")("⚛"),
    "      " + chalk.hex("#FF1493")("_.-^^---....,_"),
    "  " +
      chalk.hex("#FF1493")("_--") +
      "\\                  " +
      chalk.hex("#FF1493")("--_"),
    " " +
      chalk.hex("#C71585")("<") +
      "\\                        " +
      chalk.hex("#C71585")("/)"),
    "  " +
      chalk.hex("#C71585")("\\\\") +
      "\\  " +
      chalk.hex("#FF69B4")(".") +
      "  " +
      chalk.hex("#FFB6C1")(".") +
      "   " +
      chalk.hex("#FFC0CB")(".") +
      "  " +
      chalk.hex("#FFB6C1")(".") +
      "   " +
      chalk.hex("#FF69B4")(".") +
      "  " +
      chalk.hex("#C71585")("//"),
    "   " +
      chalk.hex("#9370DB")("))") +
      " " +
      chalk.hex("#FF69B4")("'") +
      " " +
      chalk.hex("#FFB6C1")("'") +
      "   " +
      chalk.hex("#FFC0CB")("'") +
      "  " +
      chalk.hex("#FFB6C1")("'") +
      "   " +
      chalk.hex("#FF69B4")("'") +
      " " +
      chalk.hex("#9370DB")("("),
    "   " +
      chalk.hex("#9370DB")("(_") +
      ".       " +
      chalk.hex("#FFD700")("_//") +
      "       " +
      chalk.hex("#9370DB")("._)"),
    "    " +
      chalk.hex("#8A2BE2")("|'") +
      "      " +
      chalk.hex("#FFD700")("|_\\\\") +
      "_   " +
      chalk.hex("#8A2BE2")("'|"),
    "    " +
      chalk.hex("#8A2BE2")("|") +
      "   " +
      chalk.hex("#FFD700")("_/  ") +
      "    " +
      chalk.hex("#FFD700")("\\\\") +
      "  " +
      chalk.hex("#8A2BE2")("|"),
    "     " +
      chalk.hex("#7B68EE")("\\") +
      "." +
      chalk.hex("#FFD700")("_/") +
      "          " +
      chalk.hex("#FFD700")("\\\\_") +
      "." +
      chalk.hex("#00CED1")("/"),
    "      " +
      chalk.hex("#00CED1")("{_") +
      "            " +
      chalk.hex("#00CED1")("_}\\\\__"),
    "      " +
      chalk.hex("#00CED1")("(_") +
      "            " +
      chalk.hex("#00CED1")("___)   \\\\"),
    "       " +
      chalk.hex("#48D1CC")("(_.") +
      "              " +
      chalk.hex("#48D1CC")("_)  |"),
    "         " +
      chalk.hex("#48D1CC")("\\\\___...___//") +
      "   " +
      chalk.hex("#48D1CC")("//"),
    "          " +
      chalk.hex("#40E0D0")('`"-------""`') +
      "_  " +
      chalk.hex("#40E0D0")(".") +
      chalk.hex("#7FFFD4")("/"),
    "              " + chalk.hex("#7FFFD4")("`'''`"),
  ];

  const lotus = "\n" + lines.join("\n") + "\n";

  const title = chalk.hex("#FF1493").bold("DHARMA");
  const subtitle = chalk.hex("#9370DB")("Development CLI");
  const version = chalk.hex("#48D1CC")("v1.0.0");

  console.log(lotus);
  console.log("           " + title + " " + subtitle);
  console.log("                " + version);
  console.log();
}

/**
 * Simpler one-line lotus for inline use
 */
export function lotusIcon() {
  return chalk.hex("#FF69B4")("🪷");
}
