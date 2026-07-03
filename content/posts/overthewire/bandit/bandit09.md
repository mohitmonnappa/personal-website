---
ShowToc: false
hiddenInList: true
title: "OverTheWire: Bandit - Level 9"
date: 2024-01-09
category: "Linux"
tags: ["CTF", "bandit", "overthewire", "walkthrough", "linux"]
prev:
  title: "Level 8"
  url: "/posts/overthewire/bandit/bandit08/"
next:
  title: "Level 10"
  url: "/posts/overthewire/bandit/bandit10/"
---

## Login

SSH: `ssh bandit9@bandit.labs.overthewire.org -p 2220`

Challenge URL: https://overthewire.org/wargames/bandit/bandit10.html


## Task

The password for the next level is stored in the file data.txt in one of the few human-readable strings, preceded by several = characters.

## Solution
Let'see the files present:
```bash
bandit9@bandit:~$ ls
data.txt
```
`file` command can be used to verify the type of file.
```bash
bandit9@bandit:~$ file data.txt
data.txt: data
```
Use `strings` to print human readable content from a file and pass it to `grep` with `"=="` (mentioned in the task):

```bash
strings data.txt | grep "=="
```
<br>

One liner: `strings data.txt | grep "=="`