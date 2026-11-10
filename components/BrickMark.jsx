/**
 * The mark: one 2x2 brick, drawn isometric, in line only.
 *
 * It is the whole logo — the nav shows this and nothing else — so it has to
 * read at 32px. That's why it's a hand-plotted SVG rather than a PNG: strokes
 * stay crisp at any size, and `currentColor` means it follows the theme with
 * no second file to maintain for dark.
 *
 * True isometric on a 24x24 grid. The top face is a rhombus centred at
 * (12, 9.25) with a half-width of 10.5, so its corners land on left (1.5,
 * 9.25), back (12, 4), right (22.5, 9.25) and front (12, 14.5); the sides drop
 * 5.5 from there. The four studs sit at the centres of that rhombus's four
 * quadrants. Everything is drawn nearly edge to edge on purpose — at this size
 * the stroke is a fixed ~1.3px, so any margin you leave is margin the drawing
 * loses.
 */

// [cx, cy] of each stud, back / left / right / front. rx/ry below are 2:1 to
// match the projection, so a stud reads as a circle lying on the top face.
const STUDS = [
  [12, 6.6],
  [6.75, 9.25],
  [17.25, 9.25],
  [12, 11.9],
];

export default function BrickMark({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.44"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* Top face, then the two side faces, then the near vertical edge where
          they meet — the line that makes it read as solid rather than flat. */}
      <path d="M1.5 9.25 12 4l10.5 5.25L12 14.5Z" />
      <path d="M1.5 9.25v9.5L12 24l10.5-5.25v-9.5" />
      <path d="M12 24.5V14.5" />

      {STUDS.map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <ellipse cx={cx} cy={cy - 0.75} rx="2.4" ry="1.2" />
          {/* The stud's short wall: down one side, round the bottom, back up. */}
          <path d={`M${cx - 2.4} ${cy - 0.75}v1a2.4 1.2 0 0 0 4.8 0v-1`} />
        </g>
      ))}
    </svg>
  );
}
