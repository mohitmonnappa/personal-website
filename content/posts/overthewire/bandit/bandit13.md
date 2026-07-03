---
ShowToc: false
hiddenInList: true
title: "OverTheWire: Bandit - Level 13"
date: 2024-01-13
category: "Linux"
tags: ["CTF", "bandit", "overthewire", "walkthrough", "linux"]
prev:
  title: "Level 12"
  url: "/posts/overthewire/bandit/bandit12/"
next:
  title: "Level 14"
  url: "/posts/overthewire/bandit/bandit14/"
---

## Login

SSH: `ssh bandit13@bandit.labs.overthewire.org -p 2220`

Challenge URL: https://overthewire.org/wargames/bandit/bandit14.html


## Task
The password for the next level is stored in /etc/bandit_pass/bandit14 and can only be read by user bandit14. For this level, you do not get the next password, but you get a private SSH key that can be used to log into the next level.

## Solution
Let's see the files present:
```bash
bandit13@bandit:~$ ls
HINT  sshkey.private
```
The private key is present in the home directory. Copy the file to your system and change its permissions to 700 using `chmod`.  
Use it to login as `bandit14` using the `-i` flag which is used to specify the private key:
```bash
chmod 700 sshkey.private
ssh -p 2220 bandit14@localhost -i sshkey.private
```
Then get the password of bandit14:
```bash
cat /etc/bandit_pass/bandit14
```
> **Note:** The permissions of the private key file should be `700`.
