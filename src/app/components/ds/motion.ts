/**
 * Motion foundation presets.
 *
 * Runtime components import an interaction intent, never spring physics or
 * timing literals. `MotionConfig reducedMotion="user"` in App is the global
 * safety net; decorative infinite motion also opts out explicitly.
 */
export const motionSpring = {
  liquid: { type: "spring", stiffness: 230, damping: 26, mass: 1.05 },
  quick: { type: "spring", stiffness: 420, damping: 32, mass: 0.7 },
  standard: { type: "spring", stiffness: 400, damping: 30 },
  gentle: { type: "spring", stiffness: 280, damping: 28, mass: 0.8 },
  emphasisEnter: { type: "spring", stiffness: 380, damping: 28 },
  sectionEnter: { type: "spring", stiffness: 380, damping: 30 },
  stepEnter: { type: "spring", stiffness: 320, damping: 30 },
  responsiveEnter: { type: "spring", stiffness: 400, damping: 25 },
  collectionEnter: { type: "spring", stiffness: 400, damping: 28 },
  disclosure: { type: "spring", stiffness: 500, damping: 28 },
  selection: { type: "spring", stiffness: 420, damping: 30 },
  panel: { type: "spring", stiffness: 420, damping: 34 },
  balanced: { type: "spring", stiffness: 400, damping: 25 },
  steady: { type: "spring", stiffness: 400, damping: 32 },
  responsiveSoft: { type: "spring", stiffness: 400, damping: 28 },
  responsiveSettled: { type: "spring", stiffness: 400, damping: 26 },
  crisp: { type: "spring", stiffness: 500, damping: 25 },
  crispControl: { type: "spring", stiffness: 500, damping: 30 },
  crispDisclosure: { type: "spring", stiffness: 500, damping: 28 },
  crispSettled: { type: "spring", stiffness: 500, damping: 32 },
  crispPanel: { type: "spring", stiffness: 500, damping: 35 },
  checkmark: { type: "spring", stiffness: 600, damping: 20 },
  radioMark: { type: "spring", stiffness: 600, damping: 18 },
  sheetContent: { type: "spring", stiffness: 400, damping: 32 },
  matchGauge: { type: "spring", stiffness: 380, damping: 26 },
  matchPanel: { type: "spring", stiffness: 380, damping: 32 },
  highlightedMatch: { type: "spring", stiffness: 450, damping: 28 },
  configuratorControl: { type: "spring", stiffness: 450, damping: 30 },
  statValue: { type: "spring", stiffness: 400, damping: 26 },
  recipeStage: { type: "spring", stiffness: 360, damping: 31, mass: 0.72 },
  recipeSection: { type: "spring", stiffness: 280, damping: 28 },
  tilt: { type: "spring", stiffness: 260, damping: 22, mass: 0.6 },
  tiltGlare: { type: "spring", stiffness: 300, damping: 28 },
  cookingPanel: { type: "spring", stiffness: 300, damping: 30 },
  cookingStep: { type: "spring", stiffness: 260, damping: 18 },
  cookingAction: { type: "spring", stiffness: 400, damping: 32 },
  topping: { type: "spring", stiffness: 350, damping: 30 },
  calmMatch: { type: "spring", stiffness: 240, damping: 26 },
  denseDisclosure: { type: "spring", stiffness: 420, damping: 32 },
  selectMark: { type: "spring", stiffness: 500, damping: 20 },
  emphaticMark: { type: "spring", stiffness: 460, damping: 20 },
  pageEnter: { type: "spring", stiffness: 350, damping: 25 },
  navigation: { type: "spring", stiffness: 360, damping: 31, mass: 0.72 },
  navigationQuick: { type: "spring", stiffness: 520, damping: 36, mass: 0.62 },
  animatedScore: { type: "spring", stiffness: 90, damping: 22 },
  photoZoom: { type: "spring", stiffness: 200, damping: 22 },
  sheetSlide: { type: "spring", stiffness: 350, damping: 34 },
  drawerCompact: { type: "spring", stiffness: 400, damping: 30 },
  drawerRegular: { type: "spring", stiffness: 400, damping: 25 },
} as const;

export const motionDuration = {
  reduced: 0,
  fast: 0.16,
  subtle: 0.14,
  normal: 0.24,
  deliberate: 0.4,
  instant: 0.1,
  feedback: 0.15,
  compact: 0.18,
  recommendation: 0.34,
  slow: 0.7,
  spinner: 0.8,
  progress: 1.2,
  particle: 1.15,
  duePulse: 2,
  ambientPulse: 4.5,
  ambientRange: 4,
  auraCompact: 5.8,
  auraRegular: 7.2,
  logoPulse: 2,
  ambientShort: 5,
  ambientMedium: 6,
  ambientLong: 8,
  ambientCycle: 10,
  ambientExtended: 12,
  mascotBreath: 18,
  mascotBlink: 22,
  mascotFloat: 25,
} as const;

export const motionDelay = {
  none: 0,
  profileIntro: 0.02,
  profileIntroStep: 0.03,
  micro: 0.04,
  short: 0.05,
  medium: 0.1,
  collectionStart: 0.14,
  collectionStep: 0.06,
  recipeReveal: 0.08,
  deliberate: 0.3,
  pageDecision: 0.4,
  feedback: 0.15,
  profileSection: 0.2,
  profileSectionStep: 0.22,
  profileSectionLate: 0.25,
  profileSectionFinal: 0.35,
  burstStart: 0.18,
  burstStep: 0.045,
  ambient: 2,
  ambientLong: 4,
} as const;

/** Spatial motion intents, kept beside timing/physics so components never own offsets. */
export const motionOffset = {
  controlHoverLift: -1,
} as const;

export const doughMotionDuration = {
  mainBase: 8,
  mainEnergyRange: 4.5,
  accentBase: 6,
  accentEnergyRange: 3,
  highlightBase: 5,
  highlightEnergyRange: 2.5,
  rotationBase: 40,
  rotationEnergyRange: 25,
  accentRotationBase: 50,
  accentRotationEnergyRange: 30,
  scaleBase: 6,
  scaleEnergyRange: 3,
  glowBase: 5,
  glowEnergyRange: 2.5,
  satelliteBase: 4,
  satelliteEnergyRange: 2,
} as const;

export const motionEase = {
  linear: "linear",
  standard: "easeInOut",
  exit: "easeOut",
  expressiveEnter: [0.16, 1, 0.3, 1],
} as const;

export const motionTiming = {
  instant: { duration: motionDuration.instant },
  feedback: { duration: motionDuration.feedback },
  exit: { duration: motionDuration.compact, ease: motionEase.exit },
  recommendation: { duration: motionDuration.recommendation, ease: motionEase.exit },
  spinner: { repeat: Infinity, duration: motionDuration.spinner, ease: motionEase.linear },
  progressIndeterminate: { repeat: Infinity, duration: 1, ease: motionEase.linear },
  progressPulse: { repeat: Infinity, duration: motionDuration.progress, ease: motionEase.standard },
} as const;

/** Decorative brand motion. Call sites must still gate this with reduced motion. */
export const decorativeMotion = {
  heroGlowPrimary: {
    scale: {
      duration: 6,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "easeInOut",
    },
    opacity: {
      duration: 8,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "easeInOut",
    },
  },
  heroGlowSecondary: {
    scale: {
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "easeInOut",
    },
    opacity: {
      duration: 12,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "easeInOut",
      delay: 2,
    },
  },
} as const;
