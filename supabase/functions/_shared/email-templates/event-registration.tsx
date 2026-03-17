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

interface EventRegistrationEmailProps {
  recipientName: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  siteUrl: string
}

const logoUrl = 'https://qvzvhmuosxdaqxwyokpg.supabase.co/storage/v1/object/public/email-assets/findoo-logo.png'

export const EventRegistrationEmail = ({
  recipientName,
  eventTitle,
  eventDate,
  eventLocation,
  siteUrl,
}: EventRegistrationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You're registered for {eventTitle} on FindOO</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={logoUrl} alt="FindOO" width="120" height="auto" style={logo} />
        <Heading style={h1}>Registration confirmed!</Heading>
        <Text style={text}>
          Hi {recipientName}, you're all set for:
        </Text>
        <Container style={eventCard}>
          <Text style={eventTitle_style}>{eventTitle}</Text>
          <Text style={eventMeta}>📅 {eventDate}</Text>
          <Text style={eventMeta}>📍 {eventLocation}</Text>
        </Container>
        <Button style={button} href={siteUrl + '/events'}>
          View Event Details
        </Button>
        <Text style={footer}>
          You'll receive a reminder before the event. You can cancel your registration from the Events page.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EventRegistrationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '32px 28px' }
const logo = { margin: '0 0 24px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#151535', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#676d7a', lineHeight: '1.6', margin: '0 0 16px' }
const eventCard = {
  backgroundColor: '#f7f8fa',
  borderRadius: '10px',
  padding: '20px',
  margin: '0 0 24px',
  border: '1px solid #e8eaed',
}
const eventTitle_style = { fontSize: '16px', fontWeight: 'bold' as const, color: '#151535', margin: '0 0 8px' }
const eventMeta = { fontSize: '13px', color: '#676d7a', margin: '0 0 4px' }
const button = {
  backgroundColor: '#00008A',
  color: '#ffffff',
  fontSize: '14px',
  borderRadius: '10px',
  padding: '12px 24px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0' }
