import { describe, it, expect } from 'vitest';
import { Command } from '@cliffy/command';
import { generateHelp, flatHelp } from './mod.js';

describe('generateHelp', () => {
  it('should generate help text', () => {
    const cmd = new Command()
      .name('test-cli')
      .description('Test CLI')
      .command('create', new Command()
        .description('Create a task')
        .arguments('<title>')
        .argument('[description]', 'Task description')
      )
      .command('list', new Command()
        .description('List tasks')
        .option('-s, --status <status>', 'Filter by status')
      );

    const helpText = generateHelp(cmd);

    const expected = `\x1b[1m\x1b[36mUsage:\x1b[0m \x1b[1m\x1b[33mtest-cli\x1b[0m [options] [command]

Test CLI

\x1b[1m\x1b[36mCommands:\x1b[0m
  \x1b[1m\x1b[33mcreate\x1b[0m \x1b[35m<title>\x1b[0m \x1b[90m[description]\x1b[0m\x1b[39m\x1b[22m Create a task              
    \x1b[35m<title>\x1b[0m\x1b[39m                    \x1b[31m(Required)\x1b[0m\x1b[39m                 
    \x1b[90m[description]\x1b[0m\x1b[39m              \x1b[90m(Optional)\x1b[0m Task description\x1b[39m
                                                          
  \x1b[1m\x1b[33mlist\x1b[0m \x1b[39m\x1b[22m                        List tasks                 
    \x1b[32m-s, --status\x1b[0m\x1b[39m               Filter by status           `;

    expect(helpText).toBe(expected);
  });

  it('should handle no subcommands', () => {
    const cmd = new Command()
      .name('simple-cli')
      .description('Simple CLI with no commands')
      .option('-v, --verbose', 'Enable verbose output');

    const helpText = generateHelp(cmd);

    const expected = `\x1b[1m\x1b[36mUsage:\x1b[0m \x1b[1m\x1b[33msimple-cli\x1b[0m [options] [command]

Simple CLI with no commands`;

    expect(helpText).toBe(expected);
  });

  it('should handle empty description', () => {
    const cmd = new Command()
      .name('no-desc')
      .command('test', new Command().description('Test command'));

    const helpText = generateHelp(cmd);

    const expected = `\x1b[1m\x1b[36mUsage:\x1b[0m \x1b[1m\x1b[33mno-desc\x1b[0m [options] [command]



\x1b[1m\x1b[36mCommands:\x1b[0m
  \x1b[1m\x1b[33mtest\x1b[0m \x1b[39m\x1b[22m Test command`;

    expect(helpText).toBe(expected);
  });

  it('should handle command with multiple arguments', () => {
    const cmd = new Command()
      .name('multi-arg')
      .description('CLI with multiple args')
      .command('copy', new Command()
        .description('Copy files')
        .arguments('<source>')
        .argument('<destination>', 'Destination path')
        .argument('[options]', 'Additional options')
      );

    const helpText = generateHelp(cmd);

    const expected = `\x1b[1m\x1b[36mUsage:\x1b[0m \x1b[1m\x1b[33mmulti-arg\x1b[0m [options] [command]

CLI with multiple args

\x1b[1m\x1b[36mCommands:\x1b[0m
  \x1b[1m\x1b[33mcopy\x1b[0m \x1b[35m<source>\x1b[0m \x1b[35m<destination>\x1b[0m \x1b[90m[options]\x1b[0m\x1b[39m\x1b[22m Copy files                   
    \x1b[35m<source>\x1b[0m\x1b[39m                            \x1b[31m(Required)\x1b[0m\x1b[39m                   
    \x1b[35m<destination>\x1b[0m\x1b[39m                       \x1b[31m(Required)\x1b[0m Destination path\x1b[39m  
    \x1b[90m[options]\x1b[0m\x1b[39m                           \x1b[90m(Optional)\x1b[0m Additional options\x1b[39m`;

    expect(helpText).toBe(expected);
  });

  it('should handle command with multiple options', () => {
    const cmd = new Command()
      .name('multi-opt')
      .description('CLI with multiple options')
      .command('run', new Command()
        .description('Run process')
        .option('-p, --port <port>', 'Port number')
        .option('-h, --host <host>', 'Host address')
        .option('-d, --debug', 'Enable debug mode')
      );

    const helpText = generateHelp(cmd);

    const expected = `\x1b[1m\x1b[36mUsage:\x1b[0m \x1b[1m\x1b[33mmulti-opt\x1b[0m [options] [command]

CLI with multiple options

\x1b[1m\x1b[36mCommands:\x1b[0m
  \x1b[1m\x1b[33mrun\x1b[0m \x1b[39m\x1b[22m          Run process      
    \x1b[32m-p, --port\x1b[0m\x1b[39m  Port number      
    \x1b[32m-h, --host\x1b[0m\x1b[39m  Host address     
    \x1b[32m-d, --debug\x1b[0m\x1b[39m Enable debug mode`;

    expect(helpText).toBe(expected);
  });

  it('should handle nested commands recursively', () => {
    const nestedCmd = new Command()
      .name('nested')
      .description('Nested command')
      .command('sub', new Command().description('Subcommand'));

    const cmd = new Command()
      .name('parent')
      .description('Parent CLI')
      .command('child', nestedCmd);

    const helpText = generateHelp(cmd);

    const expected = `\x1b[1m\x1b[36mUsage:\x1b[0m \x1b[1m\x1b[33mparent\x1b[0m [options] [command]

Parent CLI

\x1b[1m\x1b[36mCommands:\x1b[0m
  \x1b[1m\x1b[33mchild\x1b[0m \x1b[39m\x1b[22m   Nested command
                         
      \x1b[1m\x1b[33msub\x1b[0m \x1b[39m\x1b[22m Subcommand    `;

    expect(helpText).toBe(expected);
  });
});

describe('flatHelp', () => {
  it('should work when used with Cliffy\'s .help() method', () => {
    const cmd = new Command()
      .name('integration')
      .description('Integration test')
      .help(flatHelp())
      .command('sub', new Command().description('Subcommand'));

    const helpText = generateHelp(cmd);

    const expected = `\x1b[1m\x1b[36mUsage:\x1b[0m \x1b[1m\x1b[33mintegration\x1b[0m [options] [command]

Integration test

\x1b[1m\x1b[36mCommands:\x1b[0m
  \x1b[1m\x1b[33msub\x1b[0m \x1b[39m\x1b[22m Subcommand`;

    expect(helpText).toBe(expected);
  });
});
