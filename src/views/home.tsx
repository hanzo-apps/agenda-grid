import { useState } from 'react'
import { useIam } from '@hanzo/iam/react'
import { useQuery } from '@hanzo/base/react'
import { YStack, XStack, Text, Button, Paragraph, Spinner } from '@hanzo/gui'
import type { Session, Speaker, Track } from '../lib/schedule'
import { Logo } from './brand'
import { Agenda } from './agenda'
import { Manage } from './manage'
import { Detail } from './detail'

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Button
      size="$3"
      chromeless={!active}
      theme={active ? 'active' : undefined}
      backgroundColor={active ? undefined : 'transparent'}
      onPress={onPress}
    >
      {label}
    </Button>
  )
}

/** Signed-in shell: brand bar + Agenda / Manage tabs, with a session-detail leg. */
export function Home() {
  const { user, logout } = useIam()
  const who = user?.displayName || user?.name || user?.email || 'you'

  const tracksQ = useQuery<Track>('tracks', { sort: 'name', realtime: false })
  const sessionsQ = useQuery<Session>('sessions', { sort: 'starts_at', realtime: false })
  const speakersQ = useQuery<Speaker>('speakers', { sort: 'name', realtime: false })

  const [view, setView] = useState<'agenda' | 'manage'>('agenda')
  const [openId, setOpenId] = useState<string | null>(null)

  const refetchAll = () => {
    tracksQ.refetch()
    sessionsQ.refetch()
    speakersQ.refetch()
  }

  const loading = tracksQ.isLoading || sessionsQ.isLoading || speakersQ.isLoading
  const error = tracksQ.error || sessionsQ.error || speakersQ.error
  const open = openId ? sessionsQ.data.find((s) => s.id === openId) ?? null : null

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor="$background">
      {/* Brand + tabs bar */}
      <XStack
        alignItems="center"
        justifyContent="space-between"
        gap="$4"
        paddingHorizontal="$5"
        paddingVertical="$3"
        borderBottomWidth={1}
        borderColor="$borderColor"
        flexWrap="wrap"
      >
        <XStack alignItems="center" gap="$3">
          <Logo />
          <YStack>
            <Text fontSize={18} fontWeight="800" color="$color12">
              Sched
            </Text>
            <Text fontSize={11} color="$color11" opacity={0.6}>
              Conference Agenda
            </Text>
          </YStack>
        </XStack>

        <XStack alignItems="center" gap="$2">
          <Tab label="Agenda" active={view === 'agenda' && !open} onPress={() => { setOpenId(null); setView('agenda') }} />
          <Tab label="Manage" active={view === 'manage' && !open} onPress={() => { setOpenId(null); setView('manage') }} />
          <Button size="$3" chromeless onPress={() => logout()}>
            Sign out
          </Button>
        </XStack>
      </XStack>

      {/* Body */}
      <YStack padding="$5" gap="$4" maxWidth={1180} width="100%" alignSelf="center">
        <Paragraph fontSize={13} opacity={0.55}>
          Signed in as {who}
        </Paragraph>

        {loading ? (
          <XStack gap="$2" alignItems="center" opacity={0.6} paddingVertical="$6" justifyContent="center">
            <Spinner /> <Text>Loading agenda…</Text>
          </XStack>
        ) : error ? (
          <Paragraph color="$red10">
            Couldn’t reach Base ({error.message}). Confirm VITE_HANZO_BASE_URL and that you’re signed in.
          </Paragraph>
        ) : open ? (
          <Detail session={open} tracks={tracksQ.data} speakers={speakersQ.data} onBack={() => setOpenId(null)} />
        ) : view === 'agenda' ? (
          <Agenda sessions={sessionsQ.data} tracks={tracksQ.data} onOpen={setOpenId} />
        ) : (
          <Manage tracks={tracksQ.data} sessions={sessionsQ.data} speakers={speakersQ.data} refetchAll={refetchAll} />
        )}
      </YStack>
    </YStack>
  )
}
