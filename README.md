# Beyond the Provenance Pin: CHI 2027 Workshop website

Single-page static site (no build step). Live at `https://iceLearn.github.io/CHI2027-Provenance-Workshop
`.

## Files
- `index.html`: the whole site (text, styles and scripts in one file).
- `assets/fig1-pipeline.png`, `assets/fig2-activities.png`: figures from the proposal.
- `assets/organizers/<name>.jpg`: organizer photos (square). If a photo is missing, the page shows initials instead.

## Editing (directly on GitHub)
Open `index.html`, click the pencil icon, press Ctrl+F, change the text, then click **Commit changes**. The site updates in about a minute.

| To change | Search for |
|---|---|
| Colours | `THEME` (top of file) |
| Deadlines | `Important dates` |
| Workshop day | `day TBA` |
| Submission link | `Submission link (coming soon)`: replace `href="#"` with your link |
| Proposal PDF | `Read the proposal`: upload the PDF to `assets/`, then set `href="assets/proposal.pdf"` |
| Invited speakers | `Speaker TBA` |
| Organizers | `const PEOPLE` (keep the quote marks and commas) |
| Hero demo text | `const STATES` |
| Contact | `mailto` |

Dashed orange outlines mark placeholders. Delete the word `placeholder` from that line once you've filled it in.

## Still to fill in
- Submission deadline, notification date and pre-workshop material dates
- Workshop day within 10–14 May 2027
- Submission link and proposal PDF link
- Invited speakers
- Confirm that each organizer is happy with their photo (sources are listed in `assets/organizers/README.md`)
- Accepted papers section (add after notification)
