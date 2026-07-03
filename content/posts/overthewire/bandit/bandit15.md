---
ShowToc: false
hiddenInList: true
title: "OverTheWire: Bandit - Level 15"
date: 2024-01-15
category: "Linux"
tags: ["CTF", "bandit", "overthewire", "walkthrough", "linux"]
prev:
  title: "Level 14"
  url: "/posts/overthewire/bandit/bandit14/"
next:
  title: "Level 16"
  url: "/posts/overthewire/bandit/bandit16/"
---

## Login

SSH: `ssh bandit15@bandit.labs.overthewire.org -p 2220`

Challenge URL: https://overthewire.org/wargames/bandit/bandit16.html


## Task

The password for the next level can be retrieved by submitting the password of the current level to port 30001 on localhost using SSL/TLS encryption.

## Solution
OpenSSL is a library for secure communication over networks. It implements the Transport Layer Security (TLS) and Secure Sockets Layer (SSL) cryptographic protocols.  
<br>

`openssl s_client` is the implementation of a simple client that connects to a server using SSL/TLS.
Use `openssl` with `s_client` to connect to the server:

```bash
openssl s_client -host localhost -port 30001
```
Then enter the password of level 15 to get the password of level 16.