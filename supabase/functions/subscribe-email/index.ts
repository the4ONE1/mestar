import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DISCOUNT_CODE = 'WELCOME'
const PERCENT_OFF = 20
const MIN_SUBTOTAL = 25

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, source } = await req.json()
    const normalized = String(email || '').trim().toLowerCase()

    if (!EMAIL_RE.test(normalized)) {
      return new Response(
        JSON.stringify({ error: 'Please enter a valid email address.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceKey)

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('cf-connecting-ip') ||
      null

    // Insert (ignore if already subscribed)
    const { error: insertError } = await supabase
      .from('email_subscribers')
      .insert({
        email: normalized,
        source: source || 'popup',
        discount_code_sent: DISCOUNT_CODE,
        ip_address: ip,
      })

    // Unique violation = already subscribed; treat as success but skip email resend
    const alreadySubscribed = insertError?.code === '23505'

    if (insertError && !alreadySubscribed) {
      console.error('Subscribe insert failed:', insertError)
      return new Response(
        JSON.stringify({ error: 'Something went wrong. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send welcome email (only on first signup)
    if (!alreadySubscribed) {
      const emailResp = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateName: 'welcome-discount',
          recipientEmail: normalized,
          templateData: {
            code: DISCOUNT_CODE,
            percentOff: PERCENT_OFF,
            minSubtotal: MIN_SUBTOTAL,
          },
        }),
      })

      if (!emailResp.ok) {
        const errText = await emailResp.text()
        console.error('Welcome email send failed:', emailResp.status, errText)
        // Don't fail the request — they're still subscribed; show code in response
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        code: DISCOUNT_CODE,
        percentOff: PERCENT_OFF,
        minSubtotal: MIN_SUBTOTAL,
        alreadySubscribed,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('subscribe-email error:', err)
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
