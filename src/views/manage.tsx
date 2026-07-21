import { useState } from 'react'
import { useMutation } from '@hanzo/base/react'
import { YStack, XStack, Input, TextArea, Button, Text, Paragraph, Separator } from '@hanzo/gui'
import {
  type Session,
  type Speaker,
  type Track,
  PALETTE,
  colorForTrack,
  tint,
  toMin,
  fmtMin,
  trackColumns,
} from '../lib/schedule'

/** "9:0" / "09:00" → canonical "HH:MM", or '' when unparseable. */
function normTime(v: string): string {
  const t = toMin(v)
  if (t == null) return ''
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <YStack gap="$1.5" flex={1} minWidth={140}>
      <Text fontSize={12} fontWeight="700" color="$color11" opacity={0.7}>
        {label}
      </Text>
      {children}
    </YStack>
  )
}

function Card({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <YStack gap="$3" padding="$4" borderWidth={1} borderColor="$borderColor" borderRadius="$6" backgroundColor="#ffffff06">
      <YStack gap="$1">
        <Text fontSize={16} fontWeight="800" color="$color12">
          {title}
        </Text>
        <Paragraph fontSize={13} opacity={0.6}>
          {hint}
        </Paragraph>
      </YStack>
      <Separator />
      {children}
    </YStack>
  )
}

/**
 * Organizer surface: add tracks (name + hue), sessions (title, abstract, track,
 * time, room) and speakers (tied to a session). Each writes an org-scoped row to
 * Base and refetches so the agenda grid updates immediately.
 */
