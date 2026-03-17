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

interface ReauthenticationEmailProps {
  token: string
}

const logoUrl = 'https://qvzvhmuosxdaqxwyokpg.supabase.co/storage/v1/object/public/email-assets/findoo-logo.png'

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your FindOO verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={logoUrl} alt="FindOO" width="120" height="auto" style={logo} />
        <Heading style={h1}>Verification code</Heading>
        <Text style={text}>Use this code to confirm your identity on FindOO:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          This code will expire shortly. If you didn't request this, you can
          safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '32px 28px' }
const logo = { margin: '0 0 24px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#151535',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#676d7a',
  lineHeight: '1.6',
  margin: '0 0 28px',
}
const codeStyle = {
  fontFamily: "'DM Sans', Courier, monospace",
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#00008A',
  letterSpacing: '4px',
  margin: '0 0 32px',
}
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0' }
