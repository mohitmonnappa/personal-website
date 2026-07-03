---
ShowToc: false
hiddenInList: true
title: "OverTheWire: Bandit - Level 5"
date: 2024-01-05
category: "Linux"
tags: ["CTF", "bandit", "overthewire", "walkthrough", "linux"]
prev:
  title: "Level 4"
  url: "/posts/overthewire/bandit/bandit04/"
next:
  title: "Level 6"
  url: "/posts/overthewire/bandit/bandit06/"
---

## Login

SSH: `ssh bandit5@bandit.labs.overthewire.org -p 2220`

Challenge URL: https://overthewire.org/wargames/bandit/bandit6.html


## Task

The password for the next level is stored in a file somewhere under the inhere directory and has all of the following properties: human-readable, 1033 bytes in size, not executable.

## Solution
Let's see the files present:
```bash
bandit5@bandit:~$ ls
inhere
bandit5@bandit:~$ cd inhere/
bandit5@bandit:~/inhere$ ls
maybehere00  maybehere03  maybehere06  maybehere09  maybehere12  maybehere15  maybehere18
maybehere01  maybehere04  maybehere07  maybehere10  maybehere13  maybehere16  maybehere19
maybehere02  maybehere05  maybehere08  maybehere11  maybehere14  maybehere17
```


Find the entire directory with size parameter set to 1033 bytes.
```bash
bandit5@bandit:~$ find . -size 1033c
./inhere/maybehere07/.file2
```

(bytes is represented as `c`).

We found just one file that satisfies one of the condition. Then pipe it to `file` which checks for dashed file using `--` and then pipe it to `grep` for ASCII text.  
Just to verify the rest the command is:
```bash
bandit5@bandit:~$  find . -size 1033c ! -executable - exec file '{}' \; | grep "ASCII"
./inhere/maybehere07/.file2
```

One liner: `find . -size 1033c | xargs file -- * | grep "ASCII" | cut -d ":" -f1 | xargs cat`
