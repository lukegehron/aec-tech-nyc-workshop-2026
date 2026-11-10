import * as React from "react"

const MOBILE_BREAKPOINT = 768
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

// Reads a media query with `useSyncExternalStore` rather than an effect that
// calls setState. The shadcn default ships the effect version, which this
// repo's lint rules reject (react-hooks/set-state-in-effect) — and the rule
// is right: an effect that sets state on mount renders twice and flashes the
// wrong layout. A media query is an external store, so React has a hook for
// exactly this shape. Same pattern as the theme toggle in components/Nav.jsx:
// ask the platform, don't mirror the platform into state.

function subscribe(onStoreChange) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", onStoreChange)
  return () => mql.removeEventListener("change", onStoreChange)
}

// Returns a boolean, so React's identity check compares by value and this
// can't loop.
function getSnapshot() {
  return window.matchMedia(QUERY).matches
}

// There is no window during the server render; assume desktop.
function getServerSnapshot() {
  return false
}

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
