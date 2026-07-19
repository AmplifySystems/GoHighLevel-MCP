/**
 * Creates all BILL-* email templates in the Amplify Systems GHL location.
 * Reads credentials from environment variables and never echoes them.
 * Run from FreshHouse-Network: ./scripts/with-infisical.sh node 0_amplify-systems/backend/mcp-servers/amplify-os-ghl-mcp/scripts/create-billing-templates.mjs
 */
import axios from 'axios';

// --- Load credentials from the shell environment (never printed) ---
const API_KEY = process.env.GHL_API_KEY;
const LOCATION_ID = process.env.GHL_LOCATION_ID;
const BASE_URL = process.env.GHL_BASE_URL ?? 'https://services.leadconnectorhq.com';

if (!API_KEY || !LOCATION_ID) {
  console.error('Missing GHL_API_KEY or GHL_LOCATION_ID in environment');
  process.exit(1);
}

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    Version: '2021-07-28',
    'Content-Type': 'application/json',
  },
});

// --- HTML wrapper (matches buildSimpleEmailHtml in MCP utils) ---
function wrapHtml(inner) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title></title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background-color:#ffffff;border-radius:8px;">
          <tr>
            <td style="padding:28px 24px;font-family:Verdana,Geneva,sans-serif;font-size:17px;line-height:1.6;color:#1a1a1a;">
${inner}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px 24px;font-family:Verdana,Geneva,sans-serif;font-size:13px;color:#888888;border-top:1px solid #f0f0f0;">
              Amplify Systems &nbsp;·&nbsp; billing@amplifysystems.io
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function btn(text, url) {
  return `<p style="margin:24px 0 8px;">
  <a href="${url}" style="display:inline-block;background:#1a1a1a;color:#ffffff;font-family:Verdana,Geneva,sans-serif;font-size:16px;font-weight:bold;text-decoration:none;padding:14px 28px;border-radius:6px;">${text}</a>
</p>`;
}

function h2(text) {
  return `<h2 style="margin:0 0 18px;font-family:Verdana,Geneva,sans-serif;font-size:20px;font-weight:bold;color:#1a1a1a;">${text}</h2>`;
}

function p(text) {
  return `<p style="margin:0 0 14px;">${text}</p>`;
}

function ul(items) {
  const lis = items.map(i => `<li style="margin-bottom:8px;">${i}</li>`).join('\n');
  return `<ul style="margin:0 0 16px;padding-left:20px;">${lis}</ul>`;
}

function sig(name = 'Amplify Systems Team') {
  return `<p style="margin:24px 0 0;color:#555555;">— ${name}</p>`;
}

