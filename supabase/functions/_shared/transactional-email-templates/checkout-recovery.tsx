/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  childName?: string
  resumeUrl: string
}

const Email = ({ childName, resumeUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{childName ? `${childName}'s` : 'Your'} personalized storybook is one click away</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your storybook is waiting 💛</Heading>
        <Text style={intro}>
          {childName
            ? `We saved ${childName}'s personalized storybook for you.`
            : `We saved your personalized storybook for you.`}{' '}
          Finish checkout whenever you're ready — everything you entered is still there.
        </Text>

        <Section style={{ textAlign: 'center', margin: '24px 0' }}>
          <Button href={resumeUrl} style={button}>
            Finish my order →
          </Button>
        </Section>

        <Text style={small}>
          If the button doesn't work, copy and paste this link into your browser:
          <br />
          <span style={{ wordBreak: 'break-all' }}>{resumeUrl}</span>
        </Text>

        <Text style={footerNote}>
          You're receiving this because you started an order at mestar.pro. If it wasn't you, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    data?.childName
      ? `${data.childName}'s storybook is one click away 💛`
      : `Your MESTAR storybook is one click away 💛`,
  displayName: 'Checkout Recovery',
  previewData: {
    childName: 'Emma',
    resumeUrl: 'https://mestar.pro/checkout?order_id=abc&recover=xyz',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { color: '#111827', fontSize: '24px', margin: '0 0 12px' }
const intro = { color: '#374151', fontSize: '15px', lineHeight: '22px', margin: '0 0 16px' }
const button = {
  backgroundColor: '#f59e0b',
  color: '#111827',
  padding: '14px 28px',
  borderRadius: '10px',
  fontSize: '16px',
  fontWeight: 700,
  textDecoration: 'none',
}
const small = { color: '#6b7280', fontSize: '12px', lineHeight: '18px', margin: '16px 0' }
const footerNote = { color: '#9ca3af', fontSize: '11px', marginTop: '20px' }
