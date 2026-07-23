import type { Sdg } from '../types'
import { readableTextOn } from '../lib/format'

/**
 * SDG chip. Single background only:
 *  - compact (showLabel=false): a solid colored square with the goal number,
 *    text colour auto-picked for contrast (fixes white-on-light-yellow).
 *  - labelled: same square + the goal name in normal ink, no second background.
 */
export function SdgBadge({ sdg, showLabel = true }: { sdg: Sdg; showLabel?: boolean }) {
  const square = (
    <span
      className="grid h-5 w-5 shrink-0 place-items-center rounded-[5px] text-[11px] font-bold tnum"
      style={{ background: sdg.color, color: readableTextOn(sdg.color) }}
    >
      {sdg.number}
    </span>
  )

  if (!showLabel) {
    return (
      <span title={`SDG ${sdg.number}: ${sdg.name}`} className="inline-flex">
        {square}
      </span>
    )
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium text-ink"
      title={`SDG ${sdg.number}: ${sdg.name}`}
    >
      {square}
      <span className="truncate">{sdg.name}</span>
    </span>
  )
}