// --- Template definitions ---
const templates = [
  {
    title: 'BILL-A1 | Payment Failed — First Notice',
    subjectLine: 'Action needed — payment didn\'t go through for {{location.name}}',
    previewText: 'Fix it in 2 minutes — update your card to keep your account active.',
    body: `
${h2('Action needed — payment didn\'t go through')}
${p('Hi {{contact.first_name}},')}
${p('We tried to process your <strong>{{location.name}}</strong> subscription payment and it didn\'t complete. Your account may go into a restricted state if we don\'t sort this soon.')}
${h2('Fix it in 2 minutes:')}
${ul([
  'Open your billing settings below',
  'Update your card or payment method',
  'Confirm the charge goes through',
])}
${btn('Update Payment Now', '{{contact.billing_update_url}}')}
${p('If you\'ve already updated payment, you can ignore this — it can take a few minutes to sync.')}
${p('Questions? Reply to this email or message us on your usual Amplify channel.')}
${sig()}`,
  },
  {
    title: 'BILL-A2 | Payment Still Outstanding — Day 2',
    subjectLine: 'Still outstanding — {{location.name}} payment needs attention',
    previewText: 'Your account is still active — but it will pause if this isn\'t resolved.',
    body: `
${h2('Still outstanding — {{location.name}}')}
${p('Hi {{contact.first_name}},')}
${p('We sent a note two days ago about your <strong>{{location.name}}</strong> payment — we haven\'t seen it come through yet.')}
${p('Your account is still active right now, but it <strong>will pause automatically</strong> if this isn\'t resolved.')}
${btn('Update Billing Now', '{{contact.billing_update_url}}')}
${p('It takes about 2 minutes. If you\'ve already sorted it — thank you. It can take a moment to reflect on our end.')}
${p('If something\'s going on, reply to this email and we\'ll work something out.')}
${sig('Sky & Amplify Systems')}`,
  },
  {
    title: 'BILL-B1 | Account Paused — Restore Access',
    subjectLine: 'Your {{location.name}} account is paused — here\'s how to restore it',
    previewText: 'Your site is still live. Restore your account in 2 minutes.',
    body: `
${h2('Your {{location.name}} account is paused')}
${p('Hi {{contact.first_name}},')}
${p('Our system shows your <strong>{{location.name}}</strong> sub-account is now <strong>paused</strong>. This usually means a payment lapsed or billing needs to be updated.')}
${p('Here\'s what that means right now:')}
${ul([
  'You\'ve temporarily lost login access to your HighLevel dashboard',
  'Your website and funnels are <strong>still live</strong> (we haven\'t changed anything)',
  'All automations are paused until billing is restored',
  'Amplify Chat and Quan access are on hold',
])}
${h2('Restore your account (2 minutes):')}
${p('Go to your billing settings and update your payment method:')}
${btn('Restore Access Now', '{{contact.billing_update_url}}')}
${p('Once payment is confirmed, your account restores automatically — no waiting on our side.')}
${p('If you\'d like a human to walk through it with you, reply <strong>"rebuild"</strong> and we\'ll be right there.')}
${sig('Sky & Amplify Systems')}`,
  },
  {
    title: 'BILL-B2 | Still Paused — Day 3 Follow Up',
    subjectLine: 'Still paused — {{location.name}} — checking in',
    previewText: 'Everything is where you left it. Reply "options" if you need alternatives.',
    body: `
${h2('Still paused — following up')}
${p('Hi {{contact.first_name}},')}
${p('Following up from a few days ago — your <strong>{{location.name}}</strong> account is still paused.')}
${p('We haven\'t made any changes to your website or contacts — everything is where you left it. But the longer it stays paused, the harder it is to pick back up momentum.')}
${btn('Update Billing', '{{contact.billing_update_url}}')}
${p('If you\'re going through something or need more time, just reply to this email. We\'d rather know than send automatic messages into a void.')}
${p('If you want to explore a different setup — more affordable tier, pause vs. cancel, anything like that — reply <strong>"options"</strong> and we\'ll look at what works.')}
${sig('Sky')}`,
  },
  {
    title: 'BILL-B3 | Final Notice — Day 7 Decision',
    subjectLine: '{{location.name}} — I need to know what you want to do',
    previewText: 'Reply "fix", "pause", or "close" — or click to update billing.',
    body: `
${h2('Final notice — I need to hear from you')}
${p('Hi {{contact.first_name}},')}
${p('It\'s been a week since your <strong>{{location.name}}</strong> account paused. I\'ve reached out a couple of times and haven\'t heard back.')}
${p('I need to make a decision about the hosting this week.')}
${p('<strong>Here\'s what I can do:</strong>')}
${ul([
  '<strong>You update billing</strong> → account restores immediately, we keep going',
  '<strong>You reply "pause"</strong> → I hold everything for 30 days, no charges, no changes',
  '<strong>You reply "close"</strong> → I\'ll export your contacts and walk you through a clean close, no hard feelings',
])}
${btn('Update Billing Now', '{{contact.billing_update_url}}')}
${p('If I don\'t hear back by end of this week, I\'ll move to hold to protect your data.')}
${p('I\'d love to keep working with you — but I need to hear from you.')}
${sig('Sky')}`,
  },
  {
    title: 'BILL-B4 | Account in Hold — Day 14 Site Offline',
    subjectLine: '{{location.name}} — moved to hold — your data is safe',
    previewText: 'Site is offline. Data safe for 30 days. Restore anytime.',
    body: `
${h2('{{location.name}} is now on hold')}
${p('Hi {{contact.first_name}},')}
${p('I\'ve moved your <strong>{{location.name}}</strong> account to hold status. Your data, contacts, and settings are all safe — I\'ll keep them for 30 days.')}
${p('<strong>Your website is now offline.</strong> If anyone visits, they\'ll see a temporary offline page.')}
${p('<strong>To restore everything</strong> at any point in the next 30 days:')}
${btn('Restore Your Account', '{{contact.billing_update_url}}')}
${p('After 30 days, I\'ll reach out one more time before any data is permanently removed.')}
${p('If you want to close the account properly, reply <strong>"close account"</strong> and I\'ll confirm next steps.')}
${p('Thank you for the time we\'ve worked together.')}
${sig('Sky & Amplify Systems')}`,
  },
  {
    title: 'BILL-C1 | Win-back — Guided Rebuild',
    subjectLine: 'Your Amplify stack is waiting — pick your path back',
    previewText: 'One link. Fix billing, talk to Quan, or explore Mastermind.',
    body: `
${h2('Your Amplify stack is waiting')}
${p('Hi {{contact.first_name}},')}
${p('Your <strong>{{location.name}}</strong> account is paused, but we kept your settings. We\'d rather help you <strong>rebuild</strong> than send guilt emails.')}
${p('<strong>One link — choose what you want next:</strong>')}
${btn('Choose Your Path Back →', '{{contact.rebuild_guided_url}}')}
${p('On that page you can:')}
${ul([
  '<strong>Fix billing in 2 minutes</strong> — card on file, account back on',
  '<strong>Talk to Quan</strong> by voice or text — your AI partner, picks up where you left off',
  '<strong>Explore Mastermind</strong> at a win-back rate — AI implementation coaching for more attention, leads, and revenue',
  'Or tell us you\'re closing — no surprises, we\'ll handle it cleanly',
])}
${p('When billing is good standing again, you get <strong>HighLevel</strong>, <strong>Amplify Chat</strong>, and <strong>Quan connected</strong> — the full Amplify Systems spine, back on.')}
${p('Questions? Open the link and tap <strong>Talk to Quan</strong> at the top.')}
${sig('Sky & Amplify Systems')}`,
  },
  {
    title: 'BILL-C2 | Win-back — Last Chance Day 7',
    subjectLine: 'We saved your settings — ready when you are, {{contact.first_name}}',
    previewText: 'Last note. Data safe. Reactivate anytime or reply "close".',
    body: `
${h2('We saved your settings — ready when you are')}
${p('Hi {{contact.first_name}},')}
${p('One more note — your <strong>{{location.name}}</strong> account status is <strong>{{contact.billing_health_status}}</strong>. We haven\'t touched your data.')}
${p('We\'re not going to guilt you. Here\'s what\'s true:')}
${ul([
  'Last payment on file: {{contact.last_payment_date}}',
  'Everything still here: contacts, funnels, automations, website',
  'What it takes to come back: update billing below',
])}
${btn('Reactivate Your Account', '{{contact.billing_update_url}}')}
${p('If you\'re done: reply <strong>"close account"</strong> — we\'ll confirm next steps, no surprise charges, no drama.')}
${p('If you want to talk first: reply <strong>"call"</strong> and we\'ll find 15 minutes.')}
${p('Thank you for building with Amplify.')}
${sig('Amplify Systems')}`,
  },
  {
    title: 'BILL-D1 | Good Standing — Payment Confirmed',
    subjectLine: 'You\'re all set — {{location.name}} billing is current',
    previewText: 'Payment received. Full access restored.',
    body: `
${h2('You\'re all set — billing is current')}
${p('Hi {{contact.first_name}},')}
${p('Payment received — your <strong>{{location.name}}</strong> account is in <strong>good standing</strong>. Access and all automations should be fully restored within a few minutes.')}
${btn('Open Your Billing Portal', '{{contact.billing_update_url}}')}
${p('If anything doesn\'t look right in the next hour, reply here and we\'ll check immediately.')}
${p('Thank you — let\'s keep building.')}
${sig('Amplify Systems')}`,
  },
  {
    title: 'BILL-E1 | Internal Ops — Billing Status Alert',
    subjectLine: '[Billing] {{location.name}} — {{contact.billing_health_status}}',
    previewText: 'Internal billing alert — check GHL and Supabase for details.',
    body: `
${h2('[Internal] Billing status alert')}
${p('<strong>Sub-account:</strong> {{location.name}}<br/><strong>Location ID:</strong> {{location.id}}<br/><strong>Status:</strong> {{contact.billing_health_status}}<br/><strong>Billing contact:</strong> {{contact.billing_contact_email}}<br/><strong>Last payment:</strong> {{contact.last_payment_date}}<br/><strong>Payment failed:</strong> {{contact.last_payment_failed_at}}<br/><strong>Stripe customer:</strong> {{contact.stripe_customer_id}}')}
${btn('Open Billing Settings', '{{contact.billing_update_url}}')}
${p('Runbook: DUNNING-WORKFLOW-COMPLETE-EXECUTION-RUNBOOK.md')}
${sig('Amplify Systems — Internal')}`,
  },
];

