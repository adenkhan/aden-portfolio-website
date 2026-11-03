// Contact form endpoint (Vercel serverless function). The static form posts here natively, with or
// without JavaScript. It emails the message through Resend and redirects to /thanks/.
// Set RESEND_API_KEY (and optionally CONTACT_TO) in the Vercel project's environment variables.
const TO = process.env.CONTACT_TO || "aden.khan613@gmail.com";
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Use the contact form.");
  }
  const body = typeof req.body === "string" ? Object.fromEntries(new URLSearchParams(req.body)) : (req.body ?? {});
  // Honeypot: bots fill it, people never see it. Pretend it worked.
  if (body["bot-field"]) return res.redirect(303, "/thanks/");
  const name = String(body.name ?? "").trim().slice(0, 200);
  const email = String(body.email ?? "").trim().slice(0, 200);
  const message = String(body.message ?? "").trim().slice(0, 5000);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) return res.redirect(303, "/contact/");
  const key = process.env.RESEND_API_KEY;
  const failed = () =>
    res
      .status(502)
      .setHeader("Content-Type", "text/html; charset=utf-8")
      .send(`<!doctype html><meta charset="utf-8"><title>Message not sent</title><p>The message could not be sent. Email <a href="mailto:${TO}">${TO}</a> instead.</p>`);
  if (!key) return failed();
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Portfolio contact <onboarding@resend.dev>",
        to: [TO],
        reply_to: email,
        subject: `Portfolio message from ${name}`,
        html: `<p><b>${esc(name)}</b> (${esc(email)})</p><p>${esc(message).replace(/\n/g, "<br>")}</p>`,
      }),
    });
    if (!r.ok) return failed();
  } catch {
    return failed();
  }
  return res.redirect(303, "/thanks/");
}
