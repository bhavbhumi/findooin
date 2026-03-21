/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ContactConfirmationEmailProps {
  recipientName: string
  subject: string
}

const logoUrl = 'https://qvzvhmuosxdaqxwyokpg.supabase.co/storage/v1/object/public/email-assets/findoo-logo.png'

export const ContactConfirmationEmail = ({ recipientName, subject }: ContactConfirmationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We received your message — we'll get back to you soon</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={logoUrl} alt="findoo" width="120" height="auto" style={logo} />
        <Heading style={h1}>Message received!</Heading>
        <Text style={text}>
          Hi {recipientName}, thanks for reaching out. We've received your message
          regarding "<strong>{subject}</strong>".
        </Text>
        <Text style={text}>
          Our team will review your query and respond within <strong>24–48 hours</strong>.
          You don't need to take any further action.
        </Text>
        <Text style={text}>
          If your matter is urgent, you can reach us at <strong>hello@findoo.in</strong>.
        </Text>
        <Text style={footer}>
          This is an automated confirmation from findoo. Please do not reply to this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ContactConfirmationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '32px 28px' }
const logo = { margin: '0 0 24px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#151535', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#676d7a', lineHeight: '1.6', margin: '0 0 16px' }
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0' }
