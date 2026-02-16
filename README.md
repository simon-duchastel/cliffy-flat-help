# Cliffy Flat Help

> **Note:** This project is **unofficial and unaffiliated** with [Cliffy](cliffy.io/). It is a community project created independently.

A configuration for [Cliffy](cliffy.io/) which generates the help text (ex. --help) with information about all subcommands, their arguments, their subcommands, etc. in one big help text block at the root.

This is particularly useful for AI agents and automated tools that can run `--help` once and instantly get complete context on how to use the entire CLI. **Note:** This is **NOT** recommended for large CLIs with many subcommands, as the help text can become overwhelmingly large.

## Installation

```bash
npm install cliffy-flat-help
```

## Requirements

This package requires Cliffy as a peer dependency:

```bash
npm install @cliffy/command @cliffy/table
```

## Usage

### Quick Start with `flatHelp()`

The easiest way to use this package is with the `flatHelp()` helper function:

```typescript
import { Command } from "@cliffy/command";
import { flatHelp } from "cliffy-flat-help";

const cli = new Command()
  .name("my-cli")
  .description("My awesome CLI tool")
  .version("1.0.0")
  .help(flatHelp())
  .command("init", new Command()
    .description("Initialize a new project")
    .arguments("<project-name>")
    .option("-t, --template <template>", "Project template to use")
  )
  .command("build", new Command()
    .description("Build the project")
    .option("-w, --watch", "Watch for changes")
    .option("-o, --output <dir>", "Output directory")
  )
  .command("deploy", new Command()
    .description("Deploy to production")
    .arguments("[environment]")
    .option("-f, --force", "Force deployment")
  );

await cli.parse();
```

When you run `my-cli --help`, you'll see:

```
Usage: my-cli [options] [command]

My awesome CLI tool

Commands:
  init <project-name> Initialize a new project
    <project-name>    (Required)                 
    -t, --template   Project template to use    
                                                   
  build               Build the project          
    -w, --watch      Watch for changes          
    -o, --output     Output directory           
                                                   
  deploy [environment] Deploy to production      
    [environment]    (Optional)                 
    -f, --force      Force deployment           
```

### Using `generateHelp()` Directly

If you need more control, you can use the `generateHelp()` function directly:

```typescript
import { Command } from "@cliffy/command";
import { generateHelp } from "cliffy-flat-help";

const cli = new Command()
  .name("my-cli")
  .description("My CLI tool")
  .command("list", new Command()
    .description("List items")
    .option("-a, --all", "Show all items"));

// Generate help text programmatically
const helpText = generateHelp(cli);
console.log(helpText);

// Or use it with a custom help handler
cli.help(function() {
  // Custom logic here
  return generateHelp(this);
});
```

## API

### `generateHelp(command: CliffyCommand): string`

Generates a flat help text for a Cliffy command that includes all subcommands, their arguments, and options in one comprehensive view.

**Parameters:**
- `command`: A Cliffy Command instance

**Returns:** A formatted help string

### `flatHelp(): (this: CliffyCommand) => string`

Returns a helper function designed to be used with Cliffy's `.help()` method. When called, it generates the flat help text for the command it's bound to.

**Returns:** A function that can be passed to `.help()`

## Why Flat Help?

Traditional CLI help systems show only the current command's options and a list of subcommands. To understand what a subcommand does, you need to run `cli help subcommand` or `cli subcommand --help`.

**Flat help shows everything at once:**
- ✅ All subcommands
- ✅ All arguments for each subcommand
- ✅ All options for each subcommand
- ✅ Required vs optional indicators

This is ideal for:
- **AI Agents**: Can understand the full CLI capability from a single `--help` call
- **Documentation**: Generate complete CLI documentation automatically
- **Small CLIs**: When your tool has a manageable number of commands
- **Discoverability**: Users can see all available functionality immediately

## When NOT to Use Flat Help

Avoid using flat help when:
- Your CLI has dozens of subcommands
- Subcommands have many nested levels
- The help text would exceed a few screenfuls
- You want to encourage users to explore commands individually

## TypeScript

This package is written in TypeScript and includes type definitions. The main types are:

```typescript
interface CommandArgument {
  name: string;
  optional?: boolean;
  description?: string;
}

interface CommandOption {
  flags: string | string[];
  description?: string;
}

interface CliffyCommand {
  getName(): string;
  getDescription(): string;
  getCommands(): CliffyCommand[];
  getArguments(): CommandArgument[];
  getOptions(): CommandOption[];
}
```

## Examples

### Basic CLI

```typescript
import { Command } from "@cliffy/command";
import { flatHelp } from "cliffy-flat-help";

await new Command()
  .name("todo")
  .description("A simple todo CLI")
  .version("1.0.0")
  .help(flatHelp())
  .command("add", new Command()
    .description("Add a new todo")
    .arguments("<task>")
    .option("-p, --priority <level>", "Set priority (low, medium, high)"))
  .command("done", new Command()
    .description("Mark todo as complete")
    .arguments("<id>"))
  .command("list", new Command()
    .description("List all todos")
    .option("-a, --all", "Show completed todos too"))
  .parse();
```

### With Global Options

```typescript
import { Command } from "@cliffy/command";
import { flatHelp } from "cliffy-flat-help";

await new Command()
  .name("api-cli")
  .description("API client CLI")
  .version("1.0.0")
  .help(flatHelp())
  .globalOption("-k, --api-key <key>", "API authentication key")
  .globalOption("-v, --verbose", "Enable verbose output")
  .command("users", new Command()
    .description("User management")
    .command("list", new Command()
      .description("List users")
      .option("-l, --limit <n>", "Limit results")))
  .parse();
```

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Related

- [Cliffy](https://cliffy.io/) - The command-line framework this package extends
