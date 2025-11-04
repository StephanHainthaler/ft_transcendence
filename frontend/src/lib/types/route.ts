export interface Route {
  page: () => string,
  setup: () => void,
  destroy: () => void,
}
