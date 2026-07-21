import { ScrollView, YStack, XStack, Text, Button, Paragraph } from '@hanzo/gui'
import {
  type Session,
  type Track,
  colorForTrack,
  tint,
  fmtMin,
  fmtTime,
  toMin,
  trackColumns,
  dayBounds,
  PX_PER_MIN,
  GUTTER_W,
  COL_W,
  GRID_BODY_H,
} from '../lib/schedule'

const LINE = '#ffffff14'
const PANEL = '#ffffff08'

/** One session, positioned by start time and sized by duration within its lane. */
function Block({
  s,
  color,
  dayStart,
  onOpen,
}: {
  s: Session
  color: string
  dayStart: number
  onOpen: () => void
}) {
  const start = toMin(s.starts_at)
  if (start == null) return null
  const end = toMin(s.ends_at) ?? start + 60
  const top = (start - dayStart) * PX_PER_MIN
  const height = Math.max((end - start) * PX_PER_MIN - 4, 34)

  return (
    <Button
      position="absolute"
      top={top + 2}
      left={6}
      right={6}
      height={height}
      padding={8}
      borderWidth={0}
      borderLeftWidth={3}
      borderLeftColor={color}
      borderRadius={9}
      backgroundColor={tint(color, '24')}
      hoverStyle={{ backgroundColor: tint(color, '3a') }}
      pressStyle={{ backgroundColor: tint(color, '3a') }}
      justifyContent="flex-start"
      alignItems="stretch"
      overflow="hidden"
      onPress={onOpen}
    >
      <YStack gap={2} overflow="hidden">
        <Text fontSize={13} fontWeight="700" color="$color12" numberOfLines={2}>
          {s.title}
        </Text>
        <Text fontSize={11} color="$color11" opacity={0.85} numberOfLines={1}>
          {fmtTime(s.starts_at)}–{fmtTime(s.ends_at)}
          {s.room ? ` · ${s.room}` : ''}
        </Text>
      </YStack>
    </Button>
  )
}

/**
 * The agenda grid: a scrollable time-axis matrix. Rows are hours down a sticky
 * time gutter; columns are color-coded tracks. Every session is a block placed
 * by its start and sized by its duration. Horizontal scroll handles many tracks.
 */
export function Agenda({
  sessions,
  tracks,
  onOpen,
}: {
  sessions: Session[]
  tracks: Track[]
  onOpen: (id: string) => void
}) {
  const cols = trackColumns(tracks, sessions)
  const { start: dayStart, end: dayEnd } = dayBounds(sessions)
  const totalMin = dayEnd - dayStart
  const contentH = totalMin * PX_PER_MIN
  const innerW = GUTTER_W + cols.length * COL_W
  const hours: number[] = []
  for (let t = dayStart; t <= dayEnd; t += 60) hours.push(t)

  if (cols.length === 0) {
    return (
      <YStack
        alignItems="center"
        justifyContent="center"
        gap="$3"
        padding="$8"
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius="$6"
        backgroundColor={PANEL}
      >
        <Text fontSize={40}>🗓️</Text>
        <Paragraph fontSize={16} fontWeight="700" color="$color12">
          No tracks yet
        </Paragraph>
        <Paragraph textAlign="center" opacity={0.6} maxWidth={360}>
          Head to Manage to add a track and a few sessions — they’ll lay out here
          by time and track.
        </Paragraph>
      </YStack>
    )
  }

  return (
    <YStack borderWidth={1} borderColor="$borderColor" borderRadius="$6" overflow="hidden" backgroundColor="$background">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <YStack width={innerW}>
          {/* Track header row — stays above the vertical scroller. */}
          <XStack height={46} borderBottomWidth={1} borderColor="$borderColor" backgroundColor={PANEL}>
            <YStack width={GUTTER_W} />
            {cols.map((name) => {
              const color = colorForTrack(name, tracks)
              return (
                <XStack
                  key={name}
                  width={COL_W}
                  alignItems="center"
                  gap={8}
                  paddingHorizontal={12}
                  borderLeftWidth={1}
                  borderColor="$borderColor"
                  backgroundColor={tint(color, '1e')}
                >
                  <YStack width={9} height={9} borderRadius={999} backgroundColor={color} />
                  <Text fontSize={13} fontWeight="700" color="$color12" numberOfLines={1}>
                    {name}
                  </Text>
                </XStack>
              )
            })}
          </XStack>

          {/* Scrollable body — time gutter + track lanes. */}
          <ScrollView showsVerticalScrollIndicator={false} maxHeight={GRID_BODY_H}>
            <XStack height={contentH}>
              {/* Sticky-feel time gutter. */}
              <YStack width={GUTTER_W} position="relative" backgroundColor={PANEL} borderRightWidth={1} borderColor="$borderColor">
                {hours.map((t) => (
                  <Text
                    key={t}
                    position="absolute"
                    top={(t - dayStart) * PX_PER_MIN - 7}
                    left={0}
                    right={8}
                    textAlign="right"
                    fontSize={11}
                    color="$color11"
                    opacity={0.6}
                  >
                    {fmtMin(t)}
                  </Text>
                ))}
              </YStack>

              {/* One lane per track. */}
              {cols.map((name) => {
                const color = colorForTrack(name, tracks)
                const laneSessions = sessions.filter(
                  (s) => s.track.trim().toLowerCase() === name.trim().toLowerCase(),
                )
                return (
                  <YStack key={name} width={COL_W} position="relative" borderLeftWidth={1} borderColor="$borderColor">
                    {hours.map((t) => (
                      <YStack
                        key={t}
                        position="absolute"
                        top={(t - dayStart) * PX_PER_MIN}
                        left={0}
                        right={0}
                        height={1}
                        backgroundColor={LINE}
                      />
                    ))}
                    {laneSessions.map((s) => (
                      <Block key={s.id} s={s} color={color} dayStart={dayStart} onOpen={() => onOpen(s.id)} />
                    ))}
                  </YStack>
                )
              })}
            </XStack>
          </ScrollView>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
