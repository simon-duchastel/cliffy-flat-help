import { Command } from "@cliffy/command";
import { flatHelp } from "../dist/mod.js";

// Example CLI demonstrating flat help
const cli = new Command()
  .name("todo")
  .description("A simple todo list CLI")
  .version("1.0.0")
  .help(flatHelp())
  .command("add", new Command()
    .description("Add a new todo item")
    .arguments("<title>")
    .argument("[description]", "Optional description")
    .option("-p, --priority <level>", "Set priority (low, medium, high)"))
  .command("list", new Command()
    .description("List all todo items")
    .option("-a, --all", "Show completed items too")
    .option("-s, --sort <field>", "Sort by field (date, priority)"))
  .command("done", new Command()
    .description("Mark a todo as complete")
    .arguments("<id>"))
  .command("delete", new Command()
    .description("Delete a todo item")
    .arguments("<id>")
    .option("-f, --force", "Skip confirmation"));

// Parse CLI arguments
await cli.parse();