export function Manage({
  tracks,
  sessions,
  speakers,
  refetchAll,
}: {
  tracks: Track[]
  sessions: Session[]
  speakers: Speaker[]
  refetchAll: () => void
}) {
  const cols = trackColumns(tracks, sessions)

  const addTrack = useMutation('tracks', 'create')
  const addSession = useMutation('sessions', 'create')
  const addSpeaker = useMutation('speakers', 'create')

  // Add-track form
  const [trackName, setTrackName] = useState('')
  const [trackColor, setTrackColor] = useState<string>(PALETTE[0])

  // Add-session form
  const [title, setTitle] = useState('')
  const [abstract, setAbstract] = useState('')
  const [sTrack, setSTrack] = useState('')
  const [starts, setStarts] = useState('09:00')
  const [ends, setEnds] = useState('10:00')
  const [room, setRoom] = useState('')

  // Add-speaker form
  const [spName, setSpName] = useState('')
  const [spBio, setSpBio] = useState('')
  const [spSession, setSpSession] = useState('')

  async function submitTrack() {
    const name = trackName.trim()
    if (!name || addTrack.isLoading) return
    await addTrack.mutate({ name, color: trackColor })
    setTrackName('')
    refetchAll()
  }

  async function submitSession() {
    const t = title.trim()
    const a = normTime(starts)
    const b = normTime(ends)
    if (!t || !sTrack || !a || !b || addSession.isLoading) return
    await addSession.mutate({
      title: t,
      abstract: abstract.trim(),
      track: sTrack,
      starts_at: a,
      ends_at: b,
      room: room.trim(),
    })
    setTitle('')
    setAbstract('')
    setRoom('')
    refetchAll()
  }

  async function submitSpeaker() {
    const name = spName.trim()
    if (!name || !spSession || addSpeaker.isLoading) return
    await addSpeaker.mutate({ name, bio: spBio.trim(), session_id: spSession })
    setSpName('')
    setSpBio('')
    setSpSession('')
    refetchAll()
  }

  const sessionOk = title.trim() && sTrack && normTime(starts) && normTime(ends)

  return (
    <YStack gap="$4" maxWidth={760} width="100%" alignSelf="center">
      {/* Tracks */}
      <Card title="Tracks" hint={`${tracks.length} track${tracks.length === 1 ? '' : 's'} — each a color-coded column on the grid.`}>
        <XStack gap="$2" flexWrap="wrap" alignItems="flex-end">
          <Field label="Name">
            <Input value={trackName} placeholder="e.g. Main Stage" onChangeText={setTrackName} onSubmitEditing={submitTrack} />
          </Field>
        </XStack>
        <YStack gap="$1.5">
          <Text fontSize={12} fontWeight="700" color="$color11" opacity={0.7}>
            Color
          </Text>
          <XStack gap="$2" flexWrap="wrap">
            {PALETTE.map((c) => (
              <Button
                key={c}
                width={30}
                height={30}
                padding={0}
                borderRadius={999}
                backgroundColor={c}
                borderWidth={trackColor === c ? 3 : 0}
                borderColor="$color12"
                onPress={() => setTrackColor(c)}
              />
            ))}
          </XStack>
        </YStack>
        <XStack>
          <Button theme="active" disabled={!trackName.trim() || addTrack.isLoading} onPress={submitTrack}>
            Add track
          </Button>
        </XStack>
        {addTrack.error ? <Paragraph color="$red10">{addTrack.error.message}</Paragraph> : null}
        {tracks.length > 0 ? (
          <XStack gap="$2" flexWrap="wrap">
            {tracks.map((t) => (
              <XStack key={t.id} alignItems="center" gap={6} paddingHorizontal={10} paddingVertical={5} borderRadius={999} backgroundColor={tint(t.color, '20')}>
                <YStack width={9} height={9} borderRadius={999} backgroundColor={t.color} />
                <Text fontSize={13} color="$color12">
                  {t.name}
                </Text>
              </XStack>
            ))}
          </XStack>
        ) : null}
      </Card>

      {/* Sessions */}
      <Card title="Add session" hint="Placed on the grid by time within its track column.">
        <XStack gap="$2" flexWrap="wrap">
          <Field label="Title">
            <Input value={title} placeholder="Talk title" onChangeText={setTitle} />
          </Field>
        </XStack>
        <YStack gap="$1.5">
          <Text fontSize={12} fontWeight="700" color="$color11" opacity={0.7}>
            Abstract
          </Text>
          <TextArea value={abstract} placeholder="What is this session about?" onChangeText={setAbstract} minHeight={72} />
        </YStack>
        <YStack gap="$1.5">
          <Text fontSize={12} fontWeight="700" color="$color11" opacity={0.7}>
            Track
          </Text>
          {cols.length === 0 ? (
            <Paragraph fontSize={13} opacity={0.6}>
              Add a track above first.
            </Paragraph>
          ) : (
            <XStack gap="$2" flexWrap="wrap">
              {cols.map((name) => {
                const color = colorForTrack(name, tracks)
                const on = sTrack === name
                return (
                  <Button
                    key={name}
                    size="$2"
                    paddingHorizontal={12}
                    borderRadius={999}
                    backgroundColor={on ? tint(color, '46') : tint(color, '1c')}
                    borderWidth={on ? 2 : 1}
                    borderColor={on ? color : '$borderColor'}
                    onPress={() => setSTrack(name)}
                  >
                    {name}
                  </Button>
                )
              })}
            </XStack>
          )}
        </YStack>
        <XStack gap="$2" flexWrap="wrap">
          <Field label="Starts (HH:MM)">
            <Input value={starts} placeholder="09:00" onChangeText={setStarts} />
          </Field>
          <Field label="Ends (HH:MM)">
            <Input value={ends} placeholder="10:00" onChangeText={setEnds} />
          </Field>
          <Field label="Room">
            <Input value={room} placeholder="Hall A" onChangeText={setRoom} />
          </Field>
        </XStack>
        <XStack>
          <Button theme="active" disabled={!sessionOk || addSession.isLoading} onPress={submitSession}>
            Add session
          </Button>
        </XStack>
        {addSession.error ? <Paragraph color="$red10">{addSession.error.message}</Paragraph> : null}
      </Card>

      {/* Speakers */}
      <Card title="Add speaker" hint={`${speakers.length} speaker${speakers.length === 1 ? '' : 's'} — attach a bio to a session.`}>
        <XStack gap="$2" flexWrap="wrap">
          <Field label="Name">
            <Input value={spName} placeholder="Speaker name" onChangeText={setSpName} />
          </Field>
        </XStack>
        <YStack gap="$1.5">
          <Text fontSize={12} fontWeight="700" color="$color11" opacity={0.7}>
            Bio
          </Text>
          <TextArea value={spBio} placeholder="Short bio" onChangeText={setSpBio} minHeight={64} />
        </YStack>
        <YStack gap="$1.5">
          <Text fontSize={12} fontWeight="700" color="$color11" opacity={0.7}>
            Session
          </Text>
          {sessions.length === 0 ? (
            <Paragraph fontSize={13} opacity={0.6}>
              Add a session above first.
            </Paragraph>
          ) : (
            <XStack gap="$2" flexWrap="wrap">
              {sessions.map((s) => {
                const on = spSession === s.id
                const color = colorForTrack(s.track, tracks)
                return (
                  <Button
                    key={s.id}
                    size="$2"
                    paddingHorizontal={12}
                    borderRadius={999}
                    backgroundColor={on ? tint(color, '46') : '#ffffff0a'}
                    borderWidth={on ? 2 : 1}
                    borderColor={on ? color : '$borderColor'}
                    onPress={() => setSpSession(s.id)}
                  >
                    {s.title}
                  </Button>
                )
              })}
            </XStack>
          )}
        </YStack>
        <XStack>
          <Button theme="active" disabled={!spName.trim() || !spSession || addSpeaker.isLoading} onPress={submitSpeaker}>
            Add speaker
          </Button>
        </XStack>
        {addSpeaker.error ? <Paragraph color="$red10">{addSpeaker.error.message}</Paragraph> : null}
      </Card>

      <Paragraph fontSize={12} textAlign="center" opacity={0.4}>
        Grid spans {fmtMin(8 * 60)}–{fmtMin(18 * 60)} by default and auto-fits to your session times.
      </Paragraph>
    </YStack>
  )
}
