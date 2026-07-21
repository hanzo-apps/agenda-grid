import { useIam } from '@hanzo/iam/react'
import { YStack, XStack, H1, Paragraph, Text, Button } from '@hanzo/gui'
import { Logo } from './brand'
import { toMin, fmtMin, tint } from '../lib/schedule'

/** A track column in the illustrative preview. */
interface PreviewTrack {
  name: string
  color: string
  blocks: { title: string; s: string; e: string; room?: string }[]
}

// A small, illustrative multi-track program — the same block styling the real
// grid uses, so the hero shows the product faithfully (not live event data).
const PREVIEW: PreviewTrack[] = [
  {
    name: 'Main Stage',
    color: '#6366f1',
    blocks: [
      { title: 'Opening Keynote', s: '09:00', e: '09:45', room: 'Hall A' },
      { title: 'Scaling to Millions', s: '10:15', e: '11:15', room: 'Hall A' },
      { title: 'Fireside Chat', s: '11:30', e: '12:15', room: 'Hall A' },
    ],
  },
  {
    name: 'Workshops',
    color: '#10b981',
    blocks: [
      { title: 'Hands-on Lab', s: '09:15', e: '10:30', room: 'Room 2' },
      { title: 'Design Systems', s: '10:45', e: '12:00', room: 'Room 2' },
    ],
  },
  {
    name: 'Labs',
    color: '#f59e0b',
    blocks: [
      { title: 'Office Hours', s: '09:00', e: '10:00' },
      { title: 'Live Demos', s: '10:15', e: '11:00' },
      { title: 'Q&A', s: '11:15', e: '12:00' },
    ],
  },
]

const P_START = 9 * 60
const P_END = 12 * 60 + 30
const P_PX = 1.2
const P_GUTTER = 46
const P_BODY = (P_END - P_START) * P_PX

function PreviewGrid() {
  const hours: number[] = []
  for (let t = P_START; t <= P_END; t += 60) hours.push(t)

  return (
    <YStack borderWidth={1} borderColor="#ffffff1c" borderRadius={16} overflow="hidden" backgroundColor="#0b0b12">
      {/* headers */}
      <XStack height={40} borderBottomWidth={1} borderColor="#ffffff14" backgroundColor="#ffffff08">
        <YStack width={P_GUTTER} />
        {PREVIEW.map((tr) => (
          <XStack key={tr.name} flex={1} alignItems="center" gap={7} paddingHorizontal={10} borderLeftWidth={1} borderColor="#ffffff14" backgroundColor={tint(tr.color, '1e')}>
            <YStack width={8} height={8} borderRadius={999} backgroundColor={tr.color} />
            <Text fontSize={12} fontWeight="700" color="#f4f4f8" numberOfLines={1}>
              {tr.name}
            </Text>
          </XStack>
        ))}
      </XStack>
      {/* body */}
      <XStack height={P_BODY}>
        <YStack width={P_GUTTER} position="relative" backgroundColor="#ffffff06">
          {hours.map((t) => (
            <Text key={t} position="absolute" top={(t - P_START) * P_PX - 6} left={0} right={6} textAlign="right" fontSize={10} color="#c7c7d1" opacity={0.6}>
              {fmtMin(t)}
            </Text>
          ))}
        </YStack>
        {PREVIEW.map((tr) => (
          <YStack key={tr.name} flex={1} position="relative" borderLeftWidth={1} borderColor="#ffffff14">
            {hours.map((t) => (
              <YStack key={t} position="absolute" top={(t - P_START) * P_PX} left={0} right={0} height={1} backgroundColor="#ffffff10" />
            ))}
            {tr.blocks.map((b) => {
              const a = toMin(b.s) ?? P_START
              const z = toMin(b.e) ?? a + 60
              return (
                <YStack
                  key={b.title}
                  position="absolute"
                  top={(a - P_START) * P_PX + 2}
                  left={5}
                  right={5}
                  height={Math.max((z - a) * P_PX - 4, 24)}
                  padding={7}
                  borderRadius={8}
                  borderLeftWidth={3}
                  borderLeftColor={tr.color}
                  backgroundColor={tint(tr.color, '26')}
                  overflow="hidden"
                >
                  <Text fontSize={11.5} fontWeight="700" color="#f4f4f8" numberOfLines={1}>
                    {b.title}
                  </Text>
                  <Text fontSize={10} color="#c7c7d1" opacity={0.85} numberOfLines={1}>
                    {b.s}–{b.e}
                    {b.room ? ` · ${b.room}` : ''}
                  </Text>
                </YStack>
              )
            })}
          </YStack>
        ))}
      </XStack>
    </YStack>
  )
}

function FeatureChip({ children }: { children: string }) {
  return (
    <XStack alignItems="center" gap={7} paddingHorizontal={12} paddingVertical={7} borderRadius={999} borderWidth={1} borderColor="$borderColor" backgroundColor="#ffffff06">
      <Text fontSize={13} color="$color12">
        {children}
      </Text>
    </XStack>
  )
}

/**
 * Signed-out landing — the honest public view (auth-gated agenda needs sign-in).
 * One action: PKCE sign-in with Hanzo (hanzo.id). No local credential form.
 */
export function SignedOut() {
  const { login, isLoading } = useIam()

  return (
    <YStack flex={1} minHeight="100vh" alignItems="center" justifyContent="center" padding="$6" backgroundColor="$background">
      <XStack maxWidth={1120} width="100%" gap="$8" flexWrap="wrap" alignItems="center" justifyContent="center">
        {/* Copy + CTA */}
        <YStack flex={1} minWidth={340} gap="$5" paddingVertical="$4">
          <XStack alignItems="center" gap="$3">
            <Logo size={38} />
            <YStack>
              <Text fontSize={22} fontWeight="800" color="$color12">
                Sched
              </Text>
              <Text fontSize={12} color="$color11" opacity={0.6}>
                Conference Agenda
              </Text>
            </YStack>
          </XStack>

          <H1 fontSize={46} lineHeight={50} fontWeight="900" color="$color12">
            Your whole conference at a glance.
          </H1>

          <Paragraph fontSize={17} lineHeight={26} opacity={0.7} maxWidth={520}>
            A multi-track agenda for real events. Browse every session by time and
            track, open one for its abstract and speakers, and keep the entire
            program in a dense, color-coded grid.
          </Paragraph>

          <XStack gap="$2" flexWrap="wrap">
            <FeatureChip>Multi-track grid</FeatureChip>
            <FeatureChip>Session detail</FeatureChip>
            <FeatureChip>Speakers &amp; rooms</FeatureChip>
          </XStack>

          <XStack gap="$3" alignItems="center" flexWrap="wrap">
            <Button size="$5" theme="active" disabled={isLoading} onPress={() => login()}>
              {isLoading ? 'Loading…' : 'Sign in with Hanzo'}
            </Button>
            <Text fontSize={13} opacity={0.5}>
              Sessions stored per-org in Hanzo Base.
            </Text>
          </XStack>
        </YStack>

        {/* Illustrative preview */}
        <YStack flex={1} minWidth={360} gap="$2" paddingVertical="$4">
          <Text fontSize={11} fontWeight="700" color="$color11" opacity={0.5} letterSpacing={1}>
            PREVIEW
          </Text>
          <PreviewGrid />
        </YStack>
      </XStack>
    </YStack>
  )
}
