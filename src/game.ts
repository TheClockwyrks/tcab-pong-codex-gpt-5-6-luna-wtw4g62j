import type {
  Game,
  InitApi,
  RenderApi,
  UpdateApi,
} from "@clockwyrks/simple-2d";
import type { DeepReadonly } from "ts-essentials";
import * as K from "./constants";

export type Screen =
  "title" | "howto" | "countdown" | "playing" | "paused" | "matchover";
export type Mode = "solo" | "versus";
export type Side = "left" | "right";
export interface PaddleState {
  readonly cy: number;
  readonly vy: number;
  readonly driven: boolean;
  readonly drivenVy: number;
}
export interface AiState {
  readonly tracking: boolean;
  readonly movement: boolean;
}
export interface TrailSample {
  readonly x: number;
  readonly y: number;
  readonly t: number;
}
export interface BallState {
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly spin: number;
  readonly held: boolean;
  readonly holdTimer: number;
  readonly serveSign: 1 | -1;
  readonly trail: readonly TrailSample[];
}
export interface ObstacleState {
  readonly index: number;
  readonly cx: number;
  readonly cy: number;
  readonly theta: number;
}
export interface CaromState {
  readonly screen: Screen;
  readonly mode: Mode;
  readonly menuIndex: number;
  readonly titleIndex: number;
  readonly resumeScreen: "countdown" | "playing";
  readonly score: { readonly p1: number; readonly p2: number };
  readonly winner: Side | null;
  readonly paddles: { readonly left: PaddleState; readonly right: PaddleState };
  readonly ai: AiState;
  readonly receiver: Side;
  readonly ball: BallState | null;
  readonly obstacles: readonly ObstacleState[];
  readonly obstacleClock: number;
  readonly obstacleClockRunning: boolean;
  readonly simTime: number;
  readonly muted: boolean;
}
export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}
export interface Snapshot {
  readonly version: number;
  readonly screen: Screen;
  readonly mode: Mode;
  readonly menuIndex: number;
  readonly titleIndex: number;
  readonly resumeScreen: "countdown" | "playing";
  readonly score: { readonly p1: number; readonly p2: number };
  readonly winner: Side | null;
  readonly muted: boolean;
  readonly paddles: { readonly left: PaddleState; readonly right: PaddleState };
  readonly ai: AiState;
  readonly receiver: Side;
  readonly ball:
    | (Omit<BallState, "trail"> & {
        readonly speed: number;
        readonly trail: readonly TrailSample[];
      })
    | null;
  readonly obstacles: readonly ObstacleState[];
  readonly obstacleClock: number;
  readonly obstacleClockRunning: boolean;
  readonly simTime: number;
}
export interface CaromDebugApi {
  readonly version: number;
  clearWorld(s: DeepReadonly<CaromState>): CaromState;
  spawnBall(s: DeepReadonly<CaromState>): CaromState;
  spawnObstacle(s: DeepReadonly<CaromState>, i: number): CaromState;
  reset(s: DeepReadonly<CaromState>): CaromState;
  reconcile(s: DeepReadonly<CaromState>): CaromState;
  setScreen(s: DeepReadonly<CaromState>, v: Screen): CaromState;
  setMode(s: DeepReadonly<CaromState>, v: Mode): CaromState;
  setMenuIndex(s: DeepReadonly<CaromState>, v: number): CaromState;
  setTitleIndex(s: DeepReadonly<CaromState>, v: number): CaromState;
  setResumeScreen(
    s: DeepReadonly<CaromState>,
    v: "countdown" | "playing",
  ): CaromState;
  setScore(s: DeepReadonly<CaromState>, p1: number, p2: number): CaromState;
  setWinner(s: DeepReadonly<CaromState>, v: Side | null): CaromState;
  setReceiver(s: DeepReadonly<CaromState>, v: Side): CaromState;
  setPaddleCy(s: DeepReadonly<CaromState>, side: Side, v: number): CaromState;
  setPaddleVy(s: DeepReadonly<CaromState>, side: Side, v: number): CaromState;
  setPaddleDriven(
    s: DeepReadonly<CaromState>,
    side: Side,
    v: boolean,
  ): CaromState;
  setBallPosition(
    s: DeepReadonly<CaromState>,
    x: number,
    y: number,
  ): CaromState;
  setBallVelocity(
    s: DeepReadonly<CaromState>,
    x: number,
    y: number,
  ): CaromState;
  setBallSpin(s: DeepReadonly<CaromState>, v: number): CaromState;
  setBallHeld(s: DeepReadonly<CaromState>, v: boolean): CaromState;
  setBallHoldTimer(s: DeepReadonly<CaromState>, v: number): CaromState;
  setBallServeSign(s: DeepReadonly<CaromState>, v: 1 | -1): CaromState;
  drawBallServeSign(s: DeepReadonly<CaromState>): CaromState;
  setAiTracking(s: DeepReadonly<CaromState>, v: boolean): CaromState;
  setAiMovement(s: DeepReadonly<CaromState>, v: boolean): CaromState;
  setMuted(s: DeepReadonly<CaromState>, v: boolean): CaromState;
  setObstacleClock(s: DeepReadonly<CaromState>, v: number): CaromState;
  setObstacleClockRunning(s: DeepReadonly<CaromState>, v: boolean): CaromState;
  snapshot(s: DeepReadonly<CaromState>): Snapshot;
  menuItemRect(s: DeepReadonly<CaromState>, i: number): Rect | null;
}
export const BACKGROUND = "#07111f";
const cl = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const sign = (): 1 | -1 => (Math.random() < 0.5 ? -1 : 1);
const pp = (): PaddleState => ({
  cy: K.FIELD_CY,
  vy: 0,
  driven: false,
  drivenVy: 0,
});
const ball = (): BallState => ({
  x: K.FIELD_CX,
  y: K.FIELD_CY,
  vx: 0,
  vy: 0,
  spin: 0,
  held: true,
  holdTimer: K.HOLD_TIME,
  serveSign: sign(),
  trail: [],
});
const op = (i: number, t: number): ObstacleState => ({
  index: i,
  cx: K.OBSTACLE_CENTERS[i].x,
  cy:
    K.OBSTACLE_CENTERS[i].y +
    (i ? -1 : 1) *
      K.OBSTACLE_SWAY_AMP *
      Math.sin((2 * Math.PI * t) / K.OBSTACLE_SWAY_PERIOD),
  theta: K.OBSTACLE_SPIN_RATE * t,
});
const fresh = (mode: Mode = "solo", muted = false): CaromState => ({
  screen: "title",
  mode,
  menuIndex: 0,
  titleIndex: 0,
  resumeScreen: "playing",
  score: { p1: 0, p2: 0 },
  winner: null,
  paddles: { left: pp(), right: pp() },
  ai: { tracking: true, movement: true },
  receiver: "left",
  ball: ball(),
  obstacles: [op(0, 0), op(1, 0)],
  obstacleClock: 0,
  obstacleClockRunning: true,
  simTime: 0,
  muted,
});
const items = (s: Screen): readonly string[] =>
  s === "title"
    ? K.TITLE_ITEMS
    : s === "paused"
      ? K.PAUSE_ITEMS
      : s === "matchover"
        ? K.MATCHOVER_ITEMS
        : s === "howto"
          ? ["BACK"]
          : [];
