---
ShowToc: false
hiddenInList: true
title: "OverTheWire: Bandit - Level 17"
date: 2024-01-17
category: "Linux"
tags: ["CTF", "bandit", "overthewire", "walkthrough", "linux"]
prev:
  title: "Level 16"
  url: "/posts/overthewire/bandit/bandit16/"
next:
  title: "Level 18"
  url: "/posts/overthewire/bandit/bandit18/"
---

## Login

SSH: `ssh bandit17@bandit.labs.overthewire.org -p 2220`

Challenge URL: https://overthewire.org/wargames/bandit/bandit18.html


## Task

There are 2 files in the home directory: passwords.old and passwords.new. The password for the next level is in passwords.new and is the only line that has been changed between passwords.old and passwords.new.

## Solution
We got the RSA private key from the previous level, so we can use it with the `-i` flag in SSH command.
<br>

**Note**: Don't forget to make a note of this level's password at `/etc/bandit_pass/bandit17`.
<br>

These are the files present:
```bash
bandit17@bandit:~$ ls
passwords.new  passwords.old
```
We can use `diff` to compare lines of two files:

```bash
diff --suppress-common-lines -i -y passwords.old passwords.new
```
> `-i` is to ignore cases and `-y` is to display side by side.
<br>

One liner: `diff --suppress-common-lines -i -y passwords.new passwords.old | awk {'print $1'}`