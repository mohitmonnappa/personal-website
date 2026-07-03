---
ShowToc: false
hiddenInList: true
title: "OverTheWire: Bandit - Level 25 & 26"
date: 2024-01-25
category: "Linux"
tags: ["CTF", "bandit", "overthewire", "walkthrough", "linux"]
prev:
  title: "Level 24"
  url: "/posts/overthewire/bandit/bandit24/"
next:
  title: "Level 27"
  url: "/posts/overthewire/bandit/bandit27/"
---

## Login

SSH: `ssh bandit25@bandit.labs.overthewire.org -p 2220`

Challenge URL: https://overthewire.org/wargames/bandit/bandit26.html


## Task

Logging in to bandit26 from bandit25 should be fairly easy. The shell for user bandit26 is not /bin/bash, but something else. Find out what it is, how it works and how to break out of it.

## Solution

This is a little tricky. First, print out the shell that `bandit26` is using:

```bash
cat /etc/passwd | grep bandit26
```

It says `/usr/bin/showtext`. Cat that file:

```bash
cat /usr/bin/showtext
```

It uses the `more` command. Use SSH to log in to `bandit26` with the SSH private key. **Resize the window before running** so that the `more` command triggers. Then:

1. Type `v` to open `vim`
2. Once vim is opened, you can resize the window
3. Set the shell: `:set shell=/bin/bash`
4. Open the shell: `:shell`

Now print the password of bandit26:

```bash
cat /etc/bandit_pass/bandit26
```

We also see a setuid binary - use it to get the password of bandit27:

```bash
cat /etc/bandit_pass/bandit27
```
