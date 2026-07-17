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
  orderId: string
  childName?: string
  storyTitle?: string
  customerEmail?: string
  stars?: number
  ratingComment?: string
  confirmedAt?: string
}

const Email = ({
  orderId,
  childName,
  storyTitle,
  customerEmail,
  stars,
  ratingComment,
  confirmedAt,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Order fulfilled — customer confirmed PDF received</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>✅ Order Fulfilled</Heading>
        <Text style={intro}>
          The customer has confirmed they received their MESTAR storybook PDF.
        </Text>

        <Section style={box}>
          <Text style={row}><strong>Order ID:</strong> {orderId}</Text>
          {childName && <Text style={row}><strong>Child:</strong> {childName}</Text>}
          {storyTitle && <Text style={row}><strong>Story:</strong> "{storyTitle}"</Text>}
          {customerEmail && <Text style={row}><strong>Customer:</strong> {customerEmail}</Text>}
          {confirmedAt && <Text style={row}><strong>Confirmed at:</strong> {confirmedAt}</Text>}
        </Section>

        {typeof stars === 'number' && (
          <Section style={ratingBox}>
            <Text style={row}>
              <strong>Rating:</strong> {'⭐'.repeat(stars)} ({stars}/5)
            </Text>
            {ratingComment && <Text style={row}><strong>Comment:</strong> {ratingComment}</Text>}
          </Section>
        )}

        <Text style={footerNote}>
          This is an automated fulfillment confirmation from mestar.pro.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `✅ Order fulfilled — ${data.childName || 'customer'} received their storybook`,
  displayName: 'Order Fulfilled Confirmation (internal)',
  previewData: {
    orderId: 'abc-123',
    childName: 'Emma',
    storyTitle: 'Emma and the Star Bear',
    customerEmail: 'parent@example.com',
    stars: 5,
    ratingComment: 'Absolutely magical!',
    confirmedAt: new Date().toISOString(),
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { color: '#111827', fontSize: '22px', margin: '0 0 12px' }
const intro = { color: '#374151', fontSize: '15px', margin: '0 0 16px' }
const box = {
  background: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '10px',
  padding: '16px 18px',
  margin: '0 0 16px',
}
const ratingBox = {
  background: '#fffbeb',
  border: '1px solid #fde68a',
  borderRadius: '10px',
  padding: '16px 18px',
  margin: '0 0 16px',
}
const row = { color: '#111827', fontSize: '14px', margin: '4px 0' }
const footerNote = { color: '#6b7280', fontSize: '12px', marginTop: '20px' }
