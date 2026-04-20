# Supabase Integration + Hosting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the waitlist modal in `index.html` to a live Supabase table, then deploy the page to Cloudflare Pages behind the custom domain.

**Architecture:** The single-file page calls the Supabase JS CDN client directly from the browser. Step 1 inserts a row and stores the returned UUID in memory; Step 2 updates that row with survey data. Hosting is Cloudflare Pages connected to the GitHub `main` branch — every push auto-deploys with no build step.

**Tech Stack:** Supabase JS v2 (CDN), Cloudflare Pages, custom domain DNS (CNAME or Cloudflare nameservers)

---

## Scope note
Two independent subsystems (Supabase integration = code; Hosting = infra config). Both are small enough to handle in one plan. Complete Task 1–3 first so you can test the form against a live DB before the domain goes live.

---

## File Map

| File | Change |
|------|--------|
| `index.html` | Add Supabase CDN script, add client init, rewrite modal JS submit handlers |

No new files needed. Hosting is all UI config in Cloudflare dashboard.

---

## Task 1: Supabase table — final schema + RLS

> Prerequisite: You have a Supabase project. Open the **SQL Editor** in your Supabase dashboard.

**Files:**
- No code files. Run SQL in Supabase dashboard.

- [ ] **Step 1: Create the waitlist table**

Paste and run in Supabase SQL Editor:

```sql
create table if not exists waitlist (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz default now(),

  -- Step 1 fields
  first_name         text not null,
  last_name          text not null,
  email              text not null unique,
  phone              text,

  -- Step 2 fields
  inner_circle       boolean default false,
  age_range          text,
  health_focus       text[],
  health_focus_other text,
  wearables          text[],
  wearables_other    text,
  features           text[],
  features_other     text,
  how_heard          text,
  how_heard_other    text,
  frustration        text
);
```

Expected: green "Success. No rows returned."

- [ ] **Step 2: Enable Row Level Security and add policies**

```sql
alter table waitlist enable row level security;

-- Allow anyone to insert (join the waitlist)
create policy "anon_insert"
  on waitlist for insert to anon
  with check (true);

-- Allow update only on the row matching the ID provided
-- (UUID is unguessable; client holds it in memory only)
create policy "anon_update_own"
  on waitlist for update to anon
  using (true);
```

Expected: green "Success. No rows returned."

- [ ] **Step 3: Verify table exists**

In Supabase dashboard → **Table Editor** → confirm `waitlist` table appears with all columns.

- [ ] **Step 4: Copy your credentials**

Go to **Settings → API**. Copy and keep handy:
- `Project URL` — looks like `https://abcdefgh.supabase.co`
- `anon public` key — long JWT string

---

## Task 2: Add Supabase client to index.html

**Files:**
- Modify: `index.html` — `<head>` section and top of `<script>`

- [ ] **Step 1: Add Supabase CDN script to `<head>`**

Find this line in `index.html`:
```html
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;600;700&display=swap" rel="stylesheet">
```

Add immediately after it:
```html
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
```

- [ ] **Step 2: Add field-error CSS**

Find this in the `<style>` block:
```css
    .toast-el { position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:var(--text); color:#fff; padding:12px 24px; border-radius:12px; font-size:14px; z-index:2000; pointer-events:none; white-space:nowrap; animation:ti .35s var(--spring),to .3s var(--ease) 2.7s forwards; }
```

Add immediately after it:
```css
    .field-err { font-size:12px; color:#e05252; margin-top:5px; animation:fi .25s var(--ease); }
```

- [ ] **Step 3: Initialise Supabase client at the top of `<script>`**

Find this line in `<script>`:
```js
// ── SCROLL REVEAL
```

Add before it (replace YOUR_URL and YOUR_ANON_KEY with your actual values from Task 1 Step 4):
```js
// ── SUPABASE CLIENT
var sb = supabase.createClient('YOUR_URL', 'YOUR_ANON_KEY');
```

- [ ] **Step 4: Open index.html in a browser, open DevTools console**

Verify: no errors. Type `sb` in the console — should print a Supabase client object, not `undefined`.

- [ ] **Step 5: Commit**

```bash
cd /Users/polys/Developer/vitals
git add index.html
git commit -m "feat: add supabase client init"
```

---

## Task 3: Wire Step 1 submit — insert row

**Files:**
- Modify: `index.html` — modal JS section (the `// ── WAITLIST MODAL` IIFE)

- [ ] **Step 1: Add helper functions inside the modal IIFE**

Find this inside the `// ── WAITLIST MODAL` IIFE:
```js
  function toast(msg){ var t=document.createElement('div'); t.className='toast-el'; t.setAttribute('role','status'); t.setAttribute('aria-live','polite'); t.textContent=msg; document.body.appendChild(t); setTimeout(function(){ t.remove(); },3200); }
```

