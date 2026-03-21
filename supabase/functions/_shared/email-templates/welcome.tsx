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
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface WelcomeEmailProps {
  recipientName: string
  siteUrl: string
}

const logoUrl = 'https://qvzvhmuosxdaqxwyokpg.supabase.co/storage/v1/object/public/email-assets/findoo-logo.png'

export const WelcomeEmail = ({ recipientName, siteUrl }: WelcomeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome aboard, {recipientName} — your findoo journey starts now</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={logoUrl} alt="findoo" width="120" height="auto" style={logo} />
        <Heading style={h1}>Welcome aboard, {recipientName}!</Heading>
        <Text style={text}>
          You're now part of India's trusted financial network. Here's how to get started:
        </Text>
        <Text style={text}>
          • <strong>Complete your profile</strong> — add your credentials and experience{'\n'}
          • <strong>Explore the directory</strong> — discover products and services{'\n'}
          • <strong>Connect with peers</strong> — build your professional network
        </Text>
        <Button style={button} href={siteUrl + '/feed'}>
          Get Started
        </Button>
        <Text style={footer}>
          Need help? Visit our Help Desk or reply to this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default WelcomeEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '32px 28px' }
const logo = { margin: '0 0 24px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#151535', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#676d7a', lineHeight: '1.6', margin: '0 0 16px' }
const button = {
  backgroundColor: '#00008A',
  color: '#ffffff',
  fontSize: '14px',
  borderRadius: '10px',
  padding: '12px 24px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0' }
