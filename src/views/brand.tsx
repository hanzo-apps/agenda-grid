import { YStack } from '@hanzo/gui'
import { PALETTE } from '../lib/schedule'

/** The Sched mark: a 2×2 of track hues, echoing the color-coded agenda grid. */
export function Logo({ size = 30 }: { size?: number }) {
  const cell = size / 2
  return (
    <YStack width={size} height={size} borderRadius={size / 3.6} overflow="hidden" flexDirection="row" flexWrap="wrap">
      {PALETTE.slice(0, 4).map((c) => (
        <YStack key={c} width={cell} height={cell} backgroundColor={c} />
      ))}
    </YStack>
  )
}
