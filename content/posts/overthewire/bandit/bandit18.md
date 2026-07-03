---
ShowToc: false
hiddenInList: true
title: "OverTheWire: Bandit - Level 18"
date: 2024-01-18
category: "Linux"
tags: ["CTF", "bandit", "overthewire", "walkthrough", "linux"]
prev:
  title: "Level 17"
  url: "/posts/overthewire/bandit/bandit17/"
next:
  title: "Level 19"
  url: "/posts/overthewire/bandit/bandit19/"
---

## Login

SSH: `ssh bandit18@bandit.labs.overthewire.org -p 2220`

Challenge URL: https://overthewire.org/wargames/bandit/bandit19.html


## Task

The password for the next level is stored in a file readme in the home directory. Unfortunately, someone has modified .bashrc to log you out when you log in with SSH.

## Solution

After logging in, the `.bashrc` file automatically logs you out instantly - so pass the command in quotes after the SSH query to execute commands before it logs you out.  
First send `ls` and we see `readme` file is present, so just `cat` the readme file.
```bash
bob@laptop:~/documents$ ssh bandit.labs.overthewire.org -p 2220 -l bandit18 "ls";

-- SNIP

bandit18@bandit.labs.overthewire.org's password:
readme
```
<br>

One liner: `ssh bandit.labs.overthewire.org -p 2220 -l bandit18 "cat readme";`
