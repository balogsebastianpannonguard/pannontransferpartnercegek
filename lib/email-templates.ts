export function buildCustomerConfirmationEmail(params: {
  bookingCode: string;
  travelerName: string;
  userEmail: string;
  travelerEmail: string;
  pickupDate: string;
  pickupTime: string;
  fromAddress: string;
  toAddress: string;
  travelers: number;
  luggage: number;
  transferType: 'standard' | 'executive';
  paymentMethod: 'card' | 'bank';
  comment?: string;
  price?: number;
}): string {
  const {
    bookingCode,
    travelerName,
    userEmail,
    travelerEmail,
    pickupDate,
    pickupTime,
    fromAddress,
    toAddress,
    travelers,
    luggage,
    transferType,
    paymentMethod,
    comment,
    price,
  } = params;

  const transferTypeLabel = transferType === 'executive' ? 'EXECUTIVE' : 'STANDARD';
  const transferTypeBg = transferType === 'executive' ? '#FAF6EE' : '#F0ECE6';
  const transferTypeBorder = transferType === 'executive' ? '#E6D9B8' : '#E8E3DA';
  const transferTypeColor = transferType === 'executive' ? '#C9A962' : '#4A4A4A';
  const paymentMethodLabel = paymentMethod === 'card' ? 'Bankkártya' : 'Banki átutalás';
  const priceDisplay = price !== undefined ? `${price.toLocaleString('hu-HU')} Ft` : 'Egyeztetés alatt';

  return `<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Foglalás visszaigazolása · #${bookingCode} · Pannon Transfer</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF8F5;font-family:Arial,Helvetica,sans-serif;min-width:100%;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FAF8F5;padding:48px 16px;">
<tr>
<td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;">
<tr>
<td style="background-color:#0B1A2A;border:1px solid #0B1A2A;border-radius:12px 12px 0 0;padding:0;height:80px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="height:80px;">
<tr>
<td align="center" valign="middle" style="padding:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:36px;height:36px;border:4px solid #C9A962;border-radius:4px;">
<tr>
<td align="center" valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;color:#C9A962;">P</td>
</tr>
</table>
</td>
</tr>
<tr>
<td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#C9A962;letter-spacing:4px;text-transform:uppercase;padding-top:6px;">PANNON TRANSFER</td>
</tr>
<tr>
<td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:500;color:#7A7A7A;letter-spacing:6px;text-transform:uppercase;padding-top:3px;">EXECUTIVE TRAVEL</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="height:1px;background-color:#C9A962;font-size:0;line-height:0;"></td>
</tr>
<tr>
<td style="background-color:#FFFFFF;border-left:1px solid #E8E3DA;border-right:1px solid #E8E3DA;padding:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="padding-left:48px;padding-right:48px;">
<tr>
<td style="padding-top:32px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;color:#1A1A1A;line-height:1.3;">Foglalás visszaigazolása</td>
</tr>
<tr>
<td style="padding-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#7A7A7A;line-height:1.6;">
  ${userEmail === travelerEmail
    ? `Kedves ${travelerName}! Köszönjük, hogy a Pannon Transfert választotta.`
    : `Kedves Partnerünk! Köszönjük, hogy <strong>${travelerName}</strong> részére rögzítette a foglalást.`}
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding-top:24px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:#FAF6EE;border:1px solid #E6D9B8;border-radius:999px;padding:10px 24px;">
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:600;color:#C9A962;letter-spacing:2px;text-transform:uppercase;padding-right:12px;">FOGLALÁS KÓD</td>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:#1A1A1A;">#${bookingCode}</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding-top:16px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:#F4F7F4;border:1px solid #D9E2D9;border-radius:999px;padding:8px 20px;">
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;color:#3A523A;letter-spacing:1.5px;text-transform:uppercase;">FOGADVA · jóváhagyásra vár</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding-top:28px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FFFFFF;border:1px solid #E8E3DA;border-radius:8px;">
<tr>
<td style="padding:32px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;color:#C9A962;letter-spacing:2px;text-transform:uppercase;padding-bottom:24px;">UTAZÁS RÉSZLETEI</td>
</tr>
<tr>
<td>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td width="50%" valign="top" style="padding-right:24px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:600;color:#7A7A7A;letter-spacing:1.5px;text-transform:uppercase;padding-bottom:6px;">📅 DÁTUM</td>
</tr>
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;color:#1A1A1A;padding-bottom:18px;">${pickupDate}</td>
</tr>
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:600;color:#7A7A7A;letter-spacing:1.5px;text-transform:uppercase;padding-bottom:6px;">🕒 IDŐPONT</td>
</tr>
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;color:#C9A962;">${pickupTime}</td>
</tr>
</table>
</td>
<td width="50%" valign="top" style="padding-left:24px;border-left:1px solid #F0ECE6;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="padding-left:24px;">
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:600;color:#7A7A7A;letter-spacing:1.5px;text-transform:uppercase;padding-bottom:6px;">Indulás</td>
</tr>
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#1A1A1A;line-height:1.5;padding-bottom:12px;">✦ ${fromAddress}</td>
</tr>
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#C9A962;padding-bottom:12px;">&nbsp;&nbsp;·</td>
</tr>
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:600;color:#7A7A7A;letter-spacing:1.5px;text-transform:uppercase;padding-bottom:6px;">Érkezés</td>
</tr>
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#1A1A1A;line-height:1.5;">${toAddress}</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding-top:24px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td style="padding-bottom:12px;border-bottom:1px solid #F0ECE6;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td width="50%" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#7A7A7A;">Utasok száma</td>
<td width="50%" align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;color:#C9A962;">${travelers} fő</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding-top:12px;padding-bottom:12px;border-bottom:1px solid #F0ECE6;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td width="50%" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#7A7A7A;">Csomagok száma</td>
<td width="50%" align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;color:#1A1A1A;">${luggage} db</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding-top:12px;padding-bottom:12px;border-bottom:1px solid #F0ECE6;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td width="50%" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#7A7A7A;vertical-align:middle;">Szolgáltatás szint</td>
<td width="50%" align="right">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-block;">
<tr>
<td style="background-color:${transferTypeBg};border:1px solid ${transferTypeBorder};border-radius:4px;padding:6px 14px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:${transferTypeColor};letter-spacing:1.5px;text-transform:uppercase;">${transferTypeLabel}</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding-top:12px;padding-bottom:12px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td width="50%" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#7A7A7A;">Fizetési mód</td>
<td width="50%" align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;color:#1A1A1A;">${paymentMethodLabel}</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
${price !== undefined ? `
<tr>
<td style="padding-top:24px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FAF8F5;border:1px solid #E8E3DA;border-radius:8px;">
<tr>
<td style="padding:20px 24px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;color:#7A7A7A;letter-spacing:1.5px;text-transform:uppercase;padding-bottom:6px;">Végösszeg</td>
</tr>
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:700;color:#C9A962;">${priceDisplay}</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
` : ''}
${comment ? `
<tr>
<td style="padding-top:24px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FAF6EE;border-left:3px solid #C9A962;border-radius:0 8px 8px 0;">
<tr>
<td style="padding:18px 24px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;color:#C9A962;letter-spacing:1.5px;text-transform:uppercase;padding-bottom:8px;">MEGJEGYZÉS</td>
</tr>
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-style:italic;color:#4A4A4A;line-height:1.6;">${comment}</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
` : ''}
<tr>
<td style="padding-top:32px;padding-bottom:40px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:#0B1A2A;border-radius:4px;">
<tr>
<td align="center" style="padding:0 48px;height:44px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#FFFFFF;letter-spacing:2px;text-transform:uppercase;line-height:44px;">FOGLALÁS RÉSZLETEI</td>
</tr>
<tr>
<td style="height:2px;background-color:#C9A962;font-size:0;line-height:0;"></td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="height:1px;background-color:#C9A962;font-size:0;line-height:0;"></td>
</tr>
<tr>
<td style="background-color:#0B1A2A;border:1px solid #0B1A2A;border-radius:0 0 12px 12px;padding:40px 48px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:24px;height:24px;border:2px solid #C9A962;border-radius:3px;">
<tr>
<td align="center" valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#C9A962;">P</td>
</tr>
</table>
</td>
</tr>
<tr>
<td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#C9A962;letter-spacing:3px;text-transform:uppercase;padding-top:12px;">PANNON TRANSFER</td>
</tr>
<tr>
<td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#7A7A7A;line-height:1.6;padding-top:10px;">✉ minimalwebsoft@gmail.com &nbsp;·&nbsp; ☏ +36 30 665 4135</td>
</tr>
<tr>
<td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#7A7A7A;line-height:1.6;padding-top:12px;">© 2026 Pannon Transfer Executive Travel. Minden jog fenntartva.</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`;
}

