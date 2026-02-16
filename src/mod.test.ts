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

    const expected = `Usage: test-cli [options] [command]

Test CLI

Commands:
  create <title> [description] Create a task              
    <title>                    (Required)                 
    [description]              (Optional) Task description
                                                          
  list                         List tasks                 
    -s, --status               Filter by status           `;

    expect(helpText).toBe(expected);
  });

  it('should handle no subcommands', () => {
    const cmd = new Command()
      .name('simple-cli')
      .description('Simple CLI with no commands')
      .option('-v, --verbose', 'Enable verbose output');

    const helpText = generateHelp(cmd);

    const expected = `Usage: simple-cli [options] [command]

Simple CLI with no commands`;

    expect(helpText).toBe(expected);
  });

  it('should handle empty description', () => {
    const cmd = new Command()
      .name('no-desc')
      .command('test', new Command().description('Test command'));

    const helpText = generateHelp(cmd);

    const expected = `Usage: no-desc [options] [command]



Commands:
  test  Test command`;

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

    const expected = `Usage: multi-arg [options] [command]

CLI with multiple args

Commands:
  copy <source> <destination> [options] Copy files                   
    <source>                            (Required)                   
    <destination>                       (Required) Destination path  
    [options]                           (Optional) Additional options`;

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

    const expected = `Usage: multi-opt [options] [command]

CLI with multiple options

Commands:
  run           Run process      
    -p, --port  Port number      
    -h, --host  Host address     
    -d, --debug Enable debug mode`;

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

    const expected = `Usage: parent [options] [command]

Parent CLI

Commands:
  child        Nested command
                             
    child sub  Subcommand    `;

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

    const expected = `Usage: integration [options] [command]

Integration test

Commands:
  sub  Subcommand`;

    expect(helpText).toBe(expected);
  });
});
