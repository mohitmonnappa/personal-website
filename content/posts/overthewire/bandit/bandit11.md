---
ShowToc: false
hiddenInList: true
title: "OverTheWire: Bandit - Level 11"
date: 2024-01-11
category: "Linux"
tags: ["CTF", "bandit", "overthewire", "walkthrough", "linux"]
prev:
  title: "Level 10"
  url: "/posts/overthewire/bandit/bandit10/"
next:
  title: "Level 12"
  url: "/posts/overthewire/bandit/bandit12/"
---

## Login

SSH: `ssh bandit11@bandit.labs.overthewire.org -p 2220`

Challenge URL: https://overthewire.org/wargames/bandit/bandit12.html


## Task

The password for the next level is stored in the file data.txt, where all lowercase (a-z) and uppercase (A-Z) letters have been rotated by 13 positions.

## Solution
Let's see the files present:
```bash
bandit11@bandit:~$ ls
data.txt
bandit11@bandit:~$ wc -l data.txt
1 data.txt
bandit11@bandit:~$ cat data.txt
Gur cnffjbeq vf TEBbmJCB8DlA0zTewHxVQ0JPLxMvDkeA
```
To rotate the characters use the tool `tr`. To rotate by 13 positions:

```bash
cat data.txt | tr 'a-z' 'n-za-m' | tr 'A-Z' 'N-ZA-M'
```

The first argument takes the input string format, the second takes the output format - if `a` is rotated by 13 positions it becomes `n` and goes till `z`, then starts over from `a` to `m`. The second pipe is for uppercase characters.  
Both the cases can be combined in the same argument also, but it's difficult to understand.
<br>

One liner: `cat data.txt | tr 'a-zA-Z' 'n-za-mN-ZA-M'`