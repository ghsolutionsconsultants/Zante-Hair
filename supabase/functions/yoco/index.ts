// @ts-nocheck
// Zante Beauty: card payments with the Yoco Checkout API (Supabase Edge Function, Deno).
//
// The Yoco secret key lives ONLY here, as a Supabase secret. It is never sent to the browser.
//
// Routes (all under https://<project>.supabase.co/functions/v1/yoco):
//   POST /checkout          Checks the bag, works out the amount from the price list below (the browser's
//                           prices are never trusted), saves the order, creates a Yoco checkout and returns
//                           { ref, redirectUrl }. The site then sends the customer to Yoco's payment page.
//   GET  /status?ref=ZB-..  Asks Yoco whether the order is paid, updates the order and returns a summary
//                           without personal details. Used by /order after the customer comes back.
//   GET  /link?ref=ZB-..    Returns the Yoco payment page for an unpaid order. Used by /pay, so a
//                           payment link sent on WhatsApp still starts on zantebeauty.co.za (Yoco checks this).
//
// Secrets (Supabase dashboard > Edge Functions > Secrets):
//   YOCO_SECRET_KEY   sk_test_... while testing, sk_live_... when live. Required.
//   SITE_URL          optional, default https://zantebeauty.co.za
//   ALLOWED_ORIGINS   optional, default https://zantebeauty.co.za,https://www.zantebeauty.co.za
//   RESEND_API_KEY, RECEIPT_FROM   optional: email receipts through Resend once the payment is confirmed
//                     (RECEIPT_FROM e.g. "Zante Beauty <orders@zantebeauty.co.za>", on a domain verified with Resend).
//   SHOP_EMAIL        optional, default zantebeauty@outlook.com: gets a copy of every paid order.
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase automatically.
//
// Keep PRODUCTS and SHIP in step with the prices on the website (assets/js/app.js).

const YOCO = 'https://payments.yoco.com/api/checkouts';
const LENGTHS = [10, 12, 14, 16, 18, 20, 22];
const PRODUCTS = {
  halfwig: { name: 'The Half Wig', prices: [2900, 3000, 3150, 3250, 3350, 3600, 3900] },
  upart: { name: 'The U-Part Wig', prices: [3000, 3100, 3250, 3350, 3450, 3700, 4000] },
};
const SHIP = {
  pnp: { name: 'Pick n Pay store to door', fee: 90, time: '24 to 72 hours', kind: 'door' },
  paxi: { name: 'PAXI store to store', fee: 60, time: '7 to 9 days', kind: 'paxi' },
  'paxi-fast': { name: 'PAXI store to store, faster', fee: 110, time: '3 to 5 days', kind: 'paxi' },
  postnet: { name: 'PostNet to PostNet', fee: 109, time: '2 to 3 working days to main centres', kind: 'postnet' },
};
// TEST PRODUCT (remove after testing): R2 item, Yoco's minimum, with a R0 delivery option for test-only orders.
const TEST_ITEM = { name: 'Payment test item', price: 2 };
const SHIP_TEST = { name: 'No delivery (test order)', fee: 0, time: 'Test only', kind: 'door' };
// Yoco checkout statuses that mean the customer has paid.
const PAID = ['completed', 'succeeded', 'paid'];
const REF = /^ZB-[A-HJ-NP-Z2-9]{10}$/;
const PROVINCES = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'];

const clean = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

function newRef() {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // 32 letters and digits, no look-alikes
  return 'ZB-' + Array.from(crypto.getRandomValues(new Uint8Array(10)), (x) => abc[x % 32]).join('');
}

