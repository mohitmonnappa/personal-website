---
ShowToc: false
hiddenInList: true
title: "OverTheWire: Bandit - Level 31"
date: 2024-01-30
category: "Linux"
tags: ["CTF", "bandit", "overthewire", "walkthrough", "linux"]
prev:
  title: "Level 30"
  url: "/posts/overthewire/bandit/bandit30/"
next:
  title: "Level 32"
  url: "/posts/overthewire/bandit/bandit32/"
---

## Login

SSH: `ssh bandit31@bandit.labs.overthewire.org -p 2220`

Challenge URL: https://overthewire.org/wargames/bandit/bandit32.html


## Task

There is a git repository at ssh://bandit31-git@localhost/home/bandit31-git/repo via the port 2220. The password for the user bandit31-git is the same as for the user bandit31. Clone the repository and find the password for the next level.

## Solution

Read the `README.md` - it says we have to push a file named `key.txt` with the text `May I come in?`. But the `.gitignore` file ignores `.txt` files, so delete the `.gitignore` file and add the text to `key.txt`, then push it to the master branch to get the password:

```bash
rm .gitignore
cat > key.txt
# May I come in?
# ^C
git add .
git push origin master
```
