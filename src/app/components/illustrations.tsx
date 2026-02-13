import React from "react";

// ═══════════════════════════════════════════════════════
// ILLUSTRATION 1 — HERO: Hands & Dough
// Abstract: flowing dough shape, wheat stalks, flour particles
// ═══════════════════════════════════════════════════════

export function IllustrationHero({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 1200 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* Background warm gradient */}
        <linearGradient
          id="hero-bg"
          x1="0"
          y1="0"
          x2="1200"
          y2="500"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#1A110A" />
          <stop offset="40%" stopColor="#2B1709" />
          <stop offset="100%" stopColor="#3D1E0F" />
        </linearGradient>
        {/* Dough warm */}
        <radialGradient
          id="hero-dough"
          cx="0.45"
          cy="0.5"
          r="0.55"
        >
          <stop offset="0%" stopColor="#F5DCC4" />
          <stop offset="60%" stopColor="#E8C9A8" />
          <stop offset="100%" stopColor="#D4A87A" />
        </radialGradient>
        {/* Warm glow */}
        <radialGradient
          id="hero-glow"
          cx="0.3"
          cy="0.6"
          r="0.6"
        >
          <stop
            offset="0%"
            stopColor="#B93815"
            stopOpacity="0.25"
          />
          <stop
            offset="100%"
            stopColor="#B93815"
            stopOpacity="0"
          />
        </radialGradient>
        {/* Gold accent */}
        <linearGradient
          id="hero-gold"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0%" stopColor="#F5C16C" />
          <stop offset="100%" stopColor="#E8965A" />
        </linearGradient>
        {/* Wheat gradient */}
        <linearGradient
          id="hero-wheat"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor="#E8965A" />
          <stop offset="100%" stopColor="#D4883E" />
        </linearGradient>
        {/* Hand warm */}
        <linearGradient
          id="hero-hand"
          x1="0.2"
          y1="0"
          x2="0.8"
          y2="1"
        >
          <stop offset="0%" stopColor="#C49070" />
          <stop offset="100%" stopColor="#A07050" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="1200" height="500" fill="url(#hero-bg)" />

      {/* Ambient glow */}
      <ellipse
        cx="400"
        cy="320"
        rx="500"
        ry="300"
        fill="url(#hero-glow)"
      />

      {/* Back decorative circle — large */}
      <circle
        cx="850"
        cy="150"
        r="180"
        fill="#B93815"
        opacity="0.06"
      />
      <circle
        cx="850"
        cy="150"
        r="120"
        fill="#B93815"
        opacity="0.04"
      />

      {/* Flour dust particles — scattered */}
      {[
        [120, 80, 3],
        [200, 140, 2],
        [340, 60, 2.5],
        [480, 110, 1.5],
        [560, 50, 3],
        [680, 90, 2],
        [780, 160, 1.5],
        [900, 70, 2.5],
        [1020, 130, 2],
        [1100, 80, 1.5],
        [150, 200, 1.5],
        [280, 350, 2],
        [420, 280, 1.5],
        [600, 400, 2],
        [750, 350, 3],
        [880, 420, 1.5],
        [950, 280, 2],
        [1050, 380, 2.5],
        [100, 420, 1.5],
        [320, 450, 2],
        [710, 440, 1.5],
        [1150, 200, 2],
        [50, 300, 2.5],
        [500, 180, 1.5],
        [830, 380, 2],
      ].map(([x, y, r], i) => (
        <circle
          key={`dust-${i}`}
          cx={x}
          cy={y}
          r={r}
          fill="#F5DCC4"
          opacity={0.12 + (i % 3) * 0.06}
        />
      ))}

      {/* Wheat stalk — left side */}
      <g transform="translate(100, 160) rotate(-15)">
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="220"
          stroke="url(#hero-wheat)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {[0, 30, 60, 90, 120, 150].map((y, i) => (
          <g key={`wl-${i}`}>
            <ellipse
              cx={i % 2 === 0 ? -12 : 12}
              cy={y + 10}
              rx="8"
              ry="16"
              fill="url(#hero-wheat)"
              opacity={0.7 - i * 0.05}
              transform={`rotate(${i % 2 === 0 ? -25 : 25}, ${i % 2 === 0 ? -12 : 12}, ${y + 10})`}
            />
          </g>
        ))}
      </g>

      {/* Wheat stalk — right side */}
      <g transform="translate(1080, 100) rotate(10)">
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="200"
          stroke="url(#hero-wheat)"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.6"
        />
        {[0, 35, 70, 105, 140].map((y, i) => (
          <g key={`wr-${i}`}>
            <ellipse
              cx={i % 2 === 0 ? -10 : 10}
              cy={y + 10}
              rx="7"
              ry="14"
              fill="url(#hero-wheat)"
              opacity={0.5 - i * 0.04}
              transform={`rotate(${i % 2 === 0 ? -20 : 20}, ${i % 2 === 0 ? -10 : 10}, ${y + 10})`}
            />
          </g>
        ))}
      </g>

      {/* Main dough shape — organic blob */}
      <path
        d="M350,310 C350,250 420,200 520,210 C620,220 680,190 720,230 C760,270 780,310 750,360 C720,410 640,430 560,420 C480,410 400,400 370,370 C340,340 350,310 350,310Z"
        fill="url(#hero-dough)"
        opacity="0.9"
      />
      {/* Dough highlight */}
      <path
        d="M420,280 C440,250 520,230 580,240 C640,250 660,270 640,300 C620,330 540,340 480,330 C420,320 400,310 420,280Z"
        fill="#F5DCC4"
        opacity="0.5"
      />

      {/* Abstract hand — left */}
      <path
        d="M320,340 C310,310 330,280 360,270 C370,267 378,272 375,285 C372,298 355,310 350,330 C345,350 335,360 320,340Z"
        fill="url(#hero-hand)"
        opacity="0.85"
      />
      {/* Abstract hand — right */}
      <path
        d="M750,300 C770,280 790,275 800,290 C810,305 800,330 780,350 C760,370 740,365 735,345 C730,325 730,320 750,300Z"
        fill="url(#hero-hand)"
        opacity="0.85"
      />

      {/* Flour scatter on dough */}
      {[
        [460, 270, 4],
        [530, 250, 3],
        [600, 280, 3.5],
        [490, 320, 2.5],
        [570, 340, 3],
        [640, 300, 2],
        [510, 290, 2],
        [560, 260, 2.5],
      ].map(([x, y, r], i) => (
        <circle
          key={`fd-${i}`}
          cx={x}
          cy={y}
          r={r}
          fill="#FFFAF6"
          opacity={0.25 + (i % 3) * 0.1}
        />
      ))}

      {/* Geometric accents */}
      <circle
        cx="200"
        cy="400"
        r="40"
        fill="none"
        stroke="#F5C16C"
        strokeWidth="1.5"
        opacity="0.15"
      />
      <circle
        cx="200"
        cy="400"
        r="25"
        fill="none"
        stroke="#F5C16C"
        strokeWidth="1"
        opacity="0.1"
      />
      <circle
        cx="1000"
        cy="350"
        r="55"
        fill="none"
        stroke="#E8632B"
        strokeWidth="1.5"
        opacity="0.12"
      />
      <rect
        x="920"
        y="200"
        width="60"
        height="60"
        rx="16"
        fill="none"
        stroke="#F5C16C"
        strokeWidth="1.5"
        opacity="0.1"
        transform="rotate(15, 950, 230)"
      />

      {/* Decorative cross-hatch — scoring pattern on dough */}
      <g opacity="0.2">
        <line
          x1="480"
          y1="280"
          x2="580"
          y2="320"
          stroke="#A07050"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="520"
          y1="260"
          x2="540"
          y2="350"
          stroke="#A07050"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════
