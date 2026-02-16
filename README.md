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

Use the `flatHelp()` helper function in the `help()` function of your top-level command.

## Example

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
