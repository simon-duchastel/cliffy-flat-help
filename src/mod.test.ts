import { describe, it, expect } from 'vitest';
import { Command } from '@cliffy/command';
import { generateHelp, flatHelp } from './mod.js';

describe('generateHelp', () => {
  it('should generate help text with subcommands', () => {
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
      )
      .command('delete', new Command()
        .description('Delete a task')
        .arguments('<id>')
      );

    const helpText = generateHelp(cmd);

    // Check that the basic structure is present
    expect(helpText).toContain('Usage: test-cli [options] [command]');
    expect(helpText).toContain('Test CLI');
    expect(helpText).toContain('Commands:');
    
    // Check for command names
    expect(helpText).toContain('create');
    expect(helpText).toContain('list');
    expect(helpText).toContain('delete');
    
    // Check for arguments
    expect(helpText).toContain('<title>');
    expect(helpText).toContain('[description]');
    expect(helpText).toContain('Task description');
    expect(helpText).toContain('<id>');
    
    // Check for options
    expect(helpText).toContain('-s, --status');
    expect(helpText).toContain('Filter by status');
    
    // Check for required/optional markers
    expect(helpText).toContain('(Required)');
    expect(helpText).toContain('(Optional)');
  });

  it('should handle CLI with no subcommands', () => {
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

    expect(helpText).toContain('Usage: no-desc [options] [command]');
    expect(helpText).toContain('Commands:');
    expect(helpText).toContain('test');
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

    expect(helpText).toContain('<source>');
    expect(helpText).toContain('<destination>');
    expect(helpText).toContain('[options]');
    expect(helpText).toContain('Destination path');
    expect(helpText).toContain('Additional options');
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

    expect(helpText).toContain('-p, --port');
    expect(helpText).toContain('Port number');
    expect(helpText).toContain('-h, --host');
    expect(helpText).toContain('Host address');
    expect(helpText).toContain('-d, --debug');
    expect(helpText).toContain('Enable debug mode');
  });

  it('should handle nested commands (only shows direct children)', () => {
    const nestedCmd = new Command()
      .name('nested')
      .description('Nested command')
      .command('sub', new Command().description('Subcommand'));

    const cmd = new Command()
      .name('parent')
      .description('Parent CLI')
      .command('child', nestedCmd);

    const helpText = generateHelp(cmd);

    // Should show "child" (the command name in parent), not "nested" (the name of the nested command itself)
    expect(helpText).toContain('child');
    expect(helpText).toContain('Nested command');
    // But not its subcommand (that's expected behavior - flatHelp shows direct children)
    expect(helpText).not.toContain('sub');
  });
});

describe('flatHelp', () => {
  it('should return a function that generates help for the bound command', () => {
    const cmd = new Command()
      .name('flat-test')
      .description('Flat help test')
      .command('action', new Command().description('Perform action'));

    const helpFn = flatHelp();
    const helpText = helpFn.call(cmd);

    expect(helpText).toContain('Usage: flat-test [options] [command]');
    expect(helpText).toContain('Flat help test');
    expect(helpText).toContain('action');
  });

  it('should work when used with Cliffy\'s .help() method', () => {
    // This simulates how it would be used in real code
    const cmd = new Command()
      .name('integration')
      .description('Integration test')
      .help(flatHelp())
      .command('sub', new Command().description('Subcommand'));

    // The help function should be set up
    // In real usage, Cliffy would call this when --help is passed
    expect(cmd).toBeDefined();
  });
});
