import { Table } from "@cliffy/table";
import type { Command, Argument, Option } from "@cliffy/command";

/**
 * Recursively collects all commands with their full path names.
 * For example, a command 'sub' nested under 'child' will be named 'child sub'.
 */
function collectAllCommands(
  command: Command,
  prefix: string = "",
  result: Array<{ cmd: Command; fullName: string; indent: number }> = []
): Array<{ cmd: Command; fullName: string; indent: number }> {
  const commands = command.getCommands();
  
  for (const cmd of commands) {
    const name = cmd.getName();
    const fullName = prefix ? `${prefix} ${name}` : name;
    const indent = prefix ? 2 : 0;
    
    result.push({ cmd, fullName, indent });
    
    // Recursively collect nested commands
    collectAllCommands(cmd, fullName, result);
  }
  
  return result;
}

/**
 * Generates a flat help text for a Cliffy command that includes all subcommands,
 * their arguments, and options in one comprehensive view.
 * 
 * This is particularly useful for AI agents and tools that need to understand
 * the complete CLI structure from a single --help call.
 * 
 * @param command - The Cliffy command to generate help for
 * @returns A formatted help string
 * 
 * @example
 * ```typescript
 * import { Command } from "@cliffy/command";
 * import { generateHelp } from "cliffy-flat-help";
 * 
 * const cmd = new Command()
 *   .name("my-cli")
 *   .description("My CLI tool")
 *   .command("init", new Command()
 *     .description("Initialize project")
 *     .arguments("<name>"));
 * 
 * console.log(generateHelp(cmd));
 * ```
 */
export function generateHelp(command: Command): string {
  const lines: string[] = [];
  
  lines.push(`Usage: ${command.getName()} [options] [command]`);
  lines.push("");
  lines.push(command.getDescription() || "");
  
  const allCommands = collectAllCommands(command);
  
  if (allCommands.length > 0) {
    lines.push("");
    lines.push("Commands:");
    const cmdRows: string[][] = [];
  
    for (const { cmd, fullName, indent } of allCommands) {
      const args = cmd.getArguments()
        .map((arg: Argument & { optional?: boolean }) => arg.optional ? `[${arg.name}]` : `<${arg.name}>`)
        .join(" ");
    
      cmdRows.push([`${"  ".repeat(1 + indent / 2)}${fullName} ${args}`, cmd.getDescription()]);
    
      const arguments_ = cmd.getArguments();
      for (const arg of arguments_) {
        const argOptional = (arg as Argument & { optional?: boolean }).optional;
        const argStr = argOptional ? `[${arg.name}]` : `<${arg.name}>`;
        const description = arg.description ? ` ${arg.description}` : "";
        const requiredText = argOptional ? "(Optional)" : "(Required)";
        cmdRows.push([`${"  ".repeat(2 + indent / 2)}${argStr}`, requiredText + (description || "")]);
      }

      const opts = cmd.getOptions();
      for (const opt of opts) {
        const optWithFlags = opt as Option & { flags: string[] };
        const flags = optWithFlags.flags.join(", ");
        const desc = opt.description || "";
        cmdRows.push([`${"  ".repeat(2 + indent / 2)}${flags}`, desc]);
      }
      
      cmdRows.push(["", ""]);
    }
    cmdRows.pop();
    lines.push(Table.from(cmdRows).padding(1).toString());
  }
  
  return lines.join("\n");
}

/**
 * A helper function that returns the generateHelp function bound to the command.
 * This is designed to be used with Cliffy's .help() method.
 * 
 * @returns A function that generates help text for the bound command
 * 
 * @example
 * ```typescript
 * import { Command } from "@cliffy/command";
 * import { flatHelp } from "cliffy-flat-help";
 * 
 * const cmd = new Command()
 *   .name("my-cli")
 *   .description("My CLI tool")
 *   .help(flatHelp())
 *   .command("init", new Command().description("Initialize"));
 * 
 * // Now --help will show the flat help with all subcommands
 * ```
 */
export function flatHelp(): (this: Command) => string {
  return function(this: Command): string {
    return generateHelp(this);
  };
}

export default generateHelp;
