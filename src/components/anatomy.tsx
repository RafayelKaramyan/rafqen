import { useId, useState } from 'react';
const layers = [
  {
    name: 'The touch',
    part: 'PBT KEYCAPS',
    text: 'A lightly textured surface and a sculpted profile. The part you spend all day getting to know.',
  },
  {
    name: 'The response',
    part: 'MECHANICAL SWITCHES',
    text: 'Smooth, tactile or quiet. Choose the response that follows the way you think and type.',
  },
  {
    name: 'The quiet',
    part: 'CUSHIONED MOUNT',
    text: 'An isolated plate and a soft internal layer, designed as a quieter place for each keystroke to land.',
  },
  {
    name: 'The foundation',
    part: 'ALUMINUM ENCLOSURE',
    text: 'A solid form, softened at the edges. A considered weight that keeps the board settled on your desk.',
  },
];
export function Anatomy() {
  const [selected, setSelected] = useState(0),
    id = useId();
  return (
    <section className="anatomy-section section-space">
      <div className="section-kicker">
        <span>02 / BENEATH THE SURFACE</span>
        <span>A STUDY IN SMALL DETAILS</span>
      </div>
      <div className="anatomy-layout">
        <div className="anatomy-copy">
          <h2>
            The feel is
            <br />
            in the details.
          </h2>
          <p className="section-description">
            Every layer has a part to play.
            <br />
            Take a closer look.
          </p>
          <div
            className="layer-tabs"
            role="tablist"
            aria-label="Keyboard construction"
            aria-orientation="vertical"
          >
            {layers.map((layer, i) => (
              <button
                key={layer.name}
                id={`${id}-tab-${i}`}
                role="tab"
                aria-selected={selected === i}
                aria-controls={`${id}-panel`}
                tabIndex={selected === i ? 0 : -1}
                onClick={() => setSelected(i)}
                onKeyDown={(e) => {
                  if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
                    e.preventDefault();
                    const next =
                      e.key === 'Home'
                        ? 0
                        : e.key === 'End'
                          ? 3
                          : (selected + (e.key === 'ArrowDown' ? 1 : 3)) % 4;
                    setSelected(next);
                    document.getElementById(`${id}-tab-${next}`)?.focus();
                  }
                }}
              >
                <span>0{i + 1}</span>
                {layer.name}
                <span className="layer-plus">{selected === i ? '−' : '+'}</span>
              </button>
            ))}
          </div>
          <div
            role="tabpanel"
            id={`${id}-panel`}
            aria-labelledby={`${id}-tab-${selected}`}
            className="layer-description"
          >
            <span className="eyebrow">{layers[selected]!.part}</span>
            <p>{layers[selected]!.text}</p>
          </div>
        </div>
        <div className="anatomy-art" aria-hidden="true">
          <div className="art-orbit" />
          <svg viewBox="0 0 600 580">
            <defs>
              <linearGradient id={`${id}case`} x2="1" y2="1">
                <stop stopColor="#bec0b9" />
                <stop offset="1" stopColor="#7c817a" />
              </linearGradient>
            </defs>
            {[3, 2, 1, 0].map((i) => (
              <g
                key={i}
                className={`anatomy-layer ${selected === i ? 'focused' : ''}`}
                style={{ transform: `translateY(${i * 82 - 28}px)` }}
              >
                <path
                  d="M83 126 424 66 541 174 197 241Z"
                  fill={
                    i === 3
                      ? `url(#${id}case)`
                      : i === 2
                        ? '#3b413b'
                        : i === 1
                          ? '#536253'
                          : '#d7d1c5'
                  }
                  stroke={selected === i ? '#bd4b2f' : '#959b91'}
                  strokeWidth={selected === i ? 2 : 1}
                />
                {i === 0
                  ? Array.from({ length: 65 }, (_, n) => {
                      const row = Math.floor(n / 13),
                        col = n % 13;
                      return (
                        <path
                          key={n}
                          d={`M${105 + col * 24 + row * 18} ${130 - col * 4 + row * 15}l18-3 12 11-18 4Z`}
                          fill={
                            n === 0 || n === 51 ? '#b94a2f' : n % 13 < 2 ? '#afa99d' : '#eeeadf'
                          }
                          stroke="#918c80"
                          strokeWidth=".5"
                        />
                      );
                    })
                  : null}
                {i === 1
                  ? Array.from({ length: 35 }, (_, n) => {
                      const row = Math.floor(n / 7),
                        col = n % 7;
                      return (
                        <path
                          key={n}
                          d={`M${113 + col * 42 + row * 18} ${128 - col * 7.2 + row * 15}l14-2.5 9 8-14 3Z`}
                          fill="#8b9b7f"
                          stroke="#d5c8af"
                        />
                      );
                    })
                  : null}
                <path
                  d="M83 126v13l114 116 344-68v-13L197 241Z"
                  fill={i === 3 ? '#6e746e' : i === 2 ? '#242a25' : i === 1 ? '#394d3b' : '#a6a194'}
                  opacity=".75"
                />
              </g>
            ))}
          </svg>
          <div className="art-note">
            <span>EXPLODED VIEW</span>
            <span>STUDIO 75 / CONCEPT</span>
          </div>
        </div>
      </div>
    </section>
  );
}
