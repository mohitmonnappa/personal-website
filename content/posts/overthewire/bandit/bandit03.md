---
ShowToc: false
hiddenInList: true
title: "OverTheWire: Bandit - Level 3"
date: 2024-01-03
category: "Linux"
tags: ["CTF", "bandit", "overthewire", "walkthrough", "linux"]
prev:
  title: "Level 2"
  url: "/posts/overthewire/bandit/bandit02/"
next:
  title: "Level 4"
  url: "/posts/overthewire/bandit/bandit04/"
---

## Login

SSH: `ssh bandit3@bandit.labs.overthewire.org -p 2220`

Challenge URL: https://overthewire.org/wargames/bandit/bandit4.html


## Task

The password for the next level is stored in a hidden file in the inhere directory.

## Solution
Let's see the files present:
```bash
bandit3@bandit:~$ ls
inhere
bandit3@bandit:~$ cd inhere
bandit3@bandit:~/inhere$ ls
bandit3@bandit:~/inhere$
```
It seems the directory is empty. Hidden files and directories have a **.** (period) in front of them.  

Use `ls -a` to show all files including hidden ones. Add the -l flag so that a neat list is displayed.
```bash
bandit3@bandit:~/inhere$ la
...Hiding-From-You
bandit3@bandit:~/inhere$ ls -la
total 12
drwxr-xr-x 2 root    root    4096 Jun 24 14:59 .
drwxr-xr-x 3 root    root    4096 Jun 24 14:59 ..
-rw-r----- 1 bandit4 bandit3   33 Jun 24 14:59 ...Hiding-From-You

bandit3@bandit:~/inhere$ cat ...Hiding-From-You
```
<br>

One Liner: `cat ./inhere/...Hiding-From-You`