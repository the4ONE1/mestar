import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'MESTAR'

interface StoryDeliveryProps {
  childName?: string
  childAge?: string
  theme?: string
  strength?: string
  supportingCharacterName?: string
  pdfUrl?: string
  orderPageUrl?: string
}

const StoryDeliveryEmail = ({
  childName = 'your child',
  childAge,
  theme,
  strength,
  supportingCharacterName,
  pdfUrl = '#',
  orderPageUrl,
}: StoryDeliveryProps) => {
  const ctaUrl = orderPageUrl || pdfUrl
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{childName}'s personalized storybook is ready to download</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⭐ {childName}'s Storybook is Ready!</Heading>
          <Text style={subhead}>
            Your personalized {SITE_NAME} storybook has been created.
          </Text>

          <Section style={ctaSection}>
            <Text style={ctaIntro}>Click below to view and download your PDF:</Text>
            <Button href={ctaUrl} style={button}>
              📖 View Your Storybook
            </Button>
            <Text style={linkFallback}>
              Or paste this link in your browser:
              <br />
              <Link href={ctaUrl} style={link}>
                {ctaUrl}
              </Link>
            </Text>
          </Section>

          <Section style={infoBox}>
            <Heading as="h3" style={h3}>What's inside:</Heading>
            <Text style={text}>• A unique story written just for {childName}</Text>
            <Text style={text}>• Beautiful personalized illustrations</Text>
            <Text style={text}>• Bonus coloring pages (if included in your order)</Text>
          </Section>

          {(childAge || theme || strength || supportingCharacterName) && (
            <Section style={detailsBox}>
              <Text style={detailsHeader}><strong>Story details:</strong></Text>
              <Text style={detail}>• Child's name: {childName}</Text>
              {childAge && <Text style={detail}>• Age group: {childAge}</Text>}
              {theme && <Text style={detail}>• Theme: {theme}</Text>}
              {strength && <Text style={detail}>• Featured strength: {strength}</Text>}
              {supportingCharacterName && (
                <Text style={detail}>• Supporting character: {supportingCharacterName}</Text>
              )}
            </Section>
          )}

          <Text style={tip}>
            💡 Tip: Save the PDF to your device or print it out — the download link is valid for 7 days.
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            Thank you for choosing {SITE_NAME}!
            <br />
            Questions? Just reply to this email.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: StoryDeliveryEmail,
  subject: (data: Record<string, any>) =>
    `${data?.childName || 'Your child'}'s Personalized Storybook is Ready! ⭐`,
  displayName: 'Story delivery',
  previewData: {
    childName: 'Bella',
    childAge: '4-6',
    theme: 'Prince & Princess',
    strength: 'Kindness',
    pdfUrl: 'https://mestar.pro/order-complete?order_id=example',
    orderPageUrl: 'https://mestar.pro/order-complete?order_id=example',
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
const ctaSection = {
  backgroundColor: '#f8f5ff',
  border: '1px solid #e7dfff',
  borderRadius: '16px',
  padding: '28px',
  textAlign: 'center' as const,
  margin: '24px 0',
}
const ctaIntro = { fontSize: '16px', margin: '0 0 20px', color: '#1a1a1a' }
const button = {
  backgroundColor: '#6d28d9',
  color: '#ffffff',
  padding: '16px 32px',
  borderRadius: '12px',
  fontWeight: 600,
  fontSize: '16px',
  textDecoration: 'none',
  display: 'inline-block',
}
const linkFallback = { fontSize: '13px', color: '#888', margin: '20px 0 0' }
const link = { color: '#6d28d9', wordBreak: 'break-all' as const }
const infoBox = {
  backgroundColor: '#f5f5f5',
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0',
}
const h3 = { margin: '0 0 12px', fontSize: '16px', color: '#1a1a1a' }
const text = { margin: '4px 0', color: '#444', fontSize: '14px' }
const detailsBox = { padding: '0 8px', margin: '16px 0' }
const detailsHeader = { fontSize: '14px', color: '#555', margin: '0 0 8px' }
const detail = { fontSize: '14px', color: '#555', margin: '4px 0' }
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
