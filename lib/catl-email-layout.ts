export const CATL_CONTACT = {
  name: "Balog Sebastian Máté",
  role: "Developer, Pannon Transfer",
  email: "balogh.sebastian@pannonguard.hu",
  phone: "+36 30 665 4135",
  phoneHref: "+36306654135",
};

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function catlEmailButton(href: string, label: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:30px;"><tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td align="center" bgcolor="#0047BA" style="border-radius:8px;">
<a href="${href}" style="display:inline-block; padding:16px 42px; font-size:14px; font-weight:700; color:#FFFFFF; text-decoration:none; letter-spacing:.6px; border-radius:8px;">${label}</a>
</td></tr></table></td></tr></table>`;
}

export function catlEmailInfoRow(
  left: { label: string; value: string },
  right: { label: string; value: string }
) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; margin-bottom:26px;"><tr>
<td width="50%" valign="top" style="padding:18px 20px; border-right:1px solid #E2E8F0;">
<div style="font-size:10px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:#94A3B8; margin-bottom:6px;">${esc(left.label)}</div>
<div style="font-size:14px; font-weight:600; color:#0F172A; word-break:break-all;">${esc(left.value)}</div>
</td>
<td width="50%" valign="top" style="padding:18px 20px;">
<div style="font-size:10px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:#94A3B8; margin-bottom:6px;">${esc(right.label)}</div>
<div style="font-size:14px; font-weight:600; color:#0F172A;">${esc(right.value)}</div>
</td></tr></table>`;
}

/** Professional CATL-branded email shell (English). `origin` is the absolute site origin used for logo URLs. */
export function catlEmailShell(opts: {
  origin: string;
  preheader: string;
  eyebrow: string;
  headline: string;
  bodyHtml: string;
  topRight?: string;
}) {
  const year = new Date().getFullYear();
  const origin = opts.origin.replace(/\/$/, "");
  const ptLogo = origin ? `${origin}/brand/pannon-transfer-logo.png` : "";
  const catlLogo = origin ? `${origin}/partners/catl/logo.png` : "";

  const logos =
    ptLogo && catlLogo
      ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:26px;"><tr>
<td valign="middle" style="background:#FFFFFF; border-radius:8px; padding:9px 14px;"><img src="${ptLogo}" width="120" height="24" alt="Pannon Transfer" style="display:block; border:0; height:24px; width:120px;"></td>
<td width="14"></td>
<td valign="middle" style="background:#FFFFFF; border-radius:8px; padding:7px 14px;"><img src="${catlLogo}" width="70" height="23" alt="CATL" style="display:block; border:0; height:23px; width:70px;"></td>
</tr></table>`
      : `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:26px;"><tr><td style="background:#FFFFFF; border-radius:8px; padding:9px 16px; font-size:16px; font-weight:900; color:#0047BA;">CATL</td></tr></table>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light only" />
<title>${esc(opts.headline.replace(/<[^>]+>/g, " "))}</title>
</head>
<body style="margin:0; padding:0; background:#EEF1F6; font-family:'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;">
<div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">${esc(opts.preheader)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#EEF1F6"><tr><td align="center" style="padding:36px 14px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;">
<tr><td style="padding:0 6px 14px 6px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="font-size:12px; font-weight:700; letter-spacing:2.4px; text-transform:uppercase; color:#64748B;">Pannon Transfer</td>
<td align="right" style="font-size:12px; color:#94A3B8;">${esc(opts.topRight || "CATL Dedicated Portal")}</td>
</tr></table>
</td></tr>
<tr><td style="background:#FFFFFF; border-radius:14px; overflow:hidden; box-shadow:0 1px 3px rgba(15,23,42,.08);">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td bgcolor="#0B1220" style="padding:34px 40px 32px 40px; border-bottom:4px solid #0047BA;">
${logos}
<div style="font-size:11px; font-weight:700; letter-spacing:2.6px; text-transform:uppercase; color:#60A5FA; margin-bottom:8px;">${esc(opts.eyebrow)}</div>
<div style="font-family:Georgia, 'Times New Roman', serif; font-size:24px; line-height:1.3; color:#FFFFFF;">${opts.headline}</div>
</td></tr>
<tr><td style="padding:38px 40px 8px 40px;">
${opts.bodyHtml}
</td></tr>
<tr><td style="padding:0 40px 38px 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #E2E8F0;"><tr><td style="padding-top:24px;">
<div style="font-size:10px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:#94A3B8; margin-bottom:12px;">Your contact</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="46" valign="top" style="width:46px;"><div style="width:46px; height:46px; line-height:46px; text-align:center; background:#0B1220; border-radius:23px; color:#FFFFFF; font-size:16px; font-weight:700;">BS</div></td>
<td valign="top" style="padding-left:14px; font-size:13px; line-height:1.65; color:#475569;">
<div style="font-size:15px; font-weight:700; color:#0F172A;">Balog Sebastian M&aacute;t&eacute;</div>
<div>${CATL_CONTACT.role}</div>
<div><a href="mailto:${CATL_CONTACT.email}" style="color:#0047BA; text-decoration:none;">${CATL_CONTACT.email}</a></div>
<div><a href="tel:${CATL_CONTACT.phoneHref}" style="color:#0047BA; text-decoration:none;">${CATL_CONTACT.phone}</a></div>
</td></tr></table>
</td></tr></table>
</td></tr>
<tr><td bgcolor="#F8FAFC" style="padding:24px 40px; border-top:1px solid #E2E8F0;">
<p style="margin:0; font-size:11px; line-height:1.7; color:#94A3B8; text-align:center;">
This message was sent by the Pannon Transfer Komplex system. If you did not expect it, please disregard it.<br>
&copy; ${year} Pannon Transfer. All rights reserved.
</p>
</td></tr>
</table></td></tr></table>
</td></tr></table>
</body></html>`;
  return html;
}
