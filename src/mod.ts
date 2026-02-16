import { Table } from "@cliffy/table";
import { colors } from "@cliffy/ansi/colors";
import type { Command, Argument, Option } from "@cliffy/command";

/**
 * Configuration options for flatHelp.
 */
export interface FlatHelpConfig {
  /**
   * Whether to use colors in the help output.
   * Defaults to true.
   */
  colors?: boolean;
}

/**
 * Recursively collects all commands with their depth level.
 * Each command is shown with its name only (not full path), at the appropriate indentation.
 */
function collectAllCommands(
  command: Command,
  depth: number = 0,
  result: Array<{ cmd: Command; depth: number }> = []
): Array<{ cmd: Command; depth: number }> {
  const commands = command.getCommands();

  for (const cmd of commands) {
    result.push({ cmd, depth });
    collectAllCommands(cmd, depth + 1, result);
  }

  return result;
}

/**
 * Helper to conditionally apply colors based on config.
 */
function withColors(enabled: boolean) {
  if (enabled) {
    return colors;
  }
  // Return identity functions when colors are disabled
  const identity = (str: string) => str;
  return {
    bold: Object.assign(identity, {
      cyan: identity,
      yellow: identity,
    }),
    cyan: identity,
    yellow: identity,
    magenta: identity,
    gray: identity,
    red: identity,
    green: identity,
  };
}

/**
 * Generates a flat help text for a Cliffy command that includes all subcommands,
 * their arguments, and options in one comprehensive view.
 * 
 * This is particularly useful for AI agents and tools that need to understand
 * the complete CLI structure from a single --help call.
 * 
 * @param command - The Cliffy command to generate help for
 * @param config - Configuration options for the help output
 * @returns A formatted help string
 */
export function generateHelp(command: Command, config?: FlatHelpConfig): string {
  const useColors = config?.colors ?? true;
  const c = withColors(useColors);
  
  const lines: string[] = [];
  
  lines.push(`${c.bold.cyan("Usage:")} ${c.bold.yellow(command.getName())} [options] [command]`);
  lines.push("");
  lines.push(command.getDescription() || "");
  
  const allCommands = collectAllCommands(command);
  
  if (allCommands.length > 0) {
    lines.push("");
    lines.push(c.bold.cyan("Commands:"));
    const cmdRows: string[][] = [];
  
    for (const { cmd, depth } of allCommands) {
      const name = cmd.getName();
      const args = cmd.getArguments()
        .map((arg: Argument & { optional?: boolean }) => {
          if (arg.optional) {
            return c.gray(`[${arg.name}]`);
          } else {
            return c.magenta(`<${arg.name}>`);
          }
        })
        .join(" ");

      const indent = depth * 2;
      const cmdNameColored = c.bold.yellow(name);
      cmdRows.push([`${"  ".repeat(1 + indent)}${cmdNameColored} ${args}`, cmd.getDescription()]);

      const arguments_ = cmd.getArguments();
      for (const arg of arguments_) {
        const argOptional = (arg as Argument & { optional?: boolean }).optional;
        const argStr = argOptional 
          ? c.gray(`[${arg.name}]`) 
          : c.magenta(`<${arg.name}>`);
        const description = arg.description ? ` ${arg.description}` : "";
        const requiredText = argOptional 
          ? c.gray("(Optional)") 
          : c.red("(Required)");
        cmdRows.push([`${"  ".repeat(2 + indent)}${argStr}`, requiredText + (description || "")]);
      }

      const opts = cmd.getOptions();
      for (const opt of opts) {
        const optWithFlags = opt as Option & { flags: string[] };
        const flags = c.green(optWithFlags.flags.join(", "));
        const desc = opt.description || "";
        cmdRows.push([`${"  ".repeat(2 + indent)}${flags}`, desc]);
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
 * @param config - Configuration options for the help output. Defaults to `{ colors: true }`.
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
 * 
 * // Disable colors:
 * const cmdNoColors = new Command()
 *   .name("my-cli")
 *   .description("My CLI tool")
 *   .help(flatHelp({ colors: false }))
 *   .command("init", new Command().description("Initialize"));
 * ```
 */
export function flatHelp(config?: FlatHelpConfig): (this: Command) => string {
  return function(this: Command): string {
    return generateHelp(this, config);
  };
}

export default generateHelp;
