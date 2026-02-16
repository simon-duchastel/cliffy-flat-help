import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Command } from '@cliffy/command';
import { colors } from '@cliffy/ansi/colors';
import { generateHelp, flatHelp } from './mod.js';

describe('generateHelp', () => {
  // Disable colors by default for simpler test assertions
  beforeEach(() => {
    colors.setColorEnabled(false);
  });

  afterEach(() => {
    colors.setColorEnabled(true);
  });

  it('should generate help text with colors', () => {
    // Re-enable colors for this test
    colors.setColorEnabled(true);
    
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

    const expected = `\x1b[36m\x1b[1mUsage:\x1b[22m\x1b[39m \x1b[33m\x1b[1mtest-cli\x1b[22m\x1b[39m [options] [command]

Test CLI

\x1b[36m\x1b[1mCommands:\x1b[22m\x1b[39m
  \x1b[33m\x1b[1mcreate\x1b[22m\x1b[39m \x1b[35m<title>\x1b[39m \x1b[90m[description]\x1b[39m Create a task              
    \x1b[35m<title>\x1b[39m                    \x1b[31m(Required)\x1b[39m                 
    \x1b[90m[description]\x1b[39m              \x1b[90m(Optional)\x1b[39m Task description
                                                          
  \x1b[33m\x1b[1mlist\x1b[22m\x1b[39m                         List tasks                 
    \x1b[32m-s, --status\x1b[39m               Filter by status           `;

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
  child    Nested command
                         
      sub  Subcommand    `;

    expect(helpText).toBe(expected);
  });
});

describe('flatHelp', () => {
  beforeEach(() => {
    colors.setColorEnabled(false);
  });

  afterEach(() => {
    colors.setColorEnabled(true);
  });

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

  it('should disable colors when colors config is false', () => {
    colors.setColorEnabled(true);
    
    const cmd = new Command()
      .name('test-cli')
      .description('Test CLI')
      .command('sub', new Command().description('Subcommand'));

    const helpText = generateHelp(cmd, { colors: false });

    // Should not contain ANSI color codes
    expect(helpText).not.toContain('\x1b[');
    expect(helpText).toContain('Usage: test-cli [options] [command]');
    expect(helpText).toContain('Commands:');
  });

  it('should enable colors by default when no config is provided', () => {
    colors.setColorEnabled(true);
    
    const cmd = new Command()
      .name('test-cli')
      .description('Test CLI')
      .command('sub', new Command().description('Subcommand'));

    const helpText = generateHelp(cmd);

    // Should contain ANSI color codes
    expect(helpText).toContain('\x1b[');
  });

  it('should enable colors when colors config is true', () => {
    colors.setColorEnabled(true);
    
    const cmd = new Command()
      .name('test-cli')
      .description('Test CLI')
      .command('sub', new Command().description('Subcommand'));

    const helpText = generateHelp(cmd, { colors: true });

    // Should contain ANSI color codes
    expect(helpText).toContain('\x1b[');
  });

  it('should pass config through flatHelp helper', () => {
    colors.setColorEnabled(true);
    
    const cmd = new Command()
      .name('integration')
      .description('Integration test')
      .help(flatHelp({ colors: false }))
      .command('sub', new Command().description('Subcommand'));

    // Call the help handler directly
    const helpHandler = cmd.getHelpHandler();
    const helpText = helpHandler.call(cmd);

    // Should not contain ANSI color codes
    expect(helpText).not.toContain('\x1b[');
    expect(helpText).toContain('Usage: integration [options] [command]');
  });
});