// ILLUSTRATION 2 — OVEN: Arch with flames & sparks
// ═══════════════════════════════════════════════════════

export function IllustrationOven({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 1200 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient
          id="oven-bg"
          x1="0"
          y1="0"
          x2="1200"
          y2="400"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#2B1709" />
          <stop offset="50%" stopColor="#1A110A" />
          <stop offset="100%" stopColor="#0C0906" />
        </linearGradient>
        <radialGradient
          id="oven-fire-glow"
          cx="0.5"
          cy="0.7"
          r="0.5"
        >
          <stop
            offset="0%"
            stopColor="#E8632B"
            stopOpacity="0.35"
          />
          <stop
            offset="50%"
            stopColor="#B93815"
            stopOpacity="0.15"
          />
          <stop
            offset="100%"
            stopColor="#B93815"
            stopOpacity="0"
          />
        </radialGradient>
        <linearGradient
          id="oven-brick"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor="#6B4530" />
          <stop offset="100%" stopColor="#4A2E1C" />
        </linearGradient>
        <linearGradient
          id="oven-arch-inner"
          x1="0.5"
          y1="0"
          x2="0.5"
          y2="1"
        >
          <stop offset="0%" stopColor="#1A0C05" />
          <stop offset="100%" stopColor="#0A0503" />
        </linearGradient>
        <linearGradient
          id="flame1"
          x1="0.5"
          y1="1"
          x2="0.5"
          y2="0"
        >
          <stop offset="0%" stopColor="#B93815" />
          <stop offset="50%" stopColor="#E8632B" />
          <stop offset="100%" stopColor="#F5C16C" />
        </linearGradient>
        <linearGradient
          id="flame2"
          x1="0.5"
          y1="1"
          x2="0.5"
          y2="0"
        >
          <stop offset="0%" stopColor="#E8632B" />
          <stop offset="100%" stopColor="#F5C16C" />
        </linearGradient>
        <linearGradient
          id="ember-grad"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0%" stopColor="#F5C16C" />
          <stop offset="100%" stopColor="#E8632B" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="1200" height="400" fill="url(#oven-bg)" />

      {/* Fire glow */}
      <ellipse
        cx="600"
        cy="300"
        rx="400"
        ry="250"
        fill="url(#oven-fire-glow)"
      />

      {/* Brick wall texture — rows of bricks */}
      <g opacity="0.15">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((row) => (
          <g key={`br-${row}`}>
            {Array.from({ length: 12 }).map((_, col) => (
              <rect
                key={`b-${row}-${col}`}
                x={col * 100 + (row % 2 === 0 ? 0 : 50) - 50}
                y={row * 50}
                width="96"
                height="46"
                rx="3"
                fill="url(#oven-brick)"
                opacity={0.3 + Math.random() * 0.2}
              />
            ))}
          </g>
        ))}
      </g>

      {/* Oven arch — outer */}
      <path
        d="M340,380 L340,200 C340,120 420,60 600,60 C780,60 860,120 860,200 L860,380"
        fill="none"
        stroke="#8B5E3C"
        strokeWidth="40"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Oven arch — inner wall */}
      <path
        d="M370,380 L370,210 C370,140 440,90 600,90 C760,90 830,140 830,210 L830,380"
        fill="none"
        stroke="#6B4530"
        strokeWidth="20"
        opacity="0.5"
      />

      {/* Oven interior — dark */}
      <path
        d="M390,380 L390,215 C390,150 455,105 600,105 C745,105 810,150 810,215 L810,380 Z"
        fill="url(#oven-arch-inner)"
      />

      {/* Interior glow on floor */}
      <ellipse
        cx="600"
        cy="360"
        rx="180"
        ry="30"
        fill="#E8632B"
        opacity="0.15"
      />

      {/* Flames — tall center */}
      <path
        d="M580,380 C570,340 555,300 570,260 C580,230 595,250 600,280 C605,250 620,230 630,260 C645,300 630,340 620,380Z"
        fill="url(#flame1)"
        opacity="0.85"
      />
      {/* Flames — left */}
      <path
        d="M480,380 C475,355 465,330 475,300 C482,280 492,295 495,315 C498,295 508,280 515,300 C525,330 515,355 510,380Z"
        fill="url(#flame1)"
        opacity="0.65"
      />
      {/* Flames — right */}
      <path
        d="M690,380 C685,350 678,325 685,295 C690,275 698,290 700,310 C702,290 710,275 715,295 C722,325 715,350 710,380Z"
        fill="url(#flame1)"
        opacity="0.65"
      />
      {/* Flames — small left */}
      <path
        d="M440,380 C438,365 435,348 440,330 C443,320 448,328 450,340 C452,328 457,320 460,330 C465,348 462,365 458,380Z"
        fill="url(#flame2)"
        opacity="0.45"
      />
      {/* Flames — small right */}
      <path
        d="M740,380 C738,362 736,345 740,325 C743,315 747,322 748,335 C749,322 753,315 756,325 C760,345 758,362 755,380Z"
        fill="url(#flame2)"
        opacity="0.45"
      />

      {/* Inner flame highlights */}
      <path
        d="M590,380 C588,355 585,330 592,305 C596,295 602,305 600,330Z"
        fill="#F5C16C"
        opacity="0.5"
      />
      <path
        d="M610,380 C612,355 615,330 608,305 C604,295 598,305 600,330Z"
        fill="#F5C16C"
        opacity="0.4"
      />

      {/* Sparks / embers floating up */}
      {[
        [560, 180, 3],
        [620, 150, 2.5],
        [590, 120, 2],
        [640, 170, 2],
        [530, 200, 1.5],
        [670, 190, 2],
        [580, 100, 1.5],
        [610, 80, 2],
        [550, 140, 2.5],
        [650, 130, 1.5],
        [500, 160, 2],
        [700, 150, 1.5],
        [570, 60, 1.5],
        [630, 50, 2],
        [540, 90, 1.5],
        [660, 70, 1.5],
      ].map(([x, y, r], i) => (
        <circle
          key={`sp-${i}`}
          cx={x}
          cy={y}
          r={r}
          fill="url(#ember-grad)"
          opacity={0.3 + (i % 4) * 0.12}
        />
      ))}

      {/* Heat wave lines */}
      <g
        opacity="0.12"
        stroke="#F5C16C"
        strokeWidth="1.5"
        fill="none"
      >
        <path d="M520,100 C530,90 540,95 550,85 C560,75 570,80 580,70" />
        <path d="M600,90 C610,80 620,85 630,75 C640,65 650,70 660,60" />
        <path d="M560,70 C570,60 580,65 590,55 C600,45 610,50 620,40" />
      </g>

      {/* Side decorative — pizza peel silhouette left */}
      <g
        opacity="0.08"
        transform="translate(140, 120) rotate(-20)"
      >
        <rect
          x="0"
          y="0"
          width="12"
          height="160"
          rx="6"
          fill="#E8965A"
        />
        <ellipse
          cx="6"
          cy="-25"
          rx="35"
          ry="28"
          fill="#E8965A"
        />
      </g>

      {/* Decorative circles */}
      <circle
        cx="180"
        cy="100"
        r="30"
        fill="none"
        stroke="#F5C16C"
        strokeWidth="1"
        opacity="0.1"
      />
      <circle
        cx="1020"
        cy="120"
        r="45"
        fill="none"
        stroke="#E8632B"
        strokeWidth="1.5"
        opacity="0.08"
      />
      <circle
        cx="1050"
        cy="300"
        r="25"
        fill="none"
        stroke="#F5C16C"
        strokeWidth="1"
        opacity="0.1"
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════
// ILLUSTRATION 3 — PIZZA: Top-down geometric pizza
// ═══════════════════════════════════════════════════════

