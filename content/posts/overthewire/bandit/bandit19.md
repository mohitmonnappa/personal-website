---
ShowToc: false
hiddenInList: true
title: "OverTheWire: Bandit - Level 19"
date: 2024-01-19
category: "Linux"
tags: ["CTF", "bandit", "overthewire", "walkthrough", "linux"]
prev:
  title: "Level 18"
  url: "/posts/overthewire/bandit/bandit18/"
next:
  title: "Level 20"
  url: "/posts/overthewire/bandit/bandit20/"
---

## Login

SSH: `ssh bandit19@bandit.labs.overthewire.org -p 2220`

Challenge URL: https://overthewire.org/wargames/bandit/bandit20.html


## Task

To gain access to the next level, you should use the setuid binary in the home directory. Execute it without arguments to find out how to use it. The password for this level can be found in the usual place (/etc/bandit_pass), after you have used the setuid binary.

## Solution
The files present are:
```bash
bandit19@bandit:~$ ls
bandit20-do
bandit19@bandit:~$ ls bandit20-do -l
-rwsr-x--- 1 bandit20 bandit19 14880 Jun 24 14:58 bandit20-do
```
The setuid binary is set to `bandit20`'s user. Check the file type of the given file - it says it is an executable, so try running it. The `euid` is set to `bandit20`, which means this gives the current user the privileges of the creator of the file. So just `cat` bandit20's password:
<br>

One liner: `./bandit20-do cat /etc/bandit_pass/bandit20`
