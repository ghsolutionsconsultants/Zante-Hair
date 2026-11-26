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
  pnp: { name: 'Pick n Pay store to door', fee: 90, time: '24 to 72 hours' },
  paxi: { name: 'PAXI store to store', fee: 60, time: '7 to 9 days' },
  'paxi-fast': { name: 'PAXI store to store, faster', fee: 110, time: '3 to 5 days' },
  postnet: { name: 'PostNet to PostNet', fee: 109, time: '2 to 3 working days to main centres' },
};
// TEST PRODUCT (remove after testing): R2 item, Yoco's minimum, with a R0 delivery option for test-only orders.
const TEST_ITEM = { name: 'Payment test item', price: 2 };
const SHIP_TEST = { name: 'No delivery (test order)', fee: 0, time: 'Test only' };
// Yoco checkout statuses that mean the customer has paid.
const PAID = ['completed', 'succeeded', 'paid'];
const REF = /^ZB-[A-HJ-NP-Z2-9]{10}$/;

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
    phone: clean(c.phone, 20), address: clean(c.address, 300), mapUrl: clean(c.mapUrl, 600), receipt: [...new Set(receipt)],
  };
  customer.name = (customer.firstName + ' ' + customer.surname).trim();
  if (!customer.firstName) return json({ error: 'Add your first name.' }, 400);
  if (!customer.surname) return json({ error: 'Add your surname.' }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(customer.email)) return json({ error: 'Add a valid email address.' }, 400);
  if (customer.phone.replace(/\D/g, '').length < 9) return json({ error: 'Add a valid cellphone number.' }, 400);
  if (!customer.receipt.length) return json({ error: 'Choose how we send your receipt: email, WhatsApp or both.' }, 400);
  if (customer.address.length < 4) return json({ error: 'Add your address or collection point.' }, 400);
  if (!/^https:\/\/www\.google\.com\/maps\//.test(customer.mapUrl)) customer.mapUrl = '';

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
        await db(ENV, 'PATCH', `orders?ref=eq.${o.ref}`, { status: next, yoco_status: ys || null, yoco_payment_id: c.paymentId || null, updated_at: new Date().toISOString() });
        o.status = next;
      }
      if (o.status === 'paid' && !o.receipt_sent_at) await sendReceipts(ENV, o);
    } else {
      console.error('yoco get checkout failed', res.status);
    }
  }
  return json({
    ref: o.ref, status: o.status, amount: o.amount_cents / 100, drop: o.drop_name || '',
    items: (o.items || []).map((l) => ({ name: l.name, len: l.len, qty: l.qty, price: l.price })),
    delivery: { name: o.delivery && o.delivery.name, fee: o.delivery && o.delivery.fee, time: o.delivery && o.delivery.time },
    firstName: (o.customer && (o.customer.firstName || (o.customer.name || '').split(' ')[0])) || '',
    receipt: (o.customer && o.customer.receipt) || [],
    emailMasked: maskEmail(o.customer && o.customer.email),
    receiptSent: !!o.receipt_sent_at,
  });
}

function maskEmail(e) {
  const m = String(e || '').match(/^([^@]{1,2})[^@]*(@.+)$/);
  return m ? m[1] + '•••' + m[2] : '';
}

const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const rand = (n) => 'R' + Number(n).toLocaleString('en-ZA').replace(/,/g, ' ');

function receiptHtml(o) {
  const cu = o.customer || {}, d = o.delivery || {};
  const rows = (o.items || []).map((l) => `<tr><td>${esc(l.name)}, ${l.len}"${l.qty > 1 ? ' × ' + l.qty : ''}</td><td align="right">${rand(l.price * l.qty)}</td></tr>`).join('');
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#39343D">
  <h2 style="margin:0 0 4px">Zante Beauty: order receipt</h2>
  <p style="margin:0 0 16px">Thank you, ${esc(cu.firstName || '')}. Your payment is received.</p>
  <p><b>Order reference:</b> ${esc(o.ref)}<br><b>Date:</b> ${new Date().toLocaleDateString('en-ZA')}<br><b>Drop:</b> ${esc(o.drop_name || '')}</p>
  <table width="100%" cellpadding="6" style="border-collapse:collapse;border-top:1px solid #ddd;border-bottom:1px solid #ddd">${rows}
  <tr><td>${esc(d.name || 'Delivery')} (${esc(d.time || '')})</td><td align="right">${rand(d.fee || 0)}</td></tr>
  <tr><td><b>Total paid by card</b></td><td align="right"><b>${rand(o.amount_cents / 100)}</b></td></tr></table>
  <p><b>Deliver to:</b> ${esc(cu.name || '')}, ${esc(cu.phone || '')}<br>${esc(cu.address || '')}</p>
  <p style="font-size:12px;color:#777">Questions? WhatsApp +27 68 695 4639 or reply to this email.<br>
  Zante Beauty, a trading name of Zamasante Suppliers (Pty) Ltd. Reg. 2021/430581/07.</p></div>`;
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