export function IllustrationPizza({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 1200 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient
          id="pizza-bg"
          x1="0"
          y1="0"
          x2="1200"
          y2="380"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#1A110A" />
          <stop offset="50%" stopColor="#2B1709" />
          <stop offset="100%" stopColor="#1A110A" />
        </linearGradient>
        <radialGradient
          id="pizza-glow"
          cx="0.5"
          cy="0.5"
          r="0.45"
        >
          <stop
            offset="0%"
            stopColor="#E8632B"
            stopOpacity="0.2"
          />
          <stop
            offset="100%"
            stopColor="#E8632B"
            stopOpacity="0"
          />
        </radialGradient>
        {/* Crust */}
        <radialGradient
          id="pizza-crust"
          cx="0.5"
          cy="0.5"
          r="0.5"
        >
          <stop offset="70%" stopColor="#D4883E" />
          <stop offset="85%" stopColor="#C47830" />
          <stop offset="100%" stopColor="#A06020" />
        </radialGradient>
        {/* Sauce */}
        <radialGradient
          id="pizza-sauce"
          cx="0.45"
          cy="0.45"
          r="0.5"
        >
          <stop offset="0%" stopColor="#C44020" />
          <stop offset="100%" stopColor="#A03018" />
        </radialGradient>
        {/* Mozzarella */}
        <radialGradient
          id="pizza-mozz"
          cx="0.4"
          cy="0.4"
          r="0.5"
        >
          <stop offset="0%" stopColor="#FFF8F0" />
          <stop offset="100%" stopColor="#F0E0C8" />
        </radialGradient>
        {/* Basil */}
        <linearGradient
          id="pizza-basil"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0%" stopColor="#2D7D3F" />
          <stop offset="100%" stopColor="#1E5C2C" />
        </linearGradient>
        {/* Char spots */}
        <radialGradient
          id="pizza-char"
          cx="0.5"
          cy="0.5"
          r="0.5"
        >
          <stop offset="0%" stopColor="#6B3510" />
          <stop offset="100%" stopColor="#4A2008" />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width="1200" height="380" fill="url(#pizza-bg)" />
      <ellipse
        cx="600"
        cy="200"
        rx="350"
        ry="250"
        fill="url(#pizza-glow)"
      />

      {/* Scattered ingredients around — herbs, tomatoes, flour */}
      {/* Small tomato — left */}
      <circle
        cx="200"
        cy="160"
        r="16"
        fill="#C44020"
        opacity="0.25"
      />
      <circle
        cx="200"
        cy="160"
        r="10"
        fill="#A03018"
        opacity="0.15"
      />
      {/* Small tomato — right */}
      <circle
        cx="980"
        cy="220"
        r="14"
        fill="#C44020"
        opacity="0.2"
      />
      {/* Basil leaves scattered */}
      <ellipse
        cx="280"
        cy="300"
        rx="12"
        ry="7"
        fill="#2D7D3F"
        opacity="0.2"
        transform="rotate(-30, 280, 300)"
      />
      <ellipse
        cx="920"
        cy="130"
        rx="10"
        ry="6"
        fill="#2D7D3F"
        opacity="0.18"
        transform="rotate(20, 920, 130)"
      />
      <ellipse
        cx="150"
        cy="80"
        rx="9"
        ry="5"
        fill="#2D7D3F"
        opacity="0.15"
        transform="rotate(-15, 150, 80)"
      />
      <ellipse
        cx="1050"
        cy="300"
        rx="11"
        ry="6"
        fill="#2D7D3F"
        opacity="0.15"
        transform="rotate(40, 1050, 300)"
      />

      {/* Flour dots */}
      {[
        [120, 200, 2],
        [300, 80, 2.5],
        [400, 330, 2],
        [800, 60, 2],
        [900, 340, 2.5],
        [1100, 150, 2],
        [1060, 80, 1.5],
        [350, 50, 2],
        [700, 350, 1.5],
        [500, 40, 2],
        [1000, 50, 2],
        [140, 320, 1.5],
      ].map(([x, y, r], i) => (
        <circle
          key={`pf-${i}`}
          cx={x}
          cy={y}
          r={r}
          fill="#F5DCC4"
          opacity={0.1 + (i % 3) * 0.04}
        />
      ))}

      {/* THE PIZZA — centered */}
      <g transform="translate(600, 195)">
        {/* Shadow */}
        <ellipse
          cx="5"
          cy="10"
          rx="145"
          ry="145"
          fill="#0A0503"
          opacity="0.3"
        />

        {/* Crust circle */}
        <circle
          cx="0"
          cy="0"
          r="140"
          fill="url(#pizza-crust)"
        />

        {/* Crust edge texture — char spots */}
        {[
          0, 30, 65, 100, 135, 170, 205, 240, 275, 310, 340,
        ].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const cx = Math.cos(rad) * 128;
          const cy = Math.sin(rad) * 128;
          return (
            <ellipse
              key={`ch-${i}`}
              cx={cx}
              cy={cy}
              rx={6 + (i % 3) * 2}
              ry={4 + (i % 2) * 2}
              fill="url(#pizza-char)"
              opacity={0.3 + (i % 3) * 0.1}
              transform={`rotate(${angle + 20}, ${cx}, ${cy})`}
            />
          );
        })}

        {/* Sauce */}
        <circle
          cx="0"
          cy="0"
          r="115"
          fill="url(#pizza-sauce)"
        />

        {/* Mozzarella blobs — irregular shapes */}
        {[
          [-40, -30, 30, 24],
          [35, -50, 25, 20],
          [20, 40, 28, 22],
          [-50, 35, 22, 18],
          [60, -10, 24, 20],
          [-25, -65, 20, 16],
          [-70, -10, 18, 22],
          [10, -15, 35, 28],
          [50, 55, 22, 18],
          [-55, 60, 20, 16],
          [-10, 70, 24, 18],
          [70, 30, 18, 14],
        ].map(([cx, cy, rx, ry], i) => (
          <ellipse
            key={`mz-${i}`}
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill="url(#pizza-mozz)"
            opacity={0.8 - (i % 3) * 0.05}
            transform={`rotate(${i * 25}, ${cx}, ${cy})`}
          />
        ))}

        {/* Mozzarella highlights */}
        {[
          [-35, -28, 8, 5],
          [38, -48, 6, 4],
          [15, 38, 7, 5],
          [-48, 33, 5, 4],
        ].map(([cx, cy, rx, ry], i) => (
          <ellipse
            key={`mh-${i}`}
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill="white"
            opacity={0.3}
            transform={`rotate(${i * 40}, ${cx}, ${cy})`}
          />
        ))}

        {/* Basil leaves on top */}
        {[
          [0, -20, -10],
          [-40, 20, 30],
          [45, 30, -25],
          [-15, 55, 15],
          [30, -55, 5],
        ].map(([cx, cy, rot], i) => (
          <g
            key={`bl-${i}`}
            transform={`translate(${cx}, ${cy}) rotate(${rot})`}
          >
            <ellipse
              cx="0"
              cy="0"
              rx="12"
              ry="7"
              fill="url(#pizza-basil)"
            />
            <line
              x1="-8"
              y1="0"
              x2="8"
              y2="0"
              stroke="#1E5C2C"
              strokeWidth="0.8"
              opacity="0.5"
            />
          </g>
        ))}

        {/* Olive oil drops */}
        {[
          [25, -10],
          [-30, 50],
          [55, -40],
          [-60, -25],
          [15, 65],
        ].map(([cx, cy], i) => (
          <circle
            key={`oil-${i}`}
            cx={cx}
            cy={cy}
            r={2.5}
            fill="#F5C16C"
            opacity={0.4}
          />
        ))}
      </g>

      {/* Decorative geometry */}
      <circle
        cx="350"
        cy="100"
        r="35"
        fill="none"
        stroke="#F5C16C"
        strokeWidth="1"
        opacity="0.1"
      />
      <circle
        cx="850"
        cy="80"
        r="25"
        fill="none"
        stroke="#E8632B"
        strokeWidth="1"
        opacity="0.08"
      />
      <rect
        x="100"
        y="250"
        width="40"
        height="40"
        rx="12"
        fill="none"
        stroke="#F5C16C"
        strokeWidth="1"
        opacity="0.08"
        transform="rotate(15, 120, 270)"
      />
      <rect
        x="1050"
        y="200"
        width="30"
        height="30"
        rx="8"
        fill="none"
        stroke="#E8632B"
        strokeWidth="1"
        opacity="0.08"
        transform="rotate(-20, 1065, 215)"
      />

      {/* Small decorative pizza slices hinted at edges */}
      <g
        opacity="0.06"
        transform="translate(100, 120) rotate(-10)"
      >
        <path d="M0,0 L60,-20 L55,25 Z" fill="#D4883E" />
      </g>
      <g
        opacity="0.05"
        transform="translate(1060, 280) rotate(25)"
      >
        <path d="M0,0 L50,-15 L48,22 Z" fill="#D4883E" />
      </g>
    </svg>
  );
}