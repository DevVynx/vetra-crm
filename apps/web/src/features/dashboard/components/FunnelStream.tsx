import type { FunnelStep } from "@vetra/contracts";
import { Fragment } from "react";

import { leadStageColor, leadStageLabels } from "@/shared/constants/leadStages";
import { useElementWidth } from "@/shared/hooks/useElementWidth";
import { useTweenedNumbers } from "@/shared/hooks/useTweenedNumbers";

const STAGE_HEIGHT = 34;
const SIDE_PADDING = 8;
const MIN_BAND_RATIO = 0.15;

type Point = { y: number; half: number };

// Smooth outline through each stage's center, with vertical tangents so the sides ease
// from one width to the next instead of stepping.
function streamPath(points: Point[], centerX: number) {
  const right = points.map(({ y, half }) => ({ x: centerX + half, y }));
  const left = points.map(({ y, half }) => ({ x: centerX - half, y })).reverse();

  const ease = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const middle = (from.y + to.y) / 2;
    return `C ${from.x} ${middle} ${to.x} ${middle} ${to.x} ${to.y}`;
  };

  const down = right.slice(1).map((point, index) => ease(right[index]!, point));
  const up = left.slice(1).map((point, index) => ease(left[index]!, point));
  const first = right[0]!;
  const bottomLeft = left[0]!;

  return `M ${first.x} ${first.y} ${down.join(" ")} L ${bottomLeft.x} ${bottomLeft.y} ${up.join(" ")} Z`;
}

export function FunnelStream({ funnel }: { funnel: FunnelStep[] }) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const first = funnel[0];
  const height = funnel.length * STAGE_HEIGHT;
  const ratios = useTweenedNumbers(
    funnel.map((step) =>
      first?.reachedCount ? Math.max(step.reachedCount / first.reachedCount, MIN_BAND_RATIO) : 0
    )
  );

  if (!first) return null;

  const usable = Math.max(width - SIDE_PADDING * 2, 0);
  const halves = ratios.map((ratio) => ratio * (usable / 2));

  const outline = (halfAt: (index: number) => number) => {
    const centers = funnel.map((_, index) => ({
      y: (index + 0.5) * STAGE_HEIGHT,
      half: halfAt(index),
    }));
    const top = { y: 0, half: centers[0]!.half };
    const bottom = { y: height, half: centers.at(-1)!.half };
    return streamPath([top, ...centers, bottom], width / 2);
  };

  const previous = (index: number) => halves[Math.max(index - 1, 0)]!;
  const current = (index: number) => halves[index]!;
  const between = (index: number) => (previous(index) + current(index)) / 2;

  return (
    <div ref={ref} className="w-full" style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label="Funil de vendas">
          <defs>
            <linearGradient id="funnel-stream-fill" x1="0" y1="0" x2="0" y2="1">
              {funnel.map((step, index) => (
                <Fragment key={step.stage}>
                  <stop
                    offset={`${(index / funnel.length) * 100}%`}
                    stopColor={leadStageColor(step.stage)}
                  />
                  <stop
                    offset={`${((index + 1) / funnel.length) * 100}%`}
                    stopColor={leadStageColor(step.stage)}
                  />
                </Fragment>
              ))}
            </linearGradient>
          </defs>

          <path d={outline(previous)} fill="url(#funnel-stream-fill)" fillOpacity={0.16} />
          <path d={outline(between)} fill="url(#funnel-stream-fill)" fillOpacity={0.32} />
          <path d={outline(current)} fill="url(#funnel-stream-fill)" />

          {funnel.map((step, index) => (
            <g key={step.stage}>
              <rect
                x={0}
                y={index * STAGE_HEIGHT}
                width={width}
                height={STAGE_HEIGHT}
                fill="transparent"
              >
                <title>{`${leadStageLabels[step.stage]}: ${step.reachedCount}`}</title>
              </rect>
              <text
                x={width / 2}
                y={(index + 0.5) * STAGE_HEIGHT}
                textAnchor="middle"
                dominantBaseline="central"
                className="animate-in fade-in fill-black text-xs font-semibold tabular-nums duration-1000"
                pointerEvents="none"
              >
                {step.reachedCount}
              </text>
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}
