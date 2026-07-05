import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'My Star Stories'

interface WelcomeDiscountProps {
  code?: string
  percentOff?: number
  minSubtotal?: number
}

const WelcomeDiscountEmail = ({
  code = 'WELCOME',
  percentOff = 20,
  minSubtotal = 25,
}: WelcomeDiscountProps) => {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your {percentOff}% off code is inside — welcome to {SITE_NAME}!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⭐ Welcome to {SITE_NAME}!</Heading>
          <Text style={subhead}>
            Here's your {percentOff}% off code — use it whenever you're ready to create your first personalized storybook.
          </Text>

          <Section style={codeBox}>
            <Text style={codeLabel}>Your discount code</Text>
            <Text style={codeValue}>{code}</Text>
            <Text style={codeMeta}>
              {percentOff}% off orders ${minSubtotal}+ · one-time use
            </Text>
          </Section>

          <Section style={infoBox}>
            <Heading as="h3" style={h3}>What makes our storybooks special:</Heading>
            <Text style={text}>• Your child is the hero — name, age, photo & all</Text>
            <Text style={text}>• Beautiful AI-generated illustrations of your child</Text>
            <Text style={text}>• Bonus matching coloring pages included</Text>
            <Text style={text}>• Delivered as an instant PDF download</Text>
          </Section>

          <Text style={tip}>
            💡 Tip: Add a sibling, friend, or pet as a supporting character to make the story even more magical.
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            Thanks for joining the {SITE_NAME} family!
            <br />
            Questions? Just reply to this email.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: WelcomeDiscountEmail,
  subject: (data: Record<string, any>) =>
    `Your ${data?.percentOff || 20}% off code: ${data?.code || 'WELCOME'} ⭐`,
  displayName: 'Welcome discount',
  previewData: {
    code: 'WELCOME',
    percentOff: 20,
    minSubtotal: 25,
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
}
const container = { padding: '24px', maxWidth: '600px', margin: '0 auto' }
const h1 = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 8px',
  textAlign: 'center' as const,
}
const subhead = {
  fontSize: '14px',
  color: '#666',
  textAlign: 'center' as const,
  margin: '0 0 24px',
}
const codeBox = {
  backgroundColor: '#fff8e1',
  border: '2px dashed #f59e0b',
  borderRadius: '16px',
  padding: '28px',
  textAlign: 'center' as const,
  margin: '24px 0',
}
const codeLabel = {
  fontSize: '12px',
  color: '#92400e',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 8px',
  fontWeight: 600,
}
const codeValue = {
  fontSize: '36px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 8px',
  letterSpacing: '4px',
}
const codeMeta = { fontSize: '13px', color: '#666', margin: 0 }
const infoBox = {
  backgroundColor: '#f5f5f5',
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0',
}
const h3 = { margin: '0 0 12px', fontSize: '16px', color: '#1a1a1a' }
const text = { margin: '4px 0', color: '#444', fontSize: '14px' }
const tip = {
  fontSize: '13px',
  color: '#888',
  textAlign: 'center' as const,
  margin: '32px 0 8px',
}
const hr = { border: 'none', borderTop: '1px solid #eee', margin: '32px 0 16px' }
const footer = {
  fontSize: '13px',
  color: '#888',
  textAlign: 'center' as const,
  margin: 0,
}
