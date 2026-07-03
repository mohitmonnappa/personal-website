---
ShowToc: false
hiddenInList: true
title: "OverTheWire: Bandit - Level 22"
date: 2024-01-22
category: "Linux"
tags: ["CTF", "bandit", "overthewire", "walkthrough", "linux"]
prev:
  title: "Level 21"
  url: "/posts/overthewire/bandit/bandit21/"
next:
  title: "Level 23"
  url: "/posts/overthewire/bandit/bandit23/"
---

## Login

SSH: `ssh bandit22@bandit.labs.overthewire.org -p 2220`

Challenge URL: https://overthewire.org/wargames/bandit/bandit23.html


## Task

A program is running automatically at regular intervals from cron, the time-based job scheduler. Look in /etc/cron.d/ for the configuration and see what command is being executed.

## Solution

Print the shell script. Since this will run as `bandit23`, `whoami` will give `bandit23` - so to get the `mytarget` value, copy the command and replace `myname` with `bandit23` so it will hash it with `bandit23` as the user. Then `cat` the output in the `/tmp` folder:

```bash
echo I am user bandit23 | md5sum | cut -d ' ' -f 1
cat /tmp/output_of_above_command
```
