import { useId } from 'react';
import { capSets, finishes, getProduct, keyboardLayout, type Configuration } from '../lib/catalog';

export function KeyboardIllustration({
  config,
  className = '',
  decorative = false,
}: {
  config: Configuration;
  className?: string;
  decorative?: boolean;
}) {
  const id = useId().replaceAll(':', ''),
    layout = keyboardLayout(config.model),
    colors = capSets[config.caps];
  const unit = 27,
    w = layout.width * unit,
    h = layout.height * unit;
  const scale = config.model === 's98' ? 0.96 : 1.08;
  return (
    <svg
      className={`keyboard-illustration ${className}`}
      viewBox="0 0 700 390"
      role={decorative ? undefined : 'img'}
      aria-label={
        decorative
          ? undefined
          : `${getProduct(config.model)!.name} in ${finishes[config.finish].name} with ${colors.name} keycaps`
      }
      aria-hidden={decorative || undefined}
    >
      <defs>
        <linearGradient id={`${id}body`} x2=".8" y2="1">
          <stop stopColor={finishes[config.finish].hex} />
          <stop offset="1" stopColor={finishes[config.finish].hex} />
        </linearGradient>
        <linearGradient id={`${id}cap`} x2="0" y2="1">
          <stop stopColor="#fff" stopOpacity=".18" />
          <stop offset="1" stopColor="#000" stopOpacity=".07" />
        </linearGradient>
        <filter id={`${id}shadow`} x="-30%" y="-60%" width="160%" height="240%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <g
        transform={`translate(${(700 - w * scale) / 2 - 15} ${155 - h * 0.22}) rotate(-12 ${w / 2} ${h / 2}) skewX(12) scale(${scale} .85)`}
      >
        <rect
          x="-6"
          y="39"
          width={w + 22}
          height={h + 5}
          rx="19"
          fill="#342d25"
          opacity=".21"
          filter={`url(#${id}shadow)`}
        />
        <rect
          x="-9"
          y="15"
          width={w + 18}
          height={h + 8}
          rx="15"
          fill={finishes[config.finish].hex}
          stroke="#000"
          strokeOpacity=".22"
        />
        <rect
          x="-9"
          y="0"
          width={w + 18}
          height={h + 8}
          rx="15"
          fill={`url(#${id}body)`}
          stroke="#fff"
          strokeOpacity=".45"
        />
        <rect x="1" y="9" width={w - 2} height={h - 11} rx="9" fill="#252421" opacity=".64" />
        {layout.keys.map((key, i) => {
          const x = key.x * unit + 9,
            y = key.y * unit + 16,
            width = key.w * unit - 3,
            fill =
              key.kind === 'accent'
                ? colors.accent
                : key.kind === 'mod'
                  ? colors.mods
                  : colors.main;
          const dark =
            (key.kind === 'main' && config.caps === 'contrast') ||
            (key.kind === 'mod' && config.caps === 'signal') ||
            key.kind === 'accent';
          return (
            <g key={i}>
              <rect
                x={x}
                y={y + 3}
                width={width}
                height={23}
                rx="3.5"
                fill="#20201d"
                opacity=".5"
              />
              <rect x={x} y={y} width={width} height={23} rx="3.5" fill={fill} />
              <rect x={x} y={y} width={width} height={23} rx="3.5" fill={`url(#${id}cap)`} />
              <path d={`M${x + 3} ${y + 3}h${width - 6}`} stroke="#fff" strokeOpacity=".2" />
              <text
                x={x + width / 2}
                y={y + 12}
                fill={dark ? '#faf5e9' : '#343731'}
                fontSize={key.label.length > 3 ? 5 : 7}
                fontFamily="system-ui,sans-serif"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {key.label}
              </text>
            </g>
          );
        })}
        <rect x={w - 57} y={h - 3} width="28" height="2" rx="1" fill={colors.accent} />
        <text
          x="11"
          y={h + 17}
          fontFamily="monospace"
          fontSize="5"
          letterSpacing="1.5"
          fill="#171a18"
          opacity=".6"
        >
          RAFQEN / STUDIO SERIES
        </text>
      </g>
    </svg>
  );
}
