---
ShowToc: false
hiddenInList: true
title: "OverTheWire: Bandit - Level 12"
date: 2024-01-12
category: "Linux"
tags: ["CTF", "bandit", "overthewire", "walkthrough", "linux"]
prev:
  title: "Level 11"
  url: "/posts/overthewire/bandit/bandit11/"
next:
  title: "Level 13"
  url: "/posts/overthewire/bandit/bandit13/"
---

## Login

SSH: `ssh bandit12@bandit.labs.overthewire.org -p 2220`

Challenge URL: https://overthewire.org/wargames/bandit/bandit13.html


## Task

The password for the next level is stored in the file data.txt, which is a hexdump of a file that has been repeatedly compressed.

## Solution
Let's see the files present:
```bash
bandit12@bandit:~$ ls
data.txt
```
We have the hexdump in ASCII. Use `mktemp -d` and do all the changes in the tmp folder, since changes in the `/home` and `/tmp` folder aren't allowed.

To reverse the hexdump:

```bash
xxd -r filename.txt newfile
```

Use the `file` command to get the file signature, then use `mv` to rename to that extension.

| Extension | Format |
|-----------|--------|
| `.gz`     | gzip   |
| `.tar`    | tar    |
| `.bz2`    | bzip2  |

**To uncompress:**

```bash
# gzip
gunzip filename

# tar
tar -xf archivename

# bzip2
bzip2 filename
```
<br>

> **Extra:** Try to create a shell script for this.