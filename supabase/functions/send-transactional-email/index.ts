import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'npm:@supabase/supabase-js@2'

import { WelcomeEmail } from '../_shared/email-templates/welcome.tsx'
import { ContactConfirmationEmail } from '../_shared/email-templates/contact-confirmation.tsx'
import { ConnectionAcceptedEmail } from '../_shared/email-templates/connection-accepted.tsx'
import { EventRegistrationEmail } from '../_shared/email-templates/event-registration.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const SITE_NAME = 'findooin'
const SENDER_DOMAIN = 'go.notify.findoo.in'
const FROM_DOMAIN = 'notify.findoo.in'
const SITE_URL = 'https://findooin.lovable.app'

type TemplateType = 'welcome' | 'contact-confirmation' | 'connection-accepted' | 'event-registration'

const EMAIL_SUBJECTS: Record<TemplateType, string> = {
  'welcome': 'Welcome to findoo!',
  'contact-confirmation': 'We received your message',
  'connection-accepted': 'Connection accepted!',
  'event-registration': 'Event registration confirmed',
}

// Render template based on type
async function renderTemplate(type: TemplateType, data: Record<string, any>) {
  const props = { ...data, siteUrl: SITE_URL }
  let element: React.ReactElement

  switch (type) {
    case 'welcome':
      element = React.createElement(WelcomeEmail, props)
      break
    case 'contact-confirmation':
      element = React.createElement(ContactConfirmationEmail, props)
      break
    case 'connection-accepted':
      element = React.createElement(ConnectionAcceptedEmail, props)
      break
    case 'event-registration':
      element = React.createElement(EventRegistrationEmail, props)
      break
    default:
      throw new Error(`Unknown template type: ${type}`)
  }

  const html = await renderAsync(element)
  const text = await renderAsync(element, { plainText: true })
  return { html, text }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  // Validate caller is authenticated
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Verify the user's JWT
  const token = authHeader.slice('Bearer '.length).trim()
  const supabaseAuth = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!)
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let body: { type: TemplateType; to: string; data: Record<string, any> }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { type, to, data } = body

  if (!type || !to || !EMAIL_SUBJECTS[type]) {
    return new Response(JSON.stringify({ error: 'Invalid type or missing to' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const { html, text } = await renderTemplate(type, data || {})

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const messageId = `${type}-${crypto.randomUUID()}`

    // Check suppression list
    const { data: suppressed } = await supabase
      .from('suppressed_emails')
      .select('id')
      .eq('email', to)
      .maybeSingle()

    if (suppressed) {
      await supabase.from('email_send_log').insert({
        message_id: messageId,
        template_name: type,
        recipient_email: to,
        status: 'suppressed',
        error_message: 'Recipient is suppressed',
      })
      return new Response(JSON.stringify({ success: true, suppressed: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Log pending
    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: type,
      recipient_email: to,
      status: 'pending',
    })

    // Enqueue for async delivery
    const { error: enqueueError } = await supabase.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: {
        message_id: messageId,
        to,
        from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject: EMAIL_SUBJECTS[type],
        html,
        text,
        purpose: 'transactional',
        label: type,
        queued_at: new Date().toISOString(),
      },
    })

    if (enqueueError) {
      console.error('Failed to enqueue transactional email', { error: enqueueError, type })
      await supabase.from('email_send_log').insert({
        message_id: messageId,
        template_name: type,
        recipient_email: to,
        status: 'failed',
        error_message: 'Failed to enqueue',
      })
      return new Response(JSON.stringify({ error: 'Failed to enqueue email' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, queued: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Transactional email error', { type, error: msg })
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
