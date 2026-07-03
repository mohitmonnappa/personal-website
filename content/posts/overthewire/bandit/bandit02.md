---
ShowToc: false
hiddenInList: true
title: "OverTheWire: Bandit - Level 2"
date: 2024-01-02
category: "Linux"
tags: ["CTF", "bandit", "overthewire", "walkthrough", "linux"]
prev:
  title: "Level 1"
  url: "/posts/overthewire/bandit/bandit01/"
next:
  title: "Level 3"
  url: "/posts/overthewire/bandit/bandit03/"
---

## Login

SSH: `ssh bandit2@bandit.labs.overthewire.org -p 2220`

Challenge URL: https://overthewire.org/wargames/bandit/bandit3.html


## Task

The password for the next level is stored in a file called --spaces in this filename-- located in the home directory.

## Solution
Let's see the files present:
```bash
bandit2@bandit:~$ pwd
/home/bandit2
bandit2@bandit:~$ ls
--spaces in this filename--
```
If the filename had only spaces in between, enclosing it with quotes would be enough but there are dashes present in the beginning.  
<br>
Few ways to solve this:  
- We can append the current path in the beginning just like the previous level and escape the spaces using a backslash \  
So it should look something like this:

```bash
bandit2@bandit:~$ cat ./--spaces\ in\ this\ filename--
```

- We can also add 2 hyphens after the cat command, which means anything after that will be considered as part of the filename like this:
```bash
bandit2@bandit:~$ cat -- "--spaces in this filename--"
```
- We can use the redirection symbol (used in prev level) as well. Additionally, we have to enclose the filename in quotes or escape the spaces.
```bash
bandit2@bandit:~$ cat < --spaces\ in\ this\ filename--
# or
bandit2@bandit:~$ cat < "--spaces in this filename--"
```
<br>
One liner: `cat ./--spaces\ in\ the\ filename--`