const rect = (s: Screen, i: number): Rect | null =>
  i >= 0 && i < items(s).length
    ? { x: 400, y: 330 + i * 62, w: 480, h: 48 }
    : null;
const req = (s: DeepReadonly<CaromState>) => {
  if (!s.ball) throw new Error("Carom debug: no ball present");
  return s.ball;
};
const pupdate = (p: PaddleState, v: number, dt: number): PaddleState => {
  const cy = cl(p.cy + v * dt, K.PADDLE_MIN_CY, K.PADDLE_MAX_CY);
  return { ...p, cy, vy: dt && cy !== p.cy ? (cy - p.cy) / dt : 0 };
};
const ai = (
  p: PaddleState,
  s: DeepReadonly<CaromState>,
  dt: number,
): PaddleState => {
  let target = K.AI_HOME_Y,
    d = K.AI_HOME_DEADZONE;
  if (s.ai.tracking && s.screen === "playing" && s.ball && s.ball.vx > 0) {
    target = s.ball.y - s.ball.vy * K.AI_REACT;
    d = K.AI_DEADZONE;
  }
  const diff = target - p.cy;
  return pupdate(
    p,
    s.ai.movement && Math.abs(diff) > d
      ? Math.sign(diff) *
          Math.min(K.AI_SPEED, Math.abs(diff) / Math.max(dt, 1e-9))
      : 0,
    dt,
  );
};
function obstacle(
  b: { x: number; y: number; vx: number; vy: number },
  o: ObstacleState,
) {
  const c = Math.cos(o.theta),
    q = Math.sin(o.theta),
    dx = b.x - o.cx,
    dy = b.y - o.cy,
    lx = dx * c + dy * q,
    ly = -dx * q + dy * c,
    x = cl(lx, -K.OBSTACLE_HW, K.OBSTACLE_HW),
    y = cl(ly, -K.OBSTACLE_HH, K.OBSTACLE_HH);
  let nx = lx - x,
    ny = ly - y;
  const d2 = nx * nx + ny * ny;
  if (d2 >= K.BALL_R * K.BALL_R) return false;
  if (d2 < 1e-8) {
    if (K.OBSTACLE_HW - Math.abs(lx) <= K.OBSTACLE_HH - Math.abs(ly)) {
      nx = lx < 0 ? -1 : 1;
      ny = 0;
    } else {
      nx = 0;
      ny = ly < 0 ? -1 : 1;
    }
  } else {
    const d = Math.sqrt(d2);
    nx /= d;
    ny /= d;
  }
  const wx = nx * c - ny * q,
    wy = nx * q + ny * c,
    dot = b.vx * wx + b.vy * wy;
  if (dot < 0) {
    b.vx -= 2 * dot * wx;
    b.vy -= 2 * dot * wy;
  }
  const push = K.BALL_R - Math.sqrt(Math.max(d2, 0)) + 0.05;
  b.x += wx * push;
  b.y += wy * push;
  return true;
}
function advance(
  bb: BallState,
  ps: { left: PaddleState; right: PaddleState },
  os: readonly ObstacleState[],
  dt: number,
  a: UpdateApi["audio"],
): BallState {
  const b = { ...bb, trail: [...bb.trail] },
    n = Math.max(1, Math.ceil((Math.hypot(b.vx, b.vy) * dt) / K.MAX_SUBSTEP)),
    h = dt / n;
  for (let z = 0; z < n; z++) {
    const sp = Math.hypot(b.vx, b.vy);
    if (sp) {
      const ang = (b.spin / sp) * h,
        c = Math.cos(ang),
        q = Math.sin(ang),
        vx = b.vx * c - b.vy * q;
      b.vy = b.vx * q + b.vy * c;
      b.vx = vx;
    }
    b.spin *= Math.pow(0.5, h / K.SPIN_HALFLIFE);
    b.x += b.vx * h;
    b.y += b.vy * h;
    if (b.y - K.BALL_R < 0 && b.vy < 0) {
      b.y = K.BALL_R;
      b.vy = -b.vy;
      a.play(K.CUES.wallBounce);
    } else if (b.y + K.BALL_R > K.FIELD_H && b.vy > 0) {
      b.y = K.FIELD_H - K.BALL_R;
      b.vy = -b.vy;
      a.play(K.CUES.wallBounce);
    }
    for (const side of ["left", "right"] as const) {
      const p = ps[side],
        x0 = side === "left" ? K.P1_X0 : K.P2_X0,
        x1 = side === "left" ? K.P1_X1 : K.P2_X1;
      if (
        b.x >= x0 - K.BALL_R &&
        b.x <= x1 + K.BALL_R &&
        b.y > p.cy - K.PADDLE_HALF - K.BALL_R &&
        b.y < p.cy + K.PADDLE_HALF + K.BALL_R
      ) {
        const ds = [
            b.x - (x0 - K.BALL_R),
            x1 + K.BALL_R - b.x,
            b.y - (p.cy - K.PADDLE_HALF - K.BALL_R),
            p.cy + K.PADDLE_HALF + K.BALL_R,
          ],
          m = Math.min(...ds),
          face = ds.indexOf(m);
        if ((face === 0 && b.vx > 0) || (face === 1 && b.vx < 0)) {
          const th =
              cl((b.y - p.cy) / K.PADDLE_HALF, -1, 1) * K.MAX_BOUNCE_ANGLE,
            sp2 = Math.min(Math.hypot(b.vx, b.vy) * K.SPEED_MULT, K.SPEED_CAP);
          b.vx = (side === "left" ? 1 : -1) * sp2 * Math.cos(th);
          b.vy = sp2 * Math.sin(th);
          b.spin = cl(
            b.spin + p.vy * K.SPIN_FROM_PADDLE,
            -K.SPIN_CLAMP,
            K.SPIN_CLAMP,
          );
          b.x = side === "left" ? x1 + K.BALL_R : x0 - K.BALL_R;
          a.play(K.CUES.paddleHit);
        } else {
          b.y =
            face === 2
              ? p.cy - K.PADDLE_HALF - K.BALL_R
              : p.cy + K.PADDLE_HALF + K.BALL_R;
          if ((face === 2 && b.vy > 0) || (face === 3 && b.vy < 0))
            b.vy = -b.vy;
          a.play(K.CUES.wallBounce);
        }
      }
    }
    for (const o of os) if (obstacle(b, o)) a.play(K.CUES.obstacleBounce);
  }
  return b;
}
const withP = (
  s: DeepReadonly<CaromState>,
  side: Side,
  p: PaddleState,
): CaromState => ({ ...s, paddles: { ...s.paddles, [side]: p } });
const withB = (
  s: DeepReadonly<CaromState>,
  f: (b: BallState) => BallState,
): CaromState => ({ ...s, ball: f(req(s)) });
function debug(): CaromDebugApi {
  const d: CaromDebugApi = {
    version: K.CAROM_DEBUG_VERSION,
    clearWorld: (s) => ({ ...s, ball: null, obstacles: [] }),
    spawnBall: (s) => ({ ...s, ball: ball() }),
    spawnObstacle: (s, i) => {
      if (i < 0 || i > 1) throw Error("Carom debug: invalid obstacle index");
      return {
        ...s,
        obstacles: [
          ...s.obstacles.filter((o) => o.index !== i),
          op(i, s.obstacleClock),
        ].sort((a, b) => a.index - b.index),
      };
    },
    reset: (s) => fresh(s.mode, s.muted),
    reconcile: (s) => ({
      ...s,
      obstacles: s.obstacles.map((o) => op(o.index, s.obstacleClock)),
    }),
    setScreen: (s, v) => ({ ...s, screen: v }),
    setMode: (s, v) => ({ ...s, mode: v }),
    setMenuIndex: (s, v) => ({ ...s, menuIndex: v }),
    setTitleIndex: (s, v) => ({ ...s, titleIndex: v }),
    setResumeScreen: (s, v) => ({ ...s, resumeScreen: v }),
    setScore: (s, p1, p2) => ({ ...s, score: { p1, p2 } }),
    setWinner: (s, v) => ({ ...s, winner: v }),
    setReceiver: (s, v) => ({ ...s, receiver: v }),
    setPaddleCy: (s, x, v) => withP(s, x, { ...s.paddles[x], cy: v }),
    setPaddleVy: (s, x, v) => withP(s, x, { ...s.paddles[x], drivenVy: v }),
    setPaddleDriven: (s, x, v) => withP(s, x, { ...s.paddles[x], driven: v }),
    setBallPosition: (s, x, y) => withB(s, (b) => ({ ...b, x, y })),
    setBallVelocity: (s, x, y) => withB(s, (b) => ({ ...b, vx: x, vy: y })),
    setBallSpin: (s, v) => withB(s, (b) => ({ ...b, spin: v })),
    setBallHeld: (s, v) => withB(s, (b) => ({ ...b, held: v })),
    setBallHoldTimer: (s, v) => withB(s, (b) => ({ ...b, holdTimer: v })),
    setBallServeSign: (s, v) => withB(s, (b) => ({ ...b, serveSign: v })),
    drawBallServeSign: (s) => withB(s, (b) => ({ ...b, serveSign: sign() })),
    setAiTracking: (s, v) => ({ ...s, ai: { ...s.ai, tracking: v } }),
    setAiMovement: (s, v) => ({ ...s, ai: { ...s.ai, movement: v } }),
    setMuted: (s, v) => ({ ...s, muted: v }),
    setObstacleClock: (s, v) => ({
      ...s,
      obstacleClock: v,
      obstacles: s.obstacles.map((o) => op(o.index, v)),
    }),
    setObstacleClockRunning: (s, v) => ({ ...s, obstacleClockRunning: v }),
    snapshot: (s) => ({
      ...s,
      version: K.CAROM_DEBUG_VERSION,
      score: { ...s.score },
      paddles: { left: { ...s.paddles.left }, right: { ...s.paddles.right } },
      ai: { ...s.ai },
      obstacles: s.obstacles.map((o) => ({ ...o })),
      ball: s.ball
        ? { ...s.ball, speed: Math.hypot(s.ball.vx, s.ball.vy) }
        : null,
    }),
    menuItemRect: (s, i) => rect(s.screen, i),
  };
  return d;
}
const start = (s: DeepReadonly<CaromState>, mode: Mode): CaromState => ({
  ...fresh(mode, s.muted),
  screen: "countdown",
  titleIndex: s.titleIndex,
  simTime: s.simTime,
});
const title = (s: DeepReadonly<CaromState>): CaromState => ({
  ...fresh(s.mode, s.muted),
  titleIndex: s.titleIndex,
  menuIndex: s.titleIndex,
  simTime: s.simTime,
});
const any = (a: UpdateApi, ...n: string[]) => n.some((x) => a.input.pressed(x));
export const game: Game<CaromState, CaromDebugApi> = {
  initialize(api: InitApi<CaromState>) {
    for (const n of K.ACTIONS)
      api.input.register(n, { keys: [...K.BINDINGS[n]] });
    api.audio.define(K.CUES.paddleHit, {
      wave: "square",
      freq: 220,
      freqTo: 150,
      durationMs: 55,
    });
    api.audio.define(K.CUES.wallBounce, {
      freq: 360,
      freqTo: 260,
      durationMs: 45,
    });
    api.audio.define(K.CUES.obstacleBounce, {
      wave: "triangle",
      freq: 480,
      freqTo: 280,
      durationMs: 65,
    });
    api.audio.define(K.CUES.score, {
      wave: "square",
      freq: 660,
      freqTo: 880,
      durationMs: 130,
    });
    const diagnostics: readonly [
      string,
      (s: DeepReadonly<CaromState>) => string | number,
    ][] = [
      ["screen", (s: DeepReadonly<CaromState>) => s.screen],
      ["mode", (s) => s.mode],
      ["score", (s) => `${s.score.p1}-${s.score.p2}`],
      [
        "ball",
        (s) =>
          s.ball ? `${s.ball.x.toFixed(0)},${s.ball.y.toFixed(0)}` : "none",
      ],
      ["speed", (s) => (s.ball ? Math.hypot(s.ball.vx, s.ball.vy) : 0)],
      ["spin", (s) => s.ball?.spin ?? 0],
      [
        "paddles",
        (s) =>
          `${s.paddles.left.cy.toFixed(0)}/${s.paddles.right.cy.toFixed(0)}`,
      ],
    ];
    for (const [n, f] of diagnostics) api.diagnostics.register(n, f);
    return [fresh(), debug()];
  },
  update(state, api, dt) {
    let s: CaromState = {
      ...state,
      simTime: state.simTime + dt,
      muted: api.audio.muted(),
    };
    if (api.input.pressed("mute")) {
      api.audio.setMuted(!s.muted);
      s = { ...s, muted: !s.muted };
    }
    if (["title", "howto", "paused", "matchover"].includes(s.screen)) {
      const up = any(api, "p1-up", "p2-up"),
        down = any(api, "p1-down", "p2-down"),
        count = items(s.screen).length;
      if (s.screen !== "howto") {
        if (up && !down)
          s = { ...s, menuIndex: (s.menuIndex + count - 1) % count };
        else if (down) s = { ...s, menuIndex: (s.menuIndex + 1) % count };
      }
      const go = api.input.pressed("confirm") ? s.menuIndex : null;
      if (go !== null) {
        if (s.screen === "title")
          s =
            go === 0
              ? start({ ...s, titleIndex: 0 }, "solo")
              : go === 1
                ? start({ ...s, titleIndex: 1 }, "versus")
                : { ...s, screen: "howto", menuIndex: 0, titleIndex: 2 };
        else if (s.screen === "howto") s = title(s);
        else if (s.screen === "paused")
          s =
            go === 0
              ? { ...s, screen: s.resumeScreen }
              : go === 1
                ? start(s, s.mode)
                : title(s);
        else s = go === 0 ? start(s, s.mode) : title(s);
      }
      if (s.screen === "howto" && api.input.pressed("back")) s = title(s);
      if (
        s.screen === "paused" &&
        (api.input.pressed("pause") || api.input.pressed("back"))
      )
        s = { ...s, screen: s.resumeScreen };
      return s;
    }
    if (
      (s.screen === "playing" || s.screen === "countdown") &&
      api.input.pressed("pause")
    )
      return { ...s, screen: "paused", resumeScreen: s.screen, menuIndex: 0 };
    const l = s.paddles.left.driven
      ? pupdate(s.paddles.left, s.paddles.left.drivenVy, dt)
      : pupdate(
          s.paddles.left,
          api.input.value("p1-down") +
            (s.mode === "solo" ? api.input.value("p2-down") : 0) -
            api.input.value("p1-up") -
            (s.mode === "solo" ? api.input.value("p2-up") : 0),
          dt,
        );
    const r = s.paddles.right.driven
      ? pupdate(s.paddles.right, s.paddles.right.drivenVy, dt)
      : s.mode === "solo"
        ? ai(s.paddles.right, s, dt)
        : pupdate(
            s.paddles.right,
            api.input.value("p2-down") - api.input.value("p2-up"),
            dt,
          );
    s = { ...s, paddles: { left: l, right: r } };
    let clock = s.obstacleClock;
    if (s.obstacleClockRunning) clock += dt;
    s = {
      ...s,
      obstacleClock: clock,
      obstacles: s.obstacles.map((o) => op(o.index, clock)),
    };
    if (!s.ball) return s;
    let b = s.ball;
    if (s.screen === "countdown") {
      const h = b.holdTimer - dt;
      if (h <= 0) {
        const dir = s.receiver === "left" ? -1 : 1;
        b = {
          ...b,
          held: false,
          holdTimer: 0,
          vx: dir * K.SERVE_SPEED * Math.cos(K.SERVE_ANGLE),
          vy: b.serveSign * K.SERVE_SPEED * Math.sin(K.SERVE_ANGLE),
          trail: [],
        };
        s = { ...s, screen: "playing" };
      } else b = { ...b, holdTimer: h, x: K.FIELD_CX, y: K.FIELD_CY };
    }
    if (s.screen === "playing" && !b.held) {
      b = advance(b, s.paddles, s.obstacles, dt, api.audio);
      b = {
        ...b,
        trail: [...b.trail, { x: b.x, y: b.y, t: s.simTime }].filter(
          (v) => v.t >= s.simTime - K.TRAIL_TIME,
        ),
      };
      if (b.x - K.BALL_R > K.FIELD_W || b.x + K.BALL_R < 0) {
        const scorer: Side = b.x > K.FIELD_CX ? "left" : "right",
          score = {
            p1: s.score.p1 + (scorer === "left" ? 1 : 0),
            p2: s.score.p2 + (scorer === "right" ? 1 : 0),
          };
        api.audio.play(K.CUES.score);
        const win =
          score.p1 >= K.WIN_SCORE && score.p1 - score.p2 >= K.WIN_LEAD
            ? "left"
            : score.p2 >= K.WIN_SCORE && score.p2 - score.p1 >= K.WIN_LEAD
              ? "right"
              : null;
        s = win
          ? {
              ...s,
              score,
              winner: win,
              screen: "matchover",
              menuIndex: 0,
              ball: b,
            }
          : {
              ...s,
              score,
              receiver: scorer === "left" ? "right" : "left",
              screen: "countdown",
              ball: ball(),
            };
      }
    }
    return { ...s, ball: b };
  },
  render(state, api: RenderApi) {
    const c = api.ctx;
    c.fillStyle = BACKGROUND;
    c.fillRect(0, 0, K.FIELD_W, K.FIELD_H);
    c.strokeStyle = "rgba(130,210,240,.3)";
    c.setLineDash([10, 16]);
    c.beginPath();
    c.moveTo(K.NET_X, 0);
    c.lineTo(K.NET_X, K.FIELD_H);
    c.stroke();
    c.setLineDash([]);
    for (const o of state.obstacles) {
      c.save();
      c.translate(o.cx, o.cy);
      c.rotate(o.theta);
      c.fillStyle = "#ffb86b";
      c.shadowColor = "#ff8c42";
      c.shadowBlur = 18;
      c.fillRect(
        -K.OBSTACLE_HW,
        -K.OBSTACLE_HH,
        K.OBSTACLE_HW * 2,
        K.OBSTACLE_HH * 2,
      );
      c.restore();
    }
    for (const [x, p, col] of [
      [K.P1_X0, state.paddles.left, "#65e6ff"],
      [K.P2_X0, state.paddles.right, "#ff5ca8"],
    ] as const) {
      c.fillStyle = col;
      c.shadowColor = col;
      c.shadowBlur = 20;
      c.beginPath();
      c.roundRect(x, p.cy - K.PADDLE_H / 2, K.PADDLE_W, K.PADDLE_H, 8);
      c.fill();
    }
    if (state.ball) {
      if (state.ball.trail.length > 1) {
        c.strokeStyle = "rgba(255,255,255,.35)";
        c.lineWidth = 5;
        c.beginPath();
        state.ball.trail.forEach((p, i) =>
          i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y),
        );
        c.stroke();
      }
      c.fillStyle = "#fff";
      c.shadowColor = "#fff";
      c.shadowBlur = 22;
      c.beginPath();
      c.arc(state.ball.x, state.ball.y, K.BALL_R, 0, Math.PI * 2);
      c.fill();
    }
    c.shadowBlur = 0;
    c.textAlign = "center";
    c.fillStyle = "#e9fbff";
    c.font = "700 30px system-ui";
    c.fillText(`${state.score.p1}`, K.FIELD_CX - 110, 62);
    c.fillText(`${state.score.p2}`, K.FIELD_CX + 110, 62);
    c.font = "600 14px system-ui";
    c.fillStyle = "#88a9bb";
    c.fillText(
      state.mode === "solo" ? "SOLO // FIRST TO 11" : "VERSUS // FIRST TO 11",
      K.FIELD_CX,
      88,
    );
    if (["title", "howto", "paused", "matchover"].includes(state.screen)) {
      c.fillStyle = "rgba(4,10,20,.84)";
      c.fillRect(250, 130, 780, 500);
      c.fillStyle = "#f4fbff";
      c.font = "900 72px system-ui";
      c.fillText("CAROM", K.FIELD_CX, 250);
      const is = items(state.screen);
      c.font = "700 22px system-ui";
      is.forEach((v, i) => {
        c.fillStyle = i === state.menuIndex ? "#65e6ff" : "#8ca4b4";
        c.fillText(v, K.FIELD_CX, 350 + i * 62);
      });
      if (state.screen === "howto") {
        c.font = "500 16px system-ui";
        c.fillStyle = "#c7d9e5";
        c.fillText(
          "W/S or arrows move paddles • P pauses • M mutes",
          K.FIELD_CX,
          470,
        );
        c.fillText(
          "Move as you strike to add spin. Use the turning bars for bank shots.",
          K.FIELD_CX,
          500,
        );
      }
    }
    if (state.screen === "countdown") {
      c.fillStyle = "#fff";
      c.font = "700 24px system-ui";
      c.fillText(
        `SERVE IN ${Math.max(0, state.ball?.holdTimer ?? 0).toFixed(1)}`,
        K.FIELD_CX,
        150,
      );
    }
  },
};
