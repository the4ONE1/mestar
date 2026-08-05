/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body,
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
  subject?: string
  details?: string
  severity?: string
  sentAt?: string
  /** When true, renders a bare one-line body (used for the SMS gateway). */
  compact?: boolean
}

const OwnerAlert = ({ subject, details, severity, sentAt, compact }: Props) => {
  const title = subject || 'MESTAR alert'

  if (compact) {
    return (
      <Html lang="en" dir="ltr">
        <Head />
        <Preview>{title}</Preview>
        <Body style={main}>
          <Text style={smsText}>{details || title}</Text>
        </Body>
      </Html>
    )
  }

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>{title}</Heading>
          <Section style={box}>
            <Text style={pre}>{details || 'No extra detail was provided.'}</Text>
          </Section>
          <Text style={meta}>
            Severity: {severity || 'critical'}
            <br />
            Time: {sentAt || new Date().toISOString()}
          </Text>
          <Text style={meta}>MESTAR automated monitoring</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: OwnerAlert,
  subject: (data: Record<string, any>) =>
    `${data?.severity === 'critical' ? '🚨 ' : ''}${data?.subject || 'MESTAR alert'}`,
  displayName: 'Owner alert',
  previewData: {
    subject: 'MESTAR alert system test',
    details: 'This is what an alert looks like.',
    severity: 'info',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '24px 28px', maxWidth: '600px' }
const heading = { fontSize: '20px', lineHeight: '28px', margin: '0 0 16px', color: '#111827' }
const box = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px 18px',
}
const pre = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '13px',
  lineHeight: '20px',
  color: '#111827',
  whiteSpace: 'pre-wrap' as const,
  margin: '0',
}
const meta = { fontSize: '12px', lineHeight: '18px', color: '#6b7280', margin: '16px 0 0' }
const smsText = { fontSize: '14px', lineHeight: '20px', color: '#111827', margin: '0' }
