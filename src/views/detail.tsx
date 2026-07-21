import { YStack, XStack, H2, Paragraph, Text, Button, Separator } from '@hanzo/gui'
import { type Session, type Speaker, type Track, colorForTrack, tint, timeLabel } from '../lib/schedule'

/**
 * Session detail: the abstract, where and when it runs, its track (color-coded),
 * and the speakers tied to it (speakers.session_id → this session).
 */
export function Detail({
  session,
  tracks,
  speakers,
  onBack,
}: {
  session: Session
  tracks: Track[]
  speakers: Speaker[]
  onBack: () => void
}) {
  const color = colorForTrack(session.track, tracks)
  const mine = speakers.filter((sp) => sp.session_id === session.id)

  return (
    <YStack gap="$4" maxWidth={760} width="100%" alignSelf="center">
      <XStack>
        <Button size="$2" chromeless onPress={onBack}>
          ← Agenda
        </Button>
      </XStack>

      <YStack
        gap="$4"
        padding="$5"
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius="$6"
        backgroundColor={tint(color, '14')}
        borderLeftWidth={4}
        borderLeftColor={color}
      >
        <YStack gap="$2">
          {session.track ? (
            <XStack alignItems="center" gap={8}>
              <YStack width={10} height={10} borderRadius={999} backgroundColor={color} />
              <Text fontSize={13} fontWeight="700" color={color}>
                {session.track}
              </Text>
            </XStack>
          ) : null}
          <H2 fontSize="$8" color="$color12">
            {session.title}
          </H2>
          <Text fontSize={14} color="$color11">
            {timeLabel(session)}
          </Text>
        </YStack>

        <Separator />

        <YStack gap="$2">
          <Text fontSize={12} fontWeight="700" color="$color11" opacity={0.7}>
            ABSTRACT
          </Text>
          <Paragraph fontSize={15} lineHeight={24} color="$color12">
            {session.abstract?.trim() || 'No abstract yet.'}
          </Paragraph>
        </YStack>

        <Separator />

        <YStack gap="$3">
          <Text fontSize={12} fontWeight="700" color="$color11" opacity={0.7}>
            {mine.length === 1 ? 'SPEAKER' : 'SPEAKERS'}
          </Text>
          {mine.length === 0 ? (
            <Paragraph opacity={0.6}>No speaker assigned yet — add one in Manage.</Paragraph>
          ) : (
            <YStack gap="$3">
              {mine.map((sp) => (
                <XStack key={sp.id} gap="$3" alignItems="flex-start">
                  <YStack
                    width={40}
                    height={40}
                    borderRadius={999}
                    backgroundColor={tint(color, '40')}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize={16} fontWeight="800" color="$color12">
                      {(sp.name[0] || '?').toUpperCase()}
                    </Text>
                  </YStack>
                  <YStack flex={1} gap={2}>
                    <Text fontSize={15} fontWeight="700" color="$color12">
                      {sp.name}
                    </Text>
                    {sp.bio?.trim() ? (
                      <Paragraph fontSize={14} color="$color11" opacity={0.85}>
                        {sp.bio}
                      </Paragraph>
                    ) : null}
                  </YStack>
                </XStack>
              ))}
            </YStack>
          )}
        </YStack>
      </YStack>
    </YStack>
  )
}