// --- Create templates ---
async function createTemplate(t) {
  const html = wrapHtml(t.body);
  const payload = {
    locationId: LOCATION_ID,
    type: 'html',
    title: t.title,
    html,
    ...(t.subjectLine && { subjectLine: t.subjectLine }),
    ...(t.previewText && { previewText: t.previewText }),
  };
  const res = await client.post('/emails/builder', payload);
  return res.data;
}

async function main() {
  console.log(`Creating ${templates.length} BILL-* email templates in GHL location ${LOCATION_ID}...\n`);
  const results = [];
  for (const t of templates) {
    try {
      const data = await createTemplate(t);
      const id = data?.data?.id ?? data?.id ?? JSON.stringify(data).slice(0, 80);
      console.log(`✅  ${t.title}`);
      console.log(`    ID: ${id}\n`);
      results.push({ title: t.title, id, status: 'created' });
    } catch (err) {
      const msg = err.response?.data?.message ?? err.message;
      console.error(`❌  ${t.title}`);
      console.error(`    Error: ${msg}\n`);
      results.push({ title: t.title, error: msg, status: 'failed' });
    }
  }

  console.log('--- Summary ---');
  const ok = results.filter(r => r.status === 'created').length;
  const fail = results.filter(r => r.status === 'failed').length;
  console.log(`Created: ${ok} / ${templates.length}  |  Failed: ${fail}`);
  if (fail > 0) {
    console.log('\nFailed templates:');
    results.filter(r => r.status === 'failed').forEach(r => console.log(`  - ${r.title}: ${r.error}`));
  }
}

main().catch(e => { console.error(e); process.exit(1); });
