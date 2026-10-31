// Simple party symbols drawn as inline SVG, as on Indian ballot units.
const PATHS = {
  lamp: <><path d="M10 26h12M13 26l1-5h4l1 5" /><path d="M8 17c0 3 3.6 4 8 4s8-1 8-4H8z" /><path d="M16 15c-2-2-1-5 0-7 1 2 2 5 0 7z" /></>,
  wheat: <><path d="M16 28V8" /><path d="M16 12c-3-1-4-3-4-5 3 1 4 3 4 5zM16 12c3-1 4-3 4-5-3 1-4 3-4 5zM16 18c-3-1-4-3-4-5 3 1 4 3 4 5zM16 18c3-1 4-3 4-5-3 1-4 3-4 5zM16 24c-3-1-4-3-4-5 3 1 4 3 4 5zM16 24c3-1 4-3 4-5-3 1-4 3-4 5z" /></>,
  tree: <><path d="M16 28v-8" /><path d="M16 5l-8 11h5l-4 5h14l-4-5h5z" /></>,
  kite: <><path d="M16 4l8 10-8 10-8-10z" /><path d="M16 4v20M8 14h16" /><path d="M16 24c1 2-1 3 0 5" /></>,
  nota: <><circle cx="16" cy="16" r="10" /><path d="M9 23L23 9" /></>,
};

export default function Symbol({ name, small }) {
  return (
    <svg className={`sym ${small ? "small" : ""}`} viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {PATHS[name] || PATHS.nota}
    </svg>
  );
}