export function buildDispatcherNotificationEmail(params: {
  bookingCode: string;
  travelerName: string;
  travelerEmail: string;
  travelerPhone: string;
  companyName: string;
  pickupDate: string;
  pickupTime: string;
  fromAddress: string;
  toAddress: string;
  flightNumber?: string;
  travelers: number;
  luggage: number;
  transferType: string;
}): string {
  const {
    bookingCode,
    travelerName,
    travelerEmail,
    travelerPhone,
    companyName,
    pickupDate,
    pickupTime,
    fromAddress,
    toAddress,
    flightNumber,
    travelers,
    luggage,
    transferType,
  } = params;

  const transferTypeUpper = transferType.toUpperCase();

  return `<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Új foglalás érkezett · #${bookingCode} · Pannon Transfer</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF8F5;font-family:Arial,Helvetica,sans-serif;min-width:100%;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FAF8F5;padding:48px 16px;">
<tr>
<td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;">
<tr>
<td style="background-color:#0B1A2A;border:1px solid #0B1A2A;border-radius:12px 12px 0 0;padding:0;height:80px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="height:80px;">
<tr>
<td align="center" valign="middle" style="padding:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:36px;height:36px;border:4px solid #C9A962;border-radius:4px;">
<tr>
<td align="center" valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;color:#C9A962;">P</td>
</tr>
</table>
</td>
</tr>
<tr>
<td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#C9A962;letter-spacing:4px;text-transform:uppercase;padding-top:6px;">PANNON TRANSFER</td>
</tr>
<tr>
<td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:500;color:#7A7A7A;letter-spacing:6px;text-transform:uppercase;padding-top:3px;">EXECUTIVE TRAVEL</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="height:1px;background-color:#C9A962;font-size:0;line-height:0;"></td>
</tr>
<tr>
<td style="background-color:#FFFFFF;border-left:1px solid #E8E3DA;border-right:1px solid #E8E3DA;padding:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="padding-left:48px;padding-right:48px;">
<tr>
<td style="padding-top:32px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td>
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td style="width:3px;background-color:#C9A962;border-radius:2px;"></td>
<td style="padding-left:12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#C9A962;letter-spacing:4px;text-transform:uppercase;">ÚJ FOGLALÁS ÉRKEZETT</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding-top:14px;font-family:Arial,Helvetica,sans-serif;font-size:28px;font-weight:700;color:#1A1A1A;line-height:1.2;">#${bookingCode}</td>
</tr>
<tr>
<td style="padding-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#7A7A7A;line-height:1.6;">A következő ügyfél új foglalást küldött be, kérjük kezelje prioritásban.</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding-top:28px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FFFFFF;border:1px solid #E8E3DA;border-radius:8px;">
<tr>
<td style="padding:28px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;color:#C9A962;letter-spacing:2px;text-transform:uppercase;padding-bottom:20px;">ÜGYFÉL ADATAI</td>
</tr>
<tr>
<td>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td width="50%" valign="top" style="padding-right:16px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:600;color:#7A7A7A;letter-spacing:1.5px;text-transform:uppercase;padding-bottom:4px;">Név</td>
</tr>
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#1A1A1A;padding-bottom:16px;">${travelerName}</td>
</tr>
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:600;color:#7A7A7A;letter-spacing:1.5px;text-transform:uppercase;padding-bottom:4px;">Cég</td>
</tr>
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#1A1A1A;">${companyName}</td>
</tr>
</table>
</td>
<td width="50%" valign="top" style="padding-left:16px;border-left:1px solid #F0ECE6;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="padding-left:16px;">
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:600;color:#7A7A7A;letter-spacing:1.5px;text-transform:uppercase;padding-bottom:4px;">Telefon</td>
</tr>
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#0B1A2A;padding-bottom:16px;">☏ ${travelerPhone}</td>
</tr>
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:600;color:#7A7A7A;letter-spacing:1.5px;text-transform:uppercase;padding-bottom:4px;">E-mail</td>
</tr>
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#0B1A2A;word-break:break-all;">✉ ${travelerEmail}</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding-top:20px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FFFFFF;border:1px solid #E8E3DA;border-radius:8px;">
<tr>
<td style="padding:28px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;color:#C9A962;letter-spacing:2px;text-transform:uppercase;padding-bottom:20px;">UTAZÁS RÉSZLETEI</td>
</tr>
<tr>
<td>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td width="50%" valign="top" style="padding-right:24px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:600;color:#7A7A7A;letter-spacing:1.5px;text-transform:uppercase;padding-bottom:6px;">📅 DÁTUM</td>
</tr>
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;color:#1A1A1A;padding-bottom:16px;">${pickupDate}</td>
</tr>
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:600;color:#7A7A7A;letter-spacing:1.5px;text-transform:uppercase;padding-bottom:6px;">🕒 IDŐPONT</td>
</tr>
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;color:#C9A962;padding-bottom:18px;">${pickupTime}</td>
</tr>
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:600;color:#7A7A7A;letter-spacing:1.5px;text-transform:uppercase;padding-bottom:4px;">Szolgáltatás</td>
</tr>
<tr>
<td>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-block;">
<tr>
<td style="background-color:#FAF6EE;border:1px solid #E6D9B8;border-radius:4px;padding:6px 14px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#C9A962;letter-spacing:1.5px;text-transform:uppercase;">${transferTypeUpper}</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
<td width="50%" valign="top" style="padding-left:24px;border-left:1px solid #F0ECE6;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="padding-left:24px;">
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:600;color:#7A7A7A;letter-spacing:1.5px;text-transform:uppercase;padding-bottom:6px;">Indulás</td>
</tr>
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#1A1A1A;line-height:1.5;padding-bottom:12px;">✦ ${fromAddress}</td>
</tr>
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#C9A962;padding-bottom:12px;">&nbsp;&nbsp;·</td>
</tr>
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:600;color:#7A7A7A;letter-spacing:1.5px;text-transform:uppercase;padding-bottom:6px;">Érkezés</td>
</tr>
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#1A1A1A;line-height:1.5;padding-bottom:18px;">${toAddress}</td>
</tr>
${flightNumber ? `<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:600;color:#7A7A7A;letter-spacing:1.5px;text-transform:uppercase;padding-top:12px;padding-bottom:6px;">Járatszám</td>
</tr>
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#0B1A2A;">✈ ${flightNumber}</td>
</tr>` : ''}
<tr>
<td>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td width="50%" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#7A7A7A;">Utasok</td>
<td width="50%" align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;color:#C9A962;">${travelers} fő</td>
</tr>
<tr>
<td style="height:8px;"></td>
</tr>
<tr>
<td width="50%" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#7A7A7A;">Csomagok</td>
<td width="50%" align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;color:#1A1A1A;">${luggage} db</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding-top:28px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#C9A962;border-radius:4px;">
<tr>
<td align="center" style="padding:0 24px;height:44px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#0B1A2A;letter-spacing:2px;text-transform:uppercase;line-height:44px;">FOGLALÁS MEGTEKINTÉSE ÉS HOZZÁRENDELÉSE</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding-top:24px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FAF6EE;border-left:3px solid #C9A962;border-radius:0 8px 8px 0;">
<tr>
<td style="padding:20px 24px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;color:#C9A962;letter-spacing:1.5px;text-transform:uppercase;padding-bottom:14px;">✔ Diszpécseri ellenőrző lista</td>
</tr>
<tr>
<td>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td width="20" valign="top" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;color:#C9A962;line-height:1.8;">1.</td>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#4A4A4A;line-height:1.8;padding-bottom:4px;">Ellenőrizzük az időpontot és útvonalat</td>
</tr>
<tr>
<td width="20" valign="top" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;color:#C9A962;line-height:1.8;">2.</td>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#4A4A4A;line-height:1.8;padding-bottom:4px;">Rendeljünk hozzá megfelelő sofőrt és járművet</td>
</tr>
<tr>
<td width="20" valign="top" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;color:#C9A962;line-height:1.8;">3.</td>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#4A4A4A;line-height:1.8;padding-bottom:4px;">Állítsuk be a státuszt megerősítettre</td>
</tr>
<tr>
<td width="20" valign="top" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;color:#C9A962;line-height:1.8;">4.</td>
<td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#4A4A4A;line-height:1.8;">Küldjünk visszaigazolást az ügyfélnek</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding-top:32px;padding-bottom:40px;"></td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="height:1px;background-color:#C9A962;font-size:0;line-height:0;"></td>
</tr>
<tr>
<td style="background-color:#0B1A2A;border:1px solid #0B1A2A;border-radius:0 0 12px 12px;padding:40px 48px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:24px;height:24px;border:2px solid #C9A962;border-radius:3px;">
<tr>
<td align="center" valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#C9A962;">P</td>
</tr>
</table>
</td>
</tr>
<tr>
<td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#C9A962;letter-spacing:3px;text-transform:uppercase;padding-top:12px;">PANNON TRANSFER</td>
</tr>
<tr>
<td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#7A7A7A;line-height:1.6;padding-top:10px;">✉ minimalwebsoft@gmail.com &nbsp;·&nbsp; ☏ +36 30 665 4135</td>
</tr>
<tr>
<td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#7A7A7A;line-height:1.6;padding-top:12px;">© 2026 Pannon Transfer Executive Travel. Minden jog fenntartva.</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`;
}