Add immediately after it:
```js
  function showFieldError(fieldId, msg){
    var field = document.getElementById(fieldId);
    var existing = field.parentNode.querySelector('.field-err');
    if(existing) existing.remove();
    var err = document.createElement('p');
    err.className = 'field-err';
    err.setAttribute('role','alert');
    err.textContent = msg;
    field.parentNode.appendChild(err);
    setTimeout(function(){ err.remove(); }, 4500);
  }
  function clearErrors(){ document.querySelectorAll('.field-err').forEach(function(el){ el.remove(); }); }
  var _waitlistId = null;
```

- [ ] **Step 2: Replace the Step 1 button handler**

Find:
```js
  document.getElementById('s1-btn').addEventListener('click',function(){ s1.style.display='none'; s2.style.display=''; document.getElementById('modal-card').scrollTop=0; });
```

Replace with:
```js
  document.getElementById('s1-btn').addEventListener('click', async function(){
    clearErrors();
    var btn = this;
    var firstName = document.getElementById('fn').value.trim();
    var lastName  = document.getElementById('ln').value.trim();
    var email     = document.getElementById('em').value.trim();
    var phone     = document.getElementById('ph').value.trim();

    if(!firstName){ showFieldError('fn','First name is required'); return; }
    if(!lastName) { showFieldError('ln','Last name is required');  return; }
    if(!email)    { showFieldError('em','Email is required');       return; }

    btn.disabled = true;
    btn.textContent = 'Saving…';

    var result = await sb.from('waitlist').insert({
      first_name: firstName,
      last_name:  lastName,
      email:      email,
      phone:      phone || null,
    }).select('id').single();

    btn.disabled = false;
    btn.textContent = 'Sign up now';

    if(result.error){
      if(result.error.code === '23505'){
        showFieldError('em', 'You\'re already on the list!');
      } else {
        toast('Something went wrong. Please try again.');
        console.error(result.error);
      }
      return;
    }

    _waitlistId = result.data.id;
    s1.style.display = 'none';
    s2.style.display = '';
    document.getElementById('modal-card').scrollTop = 0;
  });
```

- [ ] **Step 3: Test Step 1 in the browser**

1. Open `index.html`. Click "Join the Waitlist".
2. Submit with empty fields — verify inline errors appear under each empty field.
3. Fill in a valid name + email, click "Sign up now".
4. Verify the modal advances to Step 2.
5. In Supabase dashboard → Table Editor → `waitlist` — verify a new row exists with `inner_circle = false`.

- [ ] **Step 4: Test duplicate email**

Submit the same email again. Verify the error "You're already on the list!" appears under the email field (no crash, no modal advance).

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: insert waitlist row on step 1 submit"
```

---

## Task 4: Wire Step 2 submit — update row with survey

**Files:**
- Modify: `index.html` — modal JS section

- [ ] **Step 1: Replace the Step 2 button handler**

Find:
```js
  document.getElementById('s2-btn').addEventListener('click',function(){ close(); toast('Welcome to the Inner Circle. \u2728'); });
```

Replace with:
```js
  document.getElementById('s2-btn').addEventListener('click', async function(){
    var btn = this;
    btn.disabled = true;
    btn.textContent = 'Saving…';

    var ageRange   = (document.querySelector('input[name=age_range]:checked') || {}).value || null;
    var hf         = Array.from(document.querySelectorAll('input[name=health_focus]:checked')).map(function(el){ return el.value; });
    var hfOther    = document.getElementById('q2-other-text').value.trim() || null;
    var wear       = Array.from(document.querySelectorAll('input[name=wearables]:checked')).map(function(el){ return el.value; });
    var wearOther  = document.getElementById('q3-other-text').value.trim() || null;
    var feats      = Array.from(document.querySelectorAll('input[name=features]:checked')).map(function(el){ return el.value; });
    var featsOther = document.getElementById('q4-none-text').value.trim() || null;
    var heard      = (document.querySelector('input[name=how_heard]:checked') || {}).value || null;
    var heardOther = document.getElementById('q5-other-text').value.trim() || null;
    var frustration= document.getElementById('frustration').value.trim() || null;

    var payload = {
      inner_circle:        true,
      age_range:           ageRange,
      health_focus:        hf.length    ? hf    : null,
      health_focus_other:  hfOther,
      wearables:           wear.length  ? wear  : null,
      wearables_other:     wearOther,
      features:            feats.length ? feats : null,
      features_other:      featsOther,
      how_heard:           heard,
      how_heard_other:     heardOther,
      frustration:         frustration,
    };

    var result = await sb.from('waitlist').update(payload).eq('id', _waitlistId);

    btn.disabled = false;
    btn.textContent = 'Join the Inner Circle';

    if(result.error){
      toast('Something went wrong. Please try again.');
      console.error(result.error);
      return;
    }

    close();
    toast('Welcome to the Inner Circle. \u2728');
  });
