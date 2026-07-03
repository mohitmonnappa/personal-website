---
ShowToc: false
hiddenInList: true
title: "OverTheWire: Bandit - Level 6"
date: 2024-01-06
category: "Linux"
tags: ["CTF", "bandit", "overthewire", "walkthrough", "linux"]
prev:
  title: "Level 5"
  url: "/posts/overthewire/bandit/bandit05/"
next:
  title: "Level 7"
  url: "/posts/overthewire/bandit/bandit07/"
---

## Login

SSH: `ssh bandit6@bandit.labs.overthewire.org -p 2220`

Challenge URL: https://overthewire.org/wargames/bandit/bandit7.html


## Task

The password for the next level is stored somewhere on the server and has all of the following properties: owned by user bandit7, owned by group bandit6, 33 bytes in size.

## Solution
We have to go to the root folder `/` for this task.

We just have to use the `find` command with the flags that are mentioned in the task. It's very similar to the previous level.

Since the condition will be matched by just one file, a lot of Permission denied errors will come up so we can redirect the error code of `2` to `/dev/null` as follows:

```bash
find / -user bandit7 -group bandit6 -size 33c 2>/dev/null
```
<br>

One liner: `find / -user bandit7 -group bandit6 -size 33c 2>/dev/null | xargs cat`