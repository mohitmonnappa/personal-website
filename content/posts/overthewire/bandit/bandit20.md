---
ShowToc: false
hiddenInList: true
title: "OverTheWire: Bandit - Level 20"
date: 2024-01-20
category: "Linux"
tags: ["CTF", "bandit", "overthewire", "walkthrough", "linux"]
prev:
  title: "Level 19"
  url: "/posts/overthewire/bandit/bandit19/"
next:
  title: "Level 21"
  url: "/posts/overthewire/bandit/bandit21/"
---

## Login

SSH: `ssh bandit20@bandit.labs.overthewire.org -p 2220`

Challenge URL: https://overthewire.org/wargames/bandit/bandit21.html


## Task

There is a setuid binary in the home directory that makes a connection to localhost on the port you specify as a command line argument. It then reads a line of text from the connection and compares it to the password in the previous level (bandit20). If the password is correct, it will transmit the password for the next level (bandit21).

## Solution
Files present:
```bash
bandit20@bandit:~$ ls
suconnect
```
The setuid binary makes a connection to `localhost` on the port you specify as a command-line argument. It then reads a line of text from the connection and compares it to the password in the previous level (bandit20). If the password is correct, it will transmit the password for the next level (bandit21).

To achieve this, set up a netcat listener to get back the password. Start a netcat server in the background using `&` (ampersand):

```bash
echo "4pIjcunZ0fK2vmp3IwfG8Vf7VhxD6pOA" | nc -l -p 5555 &
./suconnect 5555
```

> We need to start `nc` in server mode so `-l` and `-p` will be separate flags.
