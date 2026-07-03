---
ShowToc: false
hiddenInList: true
title: "OverTheWire: Bandit - Level 27"
date: 2024-01-26
category: "Linux"
tags: ["CTF", "bandit", "overthewire", "walkthrough", "linux"]
prev:
  title: "Level 25"
  url: "/posts/overthewire/bandit/bandit25/"
next:
  title: "Level 28"
  url: "/posts/overthewire/bandit/bandit28/"
---

## Login

SSH: `ssh bandit27@bandit.labs.overthewire.org -p 2220`

Challenge URL: https://overthewire.org/wargames/bandit/bandit28.html


## Task

There is a git repository at ssh://bandit27-git@localhost/home/bandit27-git/repo via the port 2220. The password for the user bandit27-git is the same as for the user bandit27. Clone the repository and find the password for the next level.

## Solution

Create a temp directory and clone the repo. Include port number `2220` after `localhost`. The password is the same as this level's password. Go into the folder and `cat` the README.
