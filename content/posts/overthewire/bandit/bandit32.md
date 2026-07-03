---
ShowToc: false
hiddenInList: true
title: "OverTheWire: Bandit - Level 32"
date: 2024-01-31
category: "Linux"
tags: ["CTF", "bandit", "overthewire", "walkthrough", "linux"]
prev:
  title: "Level 31"
  url: "/posts/overthewire/bandit/bandit31/"
next:
  title: "Level 33"
  url: "/posts/overthewire/bandit/bandit33/"
---

## Login

SSH: `ssh bandit32@bandit.labs.overthewire.org -p 2220`

Challenge URL: https://overthewire.org/wargames/bandit/bandit33.html


## Task

After all this git stuff, it is time for another escape. Good luck!

## Solution

In Linux, using `printenv` will give all the environment variables. Some common ones that are good to know:

| Variable | Description |
|----------|-------------|
| `TERM`   | Current terminal emulation |
| `HOME`   | Path to home directory of currently logged in user |
| `LANG`   | Current locale settings |
| `PATH`   | Directory list to be searched when executing commands |
| `PWD`    | Pathname of the current working directory |
| `SHELL` / `$0` | The path of the current user's shell **(most important!)** |
| `USER`   | Currently logged-in user |

Any command is converted to uppercase and executed, and there are no uppercase commands in Linux. Therefore, we need a way to start a normal terminal. `$0` is the shell path - run it:

```bash
$0
whoami
cat /etc/bandit_pass/bandit33
```

> Running `whoami` confirms it is actually logged in as `bandit33`.
