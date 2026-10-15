import { Component, lazy, Suspense, useState, type ReactNode } from 'react';
import { RotateCcw, RotateCw, Box } from 'lucide-react';
import { KeyboardIllustration } from './keyboard-illustration';
import { type Configuration } from '../lib/catalog';
const KeyboardThree = lazy(() => import('./keyboard-three'));
class ViewBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
export function ProductPreview({
  config,
  interactive = false,
  className = '',
}: {
  config: Configuration;
  interactive?: boolean;
  className?: string;
}) {
  const [angle, setAngle] = useState(0),
    [three, setThree] = useState(false);
  const illustration = <KeyboardIllustration config={config} decorative />;
  return (
    <div className={`product-preview ${className}`}>
      <div className="product-halo" />
      <div
        className="preview-object"
        style={!three ? { transform: `rotate(${angle * 12}deg)` } : undefined}
      >
        {three ? (
          <ViewBoundary
            fallback={
              <>
                {illustration}
                <p className="preview-unavailable" role="status">
                  3D is unavailable in this browser. Your full build is shown in the illustration.
                </p>
              </>
            }
          >
            <Suspense fallback={illustration}>
              <KeyboardThree config={config} angle={angle} />
            </Suspense>
          </ViewBoundary>
        ) : (
          illustration
        )}
      </div>
      {interactive ? (
        <div className="preview-tools">
          <button
            className={`preview-mode ${three ? 'active' : ''}`}
            onClick={() => setThree((value) => !value)}
            aria-pressed={three}
          >
            <Box size={15} />
            {three ? 'Illustration' : 'Explore in 3D'}
          </button>
          <span className="preview-tool-divider" />
          <button
            className="icon-button"
            aria-label="Rotate keyboard left"
            onClick={() => setAngle((value) => value - 0.25)}
          >
            <RotateCcw size={16} />
          </button>
          <button
            className="icon-button"
            aria-label="Rotate keyboard right"
            onClick={() => setAngle((value) => value + 0.25)}
          >
            <RotateCw size={16} />
          </button>
        </div>
      ) : null}
      <span className="preview-caption">
        {three ? 'STUDIO SERIES / PRODUCT PREVIEW' : 'STUDIO SERIES / PRODUCT STUDY'}
      </span>
    </div>
  );
}
