---
ShowToc: false
hiddenInList: true
title: "OverTheWire: Bandit - Level 4"
date: 2024-01-04
category: "Linux"
tags: ["CTF", "bandit", "overthewire", "walkthrough", "linux"]
prev:
  title: "Level 3"
  url: "/posts/overthewire/bandit/bandit03/"
next:
  title: "Level 5"
  url: "/posts/overthewire/bandit/bandit05/"
---

## Login

SSH: `ssh bandit4@bandit.labs.overthewire.org -p 2220`

Challenge URL: https://overthewire.org/wargames/bandit/bandit5.html


## Task

The password for the next level is stored in the only human-readable file in the inhere directory.

## Solution
Let's see the files present:
```bash
bandit4@bandit:~$ ls
inhere
bandit4@bandit:~$ cd inhere
bandit4@bandit:~/inhere$ ls
-file00  -file01  -file02  -file03  -file04  -file05  -file06  -file07  -file08  -file09
```

**Basic:** `cat` the entire directory because only one file is human readable.

To find which file has ASCII text in the entire directory: find all files and pipe it to `file`.  
We have to use `xargs` before `file`. This will give the info about the files.  
<br>
Another way is to use the wildcard character (*) like this: `file ./*` inside /inhere directory.

```bash
bandit4@bandit:~/inhere$ file ./*
# or
bandit4@bandit:~/inhere$ find . | xargs file
.:         directory
./-file06: Non-ISO extended-ASCII text, with NEL line terminators
./-file09: data
./-file01: data
./-file08: data
./-file00: data
./-file03: data
./-file07: ASCII text
./-file02: OpenPGP Secret Key
./-file05: data
./-file04: data
```

Then we can pipe it to `grep "ASCII"` to filter out human readable files.
```bash
bandit4@bandit:~/inhere$ file ./* | grep "ASCII text"
./-file06: Non-ISO extended-ASCII text, with NEL line terminators
./-file07: ASCII text
# use grep ": ASCII" to get only ASCII text files.
bandit4@bandit:~$ file ./inhere/* | grep ": ASCII text"
./inhere/-file07: ASCII text
```
The file `-file07` is our file.

To extract the filename which satisfies the pattern, use `cut` with delimiter `-d ":"` and get the first column using `-f1`. Finally, print the contents of the file:
```bash
bandit4@bandit:~$ file ./inhere/* | grep ": ASCII" | cut -d ":" -f1
./inhere/-file07
bandit4@bandit:~$ file ./inhere/* | grep ": ASCII" | cut -d ":" -f1 | xargs cat
```

<br>

One liner: `file ./inhere/* | grep ": ASCII" | cut -d ":" -f1 | xargs cat` <br> This extracts the file that satisfies the patter and prints the contents of the file. 