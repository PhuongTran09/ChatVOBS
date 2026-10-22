/**
 * The four accent-coloured frame corners. Clock, QR and Transition render this
 * exact markup; Sub and Social use differently named classes and keep their own.
 */
export function OverlayDecor() {
  return (
    <>
      <div className="corner-decor top-left" />
      <div className="corner-decor top-right" />
      <div className="corner-decor bottom-left" />
      <div className="corner-decor bottom-right" />
    </>
  );
}
