/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

const logoUrl = 'https://qvzvhmuosxdaqxwyokpg.supabase.co/storage/v1/object/public/email-assets/findoo-logo.png'

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to FindOO — verify your email to get started</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={logoUrl} alt="FindOO" width="120" height="auto" style={logo} />
        <Heading style={h1}>Welcome to FindOO!</Heading>
        <Text style={text}>
          Thanks for joining India's trusted financial network. Verify your email
          address (<Link href={`mailto:${recipient}`} style={link}>{recipient}</Link>)
          to activate your account.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Verify Email
        </Button>
        <Text style={footer}>
          If you didn't create an account on FindOO, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

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
const link = { color: '#00008A', textDecoration: 'underline' }
const button = {
  backgroundColor: '#00008A',
  color: '#ffffff',
  fontSize: '14px',
  borderRadius: '10px',
  padding: '12px 24px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0' }