async function db(ENV, method, path, body) {
  const key = ENV.SUPABASE_SERVICE_ROLE_KEY || '';
  const headers = { apikey: key, 'Content-Type': 'application/json', Prefer: 'return=representation' };
  if (key.startsWith('eyJ')) headers.Authorization = 'Bearer ' + key;
  const res = await fetch(`${ENV.SUPABASE_URL}/rest/v1/${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) throw new Error(`database ${method} ${path.split('?')[0]} ${res.status}`);
  return res.status === 204 ? null : res.json();
}

async function findOrder(ENV, ref) {
  if (!REF.test(ref)) return null;
  const rows = await db(ENV, 'GET', `orders?ref=eq.${ref}&select=*`);
  return (rows && rows[0]) || null;
}

async function createCheckout(req, ENV, json) {
  if (!ENV.YOCO_SECRET_KEY) return json({ error: 'Card payment is not set up yet. Please order on WhatsApp.' }, 503);
  let body;
  try { body = await req.json(); } catch (e) { return json({ error: 'Invalid request.' }, 400); }

  const lines = [];
  for (const it of (Array.isArray(body.items) ? body.items : []).slice(0, 10)) {
    const p = PRODUCTS[it && it.id], i = LENGTHS.indexOf(Number(it && it.len)), qty = Math.floor(Number(it && it.qty) || 0);
    if (it && it.id === 'test' && qty >= 1 && qty <= 5) { lines.push({ id: 'test', name: TEST_ITEM.name, len: 0, qty, price: TEST_ITEM.price }); continue; }   // TEST PRODUCT
    if (!p || i < 0 || qty < 1 || qty > 5) return json({ error: 'Something in your bag is no longer available. Please refresh the page and try again.' }, 400);
    lines.push({ id: it.id, name: p.name, len: LENGTHS[i], qty, price: p.prices[i] });
  }
  if (!lines.length) return json({ error: 'Your bag is empty.' }, 400);
  const testOnly = lines.every((l) => l.id === 'test');   // TEST PRODUCT
  const ship = body.ship === 'test' ? (testOnly ? SHIP_TEST : null) : SHIP[body.ship];
  if (!ship) return json({ error: 'Choose a delivery option with a fixed price to pay by card.' }, 400);

  const c = body.customer || {};
  const receipt = (Array.isArray(c.receipt) ? c.receipt : []).filter((r) => r === 'email' || r === 'whatsapp');
  const customer = {
    firstName: clean(c.firstName, 60), surname: clean(c.surname, 60), email: clean(c.email, 120).toLowerCase(),
    phone: clean(c.phone, 20), receipt: [...new Set(receipt)],
  };
  customer.name = (customer.firstName + ' ' + customer.surname).trim();
  if (!customer.firstName) return json({ error: 'Add your first name.' }, 400);
  if (!customer.surname) return json({ error: 'Add your surname.' }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(customer.email)) return json({ error: 'Add a valid email address.' }, 400);
  if (customer.phone.replace(/\D/g, '').length < 9) return json({ error: 'Add a valid cellphone number.' }, 400);
  if (!customer.receipt.length) return json({ error: 'Choose how we send your receipt: email, WhatsApp or both.' }, 400);
  const a = c.address && typeof c.address === 'object' ? c.address : {};
  const parts = { store: clean(a.store, 80), line1: clean(a.line1, 120), line2: clean(a.line2, 120), suburb: clean(a.suburb, 60),
    city: clean(a.city, 60), province: clean(a.province, 30), postal: clean(a.postal, 4), notes: clean(a.notes, 160) };
  const atStore = ship.kind !== 'door';
  if (atStore ? parts.store.length < 3 : parts.line1.length < 4) return json({ error: atStore ? 'Add the store or branch name.' : 'Add your street address.' }, 400);
  if (!atStore && parts.suburb.length < 2) return json({ error: 'Add your suburb.' }, 400);
  if (parts.city.length < 2) return json({ error: 'Add your city or town.' }, 400);
  if (!PROVINCES.includes(parts.province)) return json({ error: 'Choose your province.' }, 400);
  if ((!atStore || parts.postal) && !/^\d{4}$/.test(parts.postal)) return json({ error: 'Add your 4-digit postal code.' }, 400);
  customer.addressParts = parts;
  customer.address = [parts.store, parts.line1, parts.line2, [parts.suburb, parts.city].filter(Boolean).join(', '), [parts.province, parts.postal].filter(Boolean).join(', ')]
    .filter(Boolean).join('\n') + (parts.notes ? '\nNotes: ' + parts.notes : '');

  const total = lines.reduce((a, l) => a + l.price * l.qty, 0) + ship.fee;   // rand
  const ref = newRef(), id = crypto.randomUUID(), drop = clean(body.drop, 60);
  const site = (ENV.SITE_URL || 'https://zantebeauty.co.za').replace(/\/+$/, '');
  const back = (r) => `${site}/order?ref=${ref}&r=${r}`;

  // 1. save the order first, so a payment can always be matched to it
  await db(ENV, 'POST', 'orders', {
    id, ref, status: 'new', items: lines, delivery: { id: body.ship, ...ship }, customer,
    amount_cents: total * 100, drop_name: drop,
  });

  // 2. create the Yoco checkout (the order id doubles as the idempotency key)
  const res = await fetch(YOCO, {
    method: 'POST',
    headers: { Authorization: `Bearer ${ENV.YOCO_SECRET_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': id },
    body: JSON.stringify({
      amount: total * 100, currency: 'ZAR',
      successUrl: back('success'), cancelUrl: back('cancel'), failureUrl: back('failed'),
      metadata: { orderRef: ref, drop },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.redirectUrl || !data.id) {
    console.error('yoco create checkout failed', res.status, data && (data.errorCode || data.errorType || data.message || data.description || ''));
    await db(ENV, 'PATCH', `orders?ref=eq.${ref}`, { status: 'not_started', updated_at: new Date().toISOString() }).catch(() => {});
    return json({ error: 'Card payment is not available right now. Please try again, or send your order on WhatsApp.' }, 502);
  }

  // 3. keep the checkout against our own reference
  await db(ENV, 'PATCH', `orders?ref=eq.${ref}`, {
    status: 'pending', yoco_checkout_id: data.id, redirect_url: data.redirectUrl,
    processing_mode: data.processingMode || null, updated_at: new Date().toISOString(),
  });
  return json({ ref, redirectUrl: data.redirectUrl, mode: data.processingMode || null });
}

async function status(url, ENV, json) {
  const o = await findOrder(ENV, clean(url.searchParams.get('ref'), 20));
  if (!o) return json({ error: 'Order not found.' }, 404);
  if (o.status !== 'paid' && o.yoco_checkout_id && ENV.YOCO_SECRET_KEY) {
    const res = await fetch(`${YOCO}/${encodeURIComponent(o.yoco_checkout_id)}`, { headers: { Authorization: `Bearer ${ENV.YOCO_SECRET_KEY}` } });
    const c = await res.json().catch(() => ({}));
    if (res.ok) {
      const ys = String(c.status || '').toLowerCase();
      const next = PAID.includes(ys) ? 'paid' : (['expired', 'cancelled', 'canceled', 'failed'].includes(ys) ? ys : o.status);
      if (next !== o.status || ys !== o.yoco_status) {
        const now = new Date().toISOString();
        await db(ENV, 'PATCH', `orders?ref=eq.${o.ref}`, { status: next, yoco_status: ys || null, yoco_payment_id: c.paymentId || null, updated_at: now });
        Object.assign(o, { status: next, yoco_status: ys || null, yoco_payment_id: c.paymentId || null, updated_at: now });
      }
      if (o.status === 'paid' && !o.receipt_sent_at) await sendReceipts(ENV, o);
    } else {
      console.error('yoco get checkout failed', res.status);
    }
  }
  const cu = o.customer || {}, d = o.delivery || {};
  const out = {
    ref: o.ref, status: o.status, amount: o.amount_cents / 100, drop: o.drop_name || '',
    subtotal: (o.items || []).reduce((sum, l) => sum + l.price * l.qty, 0),
    items: (o.items || []).map((l) => ({ name: l.name, len: l.len, qty: l.qty, price: l.price })),
    delivery: { name: d.name, fee: d.fee, time: d.time, kind: d.kind || 'door' },
    firstName: cu.firstName || (cu.name || '').split(' ')[0] || '',
    receipt: cu.receipt || [],
    emailMasked: maskEmail(cu.email),
    receiptSent: !!o.receipt_sent_at,
    createdAt: o.created_at || null,
  };
  // the full receipt only once the order is paid (the reference is long and random, and contact details stay masked)
  if (o.status === 'paid') {
    Object.assign(out, {
      paidAt: o.updated_at || null, paymentRef: o.yoco_payment_id || '', mode: o.processing_mode || '',
      customer: { name: cu.name || '', emailMasked: maskEmail(cu.email), phoneMasked: maskPhone(cu.phone), address: cu.address || '' },
    });
  }
  return json(out);
}

function maskPhone(p) {
  const n = String(p || '').replace(/\D/g, '');
  return n.length >= 6 ? n.slice(0, 3) + ' ••• ' + n.slice(-3) : '';
}

function maskEmail(e) {
  const m = String(e || '').match(/^([^@]{1,2})[^@]*(@.+)$/);
  return m ? m[1] + '•••' + m[2] : '';
}

const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const rand = (n) => 'R' + Number(n).toLocaleString('en-ZA').replace(/,/g, ' ');

function receiptHtml(o) {
  const cu = o.customer || {}, d = o.delivery || {}, items = o.items || [];
  const sub = items.reduce((sum, l) => sum + l.price * l.qty, 0);
  const when = new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const td = 'padding:8px 6px;border-bottom:1px solid #eee;', th = 'padding:6px;border-bottom:1px solid #ccc;font-size:12px;color:#777;text-transform:uppercase;';
  const rows = items.map((l) => `<tr><td style="${td}">${esc(l.name)}${l.len ? ', ' + l.len + '"' : ''}</td><td style="${td}text-align:center">${l.qty}</td>` +
    `<td style="${td}text-align:right">${rand(l.price)}</td><td style="${td}text-align:right">${rand(l.price * l.qty)}</td></tr>`).join('');
  const atStore = d.kind && d.kind !== 'door';
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#39343D;font-size:14px;line-height:1.5">
  <table width="100%" style="border-collapse:collapse"><tr>
    <td><div style="font-size:22px;font-weight:bold;color:#8E5C7F;letter-spacing:1px">ZANTE BEAUTY</div>
    <div style="font-size:12px;color:#777">Zamasante Suppliers (Pty) Ltd · Reg. 2021/430581/07<br>zantebeauty@outlook.com · WhatsApp +27 68 695 4639 · zantebeauty.co.za</div></td>
    <td style="text-align:right;vertical-align:top"><span style="display:inline-block;padding:4px 12px;border-radius:999px;background:#E3F3E8;color:#2E7D4F;font-weight:bold">PAID</span></td>
  </tr></table>
  <h2 style="margin:20px 0 4px">Receipt</h2>
  <p style="margin:0 0 16px">Thank you, ${esc(cu.firstName || '')}. Your payment is received.</p>
  <table width="100%" style="border-collapse:collapse;font-size:13px;margin-bottom:16px">
    <tr><td style="color:#777;width:38%">Order number</td><td><b>${esc(o.ref)}</b></td></tr>
    <tr><td style="color:#777">Date paid</td><td>${when}</td></tr>
    <tr><td style="color:#777">Payment</td><td>Card, through Yoco${o.yoco_payment_id ? ' (reference ' + esc(o.yoco_payment_id) + ')' : ''}</td></tr>
    <tr><td style="color:#777">Drop</td><td>${esc(o.drop_name || 'The next drop')}</td></tr>
  </table>
  <table width="100%" style="border-collapse:collapse;margin-bottom:16px"><tr>
    <td style="vertical-align:top;width:50%;padding-right:10px"><b>Customer</b><br>${esc(cu.name || '')}<br>${esc(cu.email || '')}<br>${esc(cu.phone || '')}</td>
    <td style="vertical-align:top;width:50%"><b>${atStore ? 'Collect from' : 'Deliver to'}</b><br>${esc(cu.address || '').replace(/\n/g, '<br>')}</td>
  </tr></table>
  <table width="100%" style="border-collapse:collapse">
    <tr><th align="left" style="${th}">Item</th><th style="${th}">Qty</th><th align="right" style="${th}">Price</th><th align="right" style="${th}">Total</th></tr>${rows}
    <tr><td colspan="3" style="padding:8px 6px;text-align:right">Subtotal</td><td style="padding:8px 6px;text-align:right">${rand(sub)}</td></tr>
    <tr><td colspan="3" style="padding:8px 6px;text-align:right">Delivery: ${esc(d.name || '')} (${esc(d.time || '')})</td><td style="padding:8px 6px;text-align:right">${rand(d.fee || 0)}</td></tr>
    <tr><td colspan="3" style="padding:10px 6px;text-align:right;font-weight:bold;border-top:2px solid #39343D">Total paid</td><td style="padding:10px 6px;text-align:right;font-weight:bold;border-top:2px solid #39343D">${rand(o.amount_cents / 100)}</td></tr>
  </table>
  <p style="margin:18px 0 6px"><b>What happens next</b><br>Your order is part of ${esc(o.drop_name || 'the next drop')}. It is made, checked and pre-washed by us, then delivered within 3 to 4 weeks after the drop closes. We send tracking when it ships.</p>
  <p style="margin:0 0 6px"><b>Returns</b><br>7-day cooling-off period on unworn units with seals intact, and a 6-month guarantee on defects. Full terms: zantebeauty.co.za/terms</p>
  <p style="font-size:12px;color:#777;margin-top:18px">Questions? WhatsApp +27 68 695 4639 or reply to this email.</p>
</div>`;
}

async function sendEmail(ENV, to, subject, html) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${ENV.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: ENV.RECEIPT_FROM, to: [to], subject, html, reply_to: ENV.SHOP_EMAIL || 'zantebeauty@outlook.com' }),
  });
  if (!res.ok) throw new Error('email ' + res.status);
}

// Email receipts once a payment is confirmed (only when an email service is set up). WhatsApp receipts are sent by the shop.
async function sendReceipts(ENV, o) {
  if (!ENV.RESEND_API_KEY || !ENV.RECEIPT_FROM) return;
  const cu = o.customer || {}, html = receiptHtml(o);
  try {
    if ((cu.receipt || []).includes('email') && cu.email) await sendEmail(ENV, cu.email, `Your Zante Beauty receipt, ${o.ref}`, html);
    await sendEmail(ENV, ENV.SHOP_EMAIL || 'zantebeauty@outlook.com', `New paid order ${o.ref}: ${rand(o.amount_cents / 100)}`, html);
    await db(ENV, 'PATCH', `orders?ref=eq.${o.ref}`, { receipt_sent_at: new Date().toISOString() });
    o.receipt_sent_at = new Date().toISOString();
  } catch (e) {
    console.error('receipt email failed', e && e.message);
  }
}

async function link(url, ENV, json) {
  const o = await findOrder(ENV, clean(url.searchParams.get('ref'), 20));
  if (!o || !o.redirect_url) return json({ error: 'This payment link is not valid.' }, 404);
  if (o.status === 'paid') return json({ error: 'This order is already paid. Thank you!', paid: true }, 409);
  return json({ redirectUrl: o.redirect_url });
}

export async function handler(req, ENV) {
  const origin = req.headers.get('origin') || '';
  const allowed = (ENV.ALLOWED_ORIGINS || 'https://zantebeauty.co.za,https://www.zantebeauty.co.za').split(',').map((s) => s.trim()).filter(Boolean);
  const cors = {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
  const json = (body, code = 200) => new Response(JSON.stringify(body), { status: code, headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  const url = new URL(req.url);
  const route = url.pathname.replace(/\/+$/, '').split('/').pop();
  try {
    if (route === 'checkout' && req.method === 'POST') return await createCheckout(req, ENV, json);
    if (route === 'status' && req.method === 'GET') return await status(url, ENV, json);
    if (route === 'link' && req.method === 'GET') return await link(url, ENV, json);
    return json({ error: 'Not found.' }, 404);
  } catch (e) {
    console.error('yoco function error', e && e.message);
    return json({ error: 'Something went wrong. Please try again, or send your order on WhatsApp.' }, 500);
  }
}

if (typeof Deno !== 'undefined') Deno.serve((req) => handler(req, Deno.env.toObject()));
