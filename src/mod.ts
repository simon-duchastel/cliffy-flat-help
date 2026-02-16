import { Table } from "@cliffy/table";

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
export function generateHelp(command: any): string {
  const lines: string[] = [];
  
  lines.push(`Usage: ${command.getName()} [options] [command]`);
  lines.push("");
  lines.push(command.getDescription() || "");
  
  const allCommands = command.getCommands();
  if (allCommands.length > 0) {
    lines.push("");
    lines.push("Commands:");
    const cmdRows: string[][] = [];
  
    for (const cmd of allCommands) {
      const name = cmd.getName();
      const args = cmd.getArguments()
        .map((arg: any) => arg.optional ? `[${arg.name}]` : `<${arg.name}>`)
        .join(" ");
    
      cmdRows.push([`  ${name} ${args}`, cmd.getDescription()]);
    
      const arguments_ = cmd.getArguments();
      for (const arg of arguments_) {
        const argStr = arg.optional ? `[${arg.name}]` : `<${arg.name}>`;
        const description = arg.description ? ` ${arg.description}` : "";
        const requiredText = arg.optional ? "(Optional)" : "(Required)";
        cmdRows.push([`    ${argStr}`, requiredText + (description || "")]);
      }

      const opts = cmd.getOptions();
      for (const opt of opts) {
        const flags = Array.isArray(opt.flags) ? opt.flags.join(", ") : (opt.flags || "");
        const desc = opt.description || "";
        cmdRows.push([`    ${flags}`, desc]);
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
export function flatHelp(): (this: any) => string {
  return function(this: any): string {
    return generateHelp(this);
  };
}

export default generateHelp;
