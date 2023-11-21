import "./NotSupportedBanner.css";

export default function NotSupportedBanner(props: { visible?: boolean, debugType: string }) {
  return props.visible ? (
    <div className="not-supported-banner">
      {/* i have no idea how to get codicons to work with esbuild */}
      <div className="not-supported-text">
        Pedagogical does not support the <span className="not-supported-name">{props.debugType}</span> debugger.
        The information shown may not be accurate.
      </div>
    </div>
  ) : null;
}