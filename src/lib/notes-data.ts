// Placeholder methodology notes used to design this section's layout.
// The real content will come from converting the CherryTree (.ctb)
// notebook, which has a similar section/subsection shape.

export type NoteLeaf = {
  slug: string;
  title: string;
  summary: string;
  body: string;
};

export type NoteSection = {
  slug: string;
  title: string;
  notes: NoteLeaf[];
};

export const noteSections: NoteSection[] = [
  {
    slug: "recon",
    title: "Reconnaissance",
    notes: [
      {
        slug: "nmap",
        title: "Nmap scanning",
        summary: "A staged scan order that goes from fast to thorough.",
        body: `Run scans in stages rather than one slow all-ports-all-scripts pass.

**1. Fast port sweep** &mdash; find what's open before spending time on it.

\`\`\`shell
nmap -p- --min-rate 5000 -T4 <target>
\`\`\`

**2. Targeted service scan** &mdash; only against the ports found above.

\`\`\`shell
nmap -p <ports> -sC -sV -oN scan.txt <target>
\`\`\`

**3. UDP, if the box looks otherwise quiet**

\`\`\`shell
nmap -sU --top-ports 100 <target>
\`\`\`

Keep raw output (\`-oN\`) for every scan &mdash; it's the first thing worth
re-reading once a foothold changes what "interesting" means.`,
      },
      {
        slug: "subdomain-enumeration",
        title: "Subdomain enumeration",
        summary: "Passive first, brute force second.",
        body: `Start passive to avoid unnecessary noise, then brute force what's left.

\`\`\`shell
subfinder -d <domain> -silent | tee subdomains.txt
\`\`\`

Resolve and filter to live hosts before doing anything else:

\`\`\`shell
cat subdomains.txt | httpx -silent -o live.txt
\`\`\`

Only reach for a wordlist brute force (\`gobuster dns\`, \`ffuf\`) once passive
sources are exhausted and the target clearly needs it.`,
      },
    ],
  },
  {
    slug: "web",
    title: "Web Exploitation",
    notes: [
      {
        slug: "sqli",
        title: "SQL injection",
        summary: "Confirming, then escalating from a blind or error-based hit.",
        body: `**Confirm first**, escalate second. A single quote and a boolean pair is
enough to tell you if input reaches a query:

\`\`\`text
' OR '1'='1
' OR '1'='2
\`\`\`

If the response differs between the two, the parameter is injectable.

For anything beyond a toy target, hand off to \`sqlmap\` rather than hand
crafting payloads:

\`\`\`shell
sqlmap -u "https://target/item?id=1" --batch --dbs
\`\`\`

Blind/time-based cases are the ones worth double-checking manually &mdash;
automated tools can produce false positives when the response timing is
noisy.`,
      },
      {
        slug: "file-upload-bypass",
        title: "File upload bypass",
        summary: "The checks that are usually worth trying, in order.",
        body: `Roughly in order of how often they work:

1. **Double extension** &mdash; \`shell.php.jpg\`
2. **Case variation** &mdash; \`shell.PHP\`, \`shell.pHp\`
3. **Null byte** (older stacks) &mdash; \`shell.php%00.jpg\`
4. **Content-Type spoofing** &mdash; set \`Content-Type: image/jpeg\` regardless
   of the actual file
5. **Alternate executable extensions** &mdash; \`.phtml\`, \`.php5\`, \`.pht\`

Always check whether the upload directory is directly web-accessible before
assuming the upload itself is the vulnerability &mdash; sometimes the real
gap is a missing execute restriction on that path.`,
      },
    ],
  },
  {
    slug: "privesc",
    title: "Privilege Escalation",
    notes: [
      {
        slug: "linux",
        title: "Linux",
        summary: "The checklist before reaching for an enumeration script.",
        body: `Run these manually before reaching for LinPEAS &mdash; it's faster to read
a short targeted list than to wade through a full report.

\`\`\`shell
sudo -l
find / -perm -4000 -type f 2>/dev/null   # SUID
getcap -r / 2>/dev/null                  # capabilities
cat /etc/crontab
\`\`\`

If \`sudo -l\` lists a script, check whether it calls any binary without an
absolute path &mdash; that's a \`PATH\` hijack. If it's a SUID binary, check
[GTFOBins](https://gtfobins.github.io/) before assuming it's a dead end.`,
      },
      {
        slug: "windows",
        title: "Windows",
        summary: "Service, token, and scheduled-task angles.",
        body: `Three angles worth checking early:

**Unquoted service paths**

\`\`\`powershell
wmic service get name,pathname,startmode | findstr /i /v "C:\\Windows"
\`\`\`

**Service binary permissions**

\`\`\`powershell
icacls "C:\\path\\to\\service.exe"
\`\`\`

**Scheduled tasks running as SYSTEM** with a writable target script or
binary.

\`winPEAS\` is worth running, but treat it as a second pass after these
manual checks &mdash; it's easy to miss a specific misconfiguration in a
long report.`,
      },
    ],
  },
  {
    slug: "active-directory",
    title: "Active Directory",
    notes: [
      {
        slug: "kerberoasting",
        title: "Kerberoasting",
        summary: "Requesting and cracking service ticket hashes.",
        body: `Any authenticated domain user can request a TGS for an account with an
SPN set &mdash; the ticket is encrypted with that account's password hash.

\`\`\`shell
GetUserSPNs.py domain.local/user:password -dc-ip <dc-ip> -request
\`\`\`

Crack offline:

\`\`\`shell
hashcat -m 13100 hashes.txt rockyou.txt
\`\`\`

Service accounts are worth prioritising &mdash; they're more likely to have
old, weak, or never-rotated passwords than regular user accounts.`,
      },
      {
        slug: "bloodhound",
        title: "BloodHound",
        summary: "Turning a single foothold into a path to Domain Admin.",
        body: `Collect first, then think in terms of paths rather than individual
hosts:

\`\`\`shell
bloodhound-python -u user -p password -d domain.local -c All -ns <dc-ip>
\`\`\`

In the UI, start from **Shortest Paths to Domain Admins** and work
backwards from there rather than exploring the graph node by node. Look
for \`GenericAll\`, \`WriteDACL\`, and unconstrained delegation edges first
&mdash; they tend to be the quickest wins.`,
      },
    ],
  },
];

export function findNote(
  slugPath: string[]
): { section: NoteSection; note: NoteLeaf } | undefined {
  const [sectionSlug, noteSlug] = slugPath;
  const section = noteSections.find((s) => s.slug === sectionSlug);
  if (!section) return undefined;
  const note = section.notes.find((n) => n.slug === noteSlug);
  if (!note) return undefined;
  return { section, note };
}

export function allNoteParams() {
  return noteSections.flatMap((section) =>
    section.notes.map((note) => ({ slug: [section.slug, note.slug] }))
  );
}
