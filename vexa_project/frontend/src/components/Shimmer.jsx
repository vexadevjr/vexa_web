// Decorative light sweep. Parent must be `relative overflow-hidden` with its own border radius.
export default function Shimmer() {
  return <span aria-hidden="true" className="shimmer-line" />
}
