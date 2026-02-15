# Flat help for Cliffy

A configuration for [Cliffy](cliffy.io/docs/latest) which generates the help text (ex. --help) with information about all subcommands, their arguments, their subcommands, etc. in one big help text block at the root.

This is particularly useful for AI agents, who can run --help at the root and instantly get the context on how to use the entire tool. This is **NOT** helpful for large CLIs that have large numbers of subcommands, as the help text in this case will be overwhelmingly large.


