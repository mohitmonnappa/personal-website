---
ShowToc: false
hiddenInList: true
title: "OverTheWire: Bandit - Level 16"
date: 2024-01-16
category: "Linux"
tags: ["CTF", "bandit", "overthewire", "walkthrough", "linux"]
prev:
  title: "Level 15"
  url: "/posts/overthewire/bandit/bandit15/"
next:
  title: "Level 17"
  url: "/posts/overthewire/bandit/bandit17/"
---

## Login

SSH: `ssh bandit16@bandit.labs.overthewire.org -p 2220`

Challenge URL: https://overthewire.org/wargames/bandit/bandit17.html


## Task

The credentials for the next level can be retrieved by submitting the password of the current level to a port on localhost in the range 31000 to 32000. First find out which of these ports have a server listening on them. Then find out which of those speak SSL/TLS and which do not. There is only 1 server that will give the next credentials, the others will simply send back to you whatever you send to it.

## Solution

Run `nmap` to see the services on the ports. Use the version argument and specify the port numbers:

```bash
nmap -sV -p 31000-32000
```
There are 2 ports that are running the SSL service. One of them returns whatever is sent to it and the other is the correct port (the one which we require).  
<br>

Port 31790 is the correct port. Now to connect to it, we could use `openssl s_client` like the previous level, but it didn't seem to work.  
<br>

Therefore, we can use `ncat` with the `--ssl` flag and connect to the port and submit the current level's password:
```bash
bandit16@bandit:~$ ncat --ssl localhost 31790
```