export function buildNiCustomerConfirmationEmail(params: {
  bookingCode: string;
  travelerName: string;
  userEmail: string;
  travelerEmail: string;
  pickupDate: string;
  pickupTime: string;
  fromAddress: string;
  toAddress: string;
  flightNumber?: string;
  travelers: number;
  luggage: number;
  transferType: 'standard' | 'executive';
  paymentMethod: 'card' | 'bank';
  comment?: string;
  price?: number;
}): string {
  const {
    bookingCode,
    travelerName,
    userEmail,
    travelerEmail,
    pickupDate,
    pickupTime,
    fromAddress,
    toAddress,
    flightNumber,
    travelers,
    luggage,
    transferType,
    paymentMethod,
    comment,
    price,
  } = params;

  const paymentMethodLabel = paymentMethod === 'card' ? 'Bankkártya' : 'Banki átutalás';
  const transferTypeLabel = transferType === 'executive' ? 'EXECUTIVE' : 'STANDARD';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0; padding:0; background:#F3F4F6; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
<div style="display:none; max-height:0; overflow:hidden; opacity:0;">
Foglalás visszaigazolása. Útvonal: ${fromAddress} - ${toAddress}, Időpont: ${pickupDate} ${pickupTime}.
</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#F3F4F6">
  <tr>
    <td align="center" style="padding:40px 14px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;">
        <tr>
          <td style="padding-bottom:16px; text-align:center; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#94A3B8; font-weight:700;">
            Pannon Transfer · NI Portál · Foglalás
          </td>
        </tr>
        <tr>
          <td style="background:#FFFFFF; border-radius:24px; overflow:hidden; box-shadow:0 12px 40px rgba(15,23,42,0.08);">
            <!-- HEADER SECTION -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="padding:40px 32px; background:linear-gradient(135deg, #0B172D 0%, #163669 100%);">
                  
                  <!-- Tags -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                    <tr>
                      <td bgcolor="#FDF5D3" style="padding:8px 16px; border-radius:12px;">
                        <span style="font-size:16px; font-weight:900; color:#8A6B00;">NI</span>
                        <span style="font-size:13px; font-weight:700; color:#8A6B00; margin-left:6px;">Booking Confirmation</span>
                      </td>
                    </tr>
                  </table>
                  
                  <div style="display:inline-block; padding:6px 12px; margin-bottom:16px; border-radius:999px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15); font-size:10px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#E2E8F0;">
                    FOGLALÁS RÖGZÍTVE · JÓVÁHAGYÁSRA VÁR
                  </div>
                  
                  <h1 style="margin:0 0 16px 0; font-size:28px; line-height:1.2; color:#FFFFFF; font-weight:800;">
                    Foglalás visszaigazolása
                  </h1>
                  
                  <p style="margin:0 0 32px 0; font-size:15px; line-height:1.6; color:#CBD5E1;">
                    ${userEmail === travelerEmail
                      ? `Tisztelt ${travelerName}! Köszönjük a foglalását. Utazási igényét a Pannon Transfer rendszere rögzítette, hamarosan diszpécserünk véglegesíti azt.`
                      : `Tisztelt Partnerünk! Köszönjük, hogy <strong>${travelerName}</strong> utasa számára foglalást rögzített. Az utazási igényt a Pannon Transfer rendszere fogadta, hamarosan diszpécserünk véglegesíti azt.`}
                  </p>
                  
                  <!-- Info boxes -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td width="48%" style="padding-right:8px;">
                        <div style="background:rgba(255,255,255,0.08); border-radius:16px; padding:16px; border:1px solid rgba(255,255,255,0.1);">
                          <div style="font-size:10px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:#94A3B8; margin-bottom:6px;">Foglalás kód</div>
                          <div style="font-size:14px; font-weight:600; color:#60A5FA; word-break:break-all;">#${bookingCode}</div>
                        </div>
                      </td>
                      <td width="48%" style="padding-left:8px;">
                        <div style="background:rgba(255,255,255,0.08); border-radius:16px; padding:16px; border:1px solid rgba(255,255,255,0.1);">
                          <div style="font-size:10px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:#94A3B8; margin-bottom:6px;">Szolgáltatás</div>
                          <div style="font-size:14px; font-weight:600; color:#FFFFFF;">${transferTypeLabel}</div>
                        </div>
                      </td>
                    </tr>
                  </table>
                  
                </td>
              </tr>
              
              <!-- BODY SECTION -->
              <tr>
                <td style="padding:32px;">
                  
                  <div style="font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#64748B; margin-bottom:16px;">
                    Utazás részletei
                  </div>
                  
                  <!-- Route box -->
                  <div style="border:1px solid #E2E8F0; border-radius:16px; padding:20px; margin-bottom:24px; background:#F8FAFC;">
                    
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td width="50%" valign="top" style="padding-right:16px;">
                          <div style="font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#94A3B8; margin-bottom:4px;">Dátum</div>
                          <div style="font-size:15px; font-weight:700; color:#0F172A; margin-bottom:16px;">${pickupDate}</div>
                          
                          <div style="font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#94A3B8; margin-bottom:4px;">Időpont</div>
                          <div style="font-size:18px; font-weight:800; color:#EAB308;">${pickupTime}</div>
                        </td>
                        <td width="50%" valign="top" style="padding-left:16px; border-left:1px solid #E2E8F0;">
                          <div style="font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#94A3B8; margin-bottom:4px;">Indulás</div>
                          <div style="font-size:14px; font-weight:600; color:#0F172A; margin-bottom:12px; line-height:1.4;">${fromAddress}</div>
                          
                          <div style="font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#94A3B8; margin-bottom:4px;">Érkezés</div>
                          <div style="font-size:14px; font-weight:600; color:#0F172A; line-height:1.4;">${toAddress}</div>
                          ${flightNumber ? `<div style="font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#64748B; margin-top:12px; margin-bottom:4px;">Járatszám</div><div style="font-size:15px; font-weight:800; color:#0F172A;">✈ ${flightNumber}</div>` : ''}
                        </td>
                      </tr>
                    </table>
                    
                  </div>
                  
                  <!-- Additional info boxes -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:24px;">
                    <tr>
                      <td width="32%" style="padding-right:6px;" valign="top">
                        <div style="height:100%; border:1px solid #E2E8F0; border-radius:12px; padding:12px; background:#FFFFFF;">
                          <div style="font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#64748B; margin-bottom:4px;">Utasok</div>
                          <div style="font-size:14px; font-weight:700; color:#0F172A;">${travelers} fő</div>
                        </div>
                      </td>
                      <td width="32%" style="padding-right:6px; padding-left:6px;" valign="top">
                        <div style="height:100%; border:1px solid #E2E8F0; border-radius:12px; padding:12px; background:#FFFFFF;">
                          <div style="font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#64748B; margin-bottom:4px;">Csomagok</div>
                          <div style="font-size:14px; font-weight:700; color:#0F172A;">${luggage} db</div>
                        </div>
                      </td>
                      <td width="36%" style="padding-left:6px;" valign="top">
                        <div style="height:100%; border:1px solid #E2E8F0; border-radius:12px; padding:12px; background:#FFFFFF;">
                          <div style="font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#64748B; margin-bottom:4px;">Fizetés</div>
                          <div style="font-size:14px; font-weight:700; color:#0F172A;">${paymentMethodLabel}</div>
                        </div>
                      </td>
                    </tr>
                  </table>
                  
                  ${comment ? `
                  <div style="border-left:3px solid #EAB308; background:#FEFCE8; border-radius:0 12px 12px 0; padding:16px; margin-bottom:24px;">
                    <div style="font-size:10px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:#A16207; margin-bottom:6px;">Megjegyzés</div>
                    <div style="font-size:13px; line-height:1.6; font-style:italic; color:#713F12;">
                      "${comment}"
                    </div>
                  </div>
                  ` : ''}
                  
                  <!-- Support box -->
                  <div style="background:#0F172A; border-radius:16px; padding:20px; color:#F8FAFC;">
                    <div style="font-size:10px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:#EAB308; margin-bottom:8px;">
                      További teendők
                    </div>
                    <div style="font-size:13px; line-height:1.6;">
                      A foglalás véglegesítéséről és a sofőr adatairól külön emailben tájékoztatjuk az utazás előtt. Kérdés esetén forduljon az NI dedikált kapcsolattartójához.
                    </div>
                  </div>
                  
                </td>
              </tr>
              
              <!-- FOOTER SECTION -->
              <tr>
                <td bgcolor="#F8FAFC" style="padding:24px 32px; border-top:1px solid #E2E8F0; text-align:center;">
                  <p style="margin:0; font-size:11px; line-height:1.6; color:#94A3B8;">
                    Ezt az üzenetet a Pannon Transfer NI Portál rendszere küldte.<br>
                    Üdvözlettel, Pannon Transfer csapata<br>
                    © ${new Date().getFullYear()} Pannon Transfer. Minden jog fenntartva.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body></html>`;
}
