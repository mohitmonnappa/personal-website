---
ShowToc: false
hiddenInList: true
title: "OverTheWire: Bandit - Level 10"
date: 2024-01-10
category: "Linux"
tags: ["CTF", "bandit", "overthewire", "walkthrough", "linux"]
prev:
  title: "Level 9"
  url: "/posts/overthewire/bandit/bandit09/"
next:
  title: "Level 11"
  url: "/posts/overthewire/bandit/bandit11/"
---

## Login

SSH: `ssh bandit10@bandit.labs.overthewire.org -p 2220`

Challenge URL: https://overthewire.org/wargames/bandit/bandit11.html


## Task

The password for the next level is stored in the file data.txt, which contains base64 encoded data.

## Solution
Let's see the files present:
```bash
bandit10@bandit:~$ ls
data.txt
bandit10@bandit:~$ file data.txt
data.txt: ASCII text
bandit10@bandit:~$ wc -l data.txt
1 data.txt
bandit10@bandit:~$ cat data.txt
VGhlIHBhc3N3b3JkIGlzIHBZZk9ZNkh3VXNEajVyTDlVdnloVTdNQ212OHZONVJvCg==
```
Use `base64 -d` to decode the base64 string.
<br>

One liner: `cat data.txt | base64 -d`
