import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const { email, firstName, token } = await req.json();
    if (!email || !firstName || !token) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const siteUrl = Deno.env.get('SITE_URL') ?? 'https://demetrahealth.com';
    const confirmUrl = `${siteUrl}/confirm.html?token=${token}`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Demetra <hello@demetrahealth.com>',
        to: email,
        subject: 'Confirm your spot on the Demetra waitlist',
        html: buildEmail(firstName, confirmUrl),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('Resend error:', body);
      return new Response(JSON.stringify({ error: 'Email send failed' }), {
        status: 502,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});

function buildEmail(firstName: string, confirmUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Confirm your spot</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:48px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 2px 24px rgba(0,0,0,.08);">

        <!-- header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4ea8a6 0%,#7b6cf6 100%);padding:40px 40px 32px;text-align:center;">
            <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.7);">Demetra</p>
            <h1 style="margin:16px 0 0;font-size:26px;font-weight:700;color:#ffffff;line-height:1.25;">You're almost in.</h1>
          </td>
        </tr>

        <!-- body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 16px;font-size:16px;color:#1a1a2e;line-height:1.6;">Hi ${firstName},</p>
            <p style="margin:0 0 32px;font-size:15px;color:#44445a;line-height:1.7;">
              Thanks for joining the Demetra waitlist. One quick step — confirm your email so we know where to reach you when we launch.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${confirmUrl}" style="display:inline-block;background:linear-gradient(135deg,#4ea8a6 0%,#7b6cf6 100%);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:16px 40px;border-radius:999px;letter-spacing:.01em;">
                  Confirm my spot
                </a>
              </td></tr>
            </table>
            <p style="margin:32px 0 0;font-size:12px;color:#9999aa;text-align:center;line-height:1.6;">
              Or paste this link into your browser:<br>
              <a href="${confirmUrl}" style="color:#4ea8a6;word-break:break-all;">${confirmUrl}</a>
            </p>
          </td>
        </tr>

        <!-- footer -->
        <tr>
          <td style="padding:0 40px 32px;">
            <hr style="border:none;border-top:1px solid #ebebf0;margin:0 0 24px;">
            <p style="margin:0;font-size:12px;color:#9999aa;line-height:1.6;text-align:center;">
              You're receiving this because you signed up at demetrahealth.com.<br>
              If you didn't sign up, you can safely ignore this email.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
