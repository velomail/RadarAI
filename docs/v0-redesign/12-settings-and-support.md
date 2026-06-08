# Settings, support, and privacy

## Settings — `/dashboard/settings`

`DashboardPage`-style or simple `max-w-2xl` column.

**Header:**

- H1: **Settings**
- Sub: Account, notifications, and data privacy.

### NewsletterUpsell (dashed card)

- Mail icon
- Title: **Email newsletter** + badge `Pro — coming soon`
- Body: free on-demand vs future scheduled digest
- Hint: use Search → Search now (3 free/day)

### Telegram form (glass card)

- H2: Telegram alerts (optional)
- Sub: message when manual search completes
- Input: Telegram chat ID (placeholder `from @userinfobot`)
- **Save** button

### DataTrustNotice

Compact or full trust card.

### Account section (glass card)

- Signed in as `{email}`
- Privacy policy link
- **Delete account** danger zone:
  - Red tinted box
  - Type DELETE to confirm
  - **Delete account** danger button

---

## Search settings — `/dashboard/settings/search`

`DashboardPage` with back link **← Search**

- H1: **Email alerts & advanced settings**
- Sub: Optional notifications and saved search defaults.

**Glass form:**

- Resume info bar: filename + link **Update resume** → searches page
- Full `SearchProfileFields` (name, focus, keywords, location, scores, remote, email-on-complete)
- **Save changes**

**Danger section below:**

- **Reset search profile** — removes criteria, keeps run history
- **Delete search profile** small danger button

---

## Support — `/support`

Marketing shell.

- Back link ← Back to home
- H1: **How can we help?**
- Two columns `lg:grid-cols-2`:

**FAQ** (4 items in glass cards):

1. How does RadarAI match me with jobs?
2. Is my resume data safe?
3. What's the difference between free and Pro?
4. Which job boards do you search? → **Adzuna** (be accurate)

**Contact form** (glass, non-functional UI):

- Email, Subject, Message fields
- **Send message** full width
- Footer: support@radarai.com mailto

---

## Privacy — `/privacy`

Marketing shell, glass article `max-w-3xl`.

Sections: Information we collect, How we use it, Service providers (Supabase, Vercel, OpenAI, Adzuna, Google/GitHub OAuth), Retention, Your rights, Contact, disclaimer.

Last updated: May 2026