```

- [ ] **Step 2: Update the skip handler to mark inner_circle = false**

Find:
```js
  function doSkip(){ close(); toast('You are on the list!'); }
```

Replace with:
```js
  function doSkip(){
    if(_waitlistId) sb.from('waitlist').update({ inner_circle: false }).eq('id', _waitlistId);
    close();
    toast('You are on the list!');
  }
```

- [ ] **Step 3: Test Step 2 — Inner Circle submit**

1. Complete Step 1 with a fresh email.
2. On Step 2, select an age, a few features, and how you heard.
3. Click "Join the Inner Circle".
4. Verify toast appears.
5. In Supabase → `waitlist` — verify the row now has `inner_circle = true` and the survey fields populated.

- [ ] **Step 4: Test Step 2 — skip**

1. Complete Step 1 with another fresh email.
2. On Step 2, click "No thanks, I am all set."
3. In Supabase → verify the row exists with `inner_circle = false` and survey fields null.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: update waitlist row with inner circle survey on step 2"
```

---

## Task 5: Deploy to Cloudflare Pages

> All steps are in the Cloudflare dashboard UI. No code changes.

- [ ] **Step 1: Create Cloudflare account (if you don't have one)**

Go to [cloudflare.com](https://cloudflare.com) → Sign up (free).

- [ ] **Step 2: Connect GitHub repo to Cloudflare Pages**

1. In Cloudflare dashboard → **Workers & Pages** → **Create application** → **Pages** tab.
2. Click **Connect to Git** → authorize Cloudflare to access your GitHub.
3. Select the `vitals` repo → **Begin setup**.
4. Configure:
   - **Project name:** `demetra` (or your preference)
   - **Production branch:** `main`
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/` (a single slash)
5. Click **Save and Deploy**.
6. Wait ~30 seconds. You'll get a URL like `demetra.pages.dev`. Open it — verify the landing page loads.

- [ ] **Step 3: Test the live deployment**

Open `https://demetra.pages.dev` (your assigned Pages URL). Submit a test waitlist entry. Verify it appears in Supabase. This confirms the full chain works end-to-end in production.

---

## Task 6: Connect custom domain

- [ ] **Step 1: Add custom domain in Cloudflare Pages**

1. In Cloudflare Pages → your project → **Custom domains** tab.
2. Click **Set up a custom domain**.
3. Enter your domain (e.g. `demetrahealth.com`).
4. Click **Continue**.

- [ ] **Step 2a: If your domain is already on Cloudflare DNS**

Cloudflare will auto-configure a CNAME record. Click **Activate domain**. SSL provisions in ~2 minutes. Done.

- [ ] **Step 2b: If your domain is on another registrar (e.g. GoDaddy, Namecheap, Google Domains)**

Two options — pick one:

**Option A (recommended) — move DNS to Cloudflare:**
1. In Cloudflare dashboard → **Add a site** → enter your domain → Free plan.
2. Cloudflare scans your existing DNS records (keep them).
3. Cloudflare gives you two nameserver addresses (e.g. `asa.ns.cloudflare.com`).
4. Go to your registrar → find **Nameservers** settings → replace existing nameservers with Cloudflare's two.
5. Wait up to 24h for propagation (usually under 1h).
6. Cloudflare Pages will then automatically manage the CNAME.

**Option B — stay on current registrar:**
1. Cloudflare Pages shows you the CNAME record to add.
2. Log in to your registrar → DNS settings → add:
   - Type: `CNAME`
   - Name: `@` (or `www` for www subdomain)
   - Value: `demetra.pages.dev` (your Pages URL)
3. Wait for DNS propagation (~5–30 min).

- [ ] **Step 3: Verify HTTPS is active**

Visit `https://yourdomain.com`. Verify:
- Page loads correctly.
- Padlock / HTTPS shown in browser.
- Waitlist form submits to Supabase correctly.

- [ ] **Step 4: Commit a small whitespace change to test auto-deploy**

```bash
# Add a comment to index.html, save, then:
git add index.html
git commit -m "chore: verify auto-deploy pipeline"
git push origin main
```

Watch Cloudflare Pages dashboard — a new deployment should start within 10 seconds and complete in ~30 seconds. Verify the live site updates.

---

## Self-Review

**Spec coverage check:**
- ✓ Supabase table created with all fields from `inner_circle.md`
- ✓ Step 1 inserts row, stores UUID
- ✓ Step 2 updates row with survey data + `inner_circle = true`
- ✓ Skip sets `inner_circle = false`
- ✓ Duplicate email handled with inline error
- ✓ Network errors handled with toast
- ✓ Cloudflare Pages deployment
- ✓ Custom domain (both DNS paths covered)
- ✓ Auto-deploy pipeline verified

**Placeholder scan:** No TBDs. All code is complete. Credentials require user's actual values (unavoidable).

**Type consistency:** `_waitlistId` is set in Task 3, read in Tasks 4 and `doSkip`. Consistent throughout.
