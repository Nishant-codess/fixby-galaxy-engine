export default function DemoGuide({ isVisible }: { isVisible: boolean }) {
  return (
    <div className={`demo-guide-card ${isVisible ? "visible" : ""}`}>
      <div className="demo-guide-header">
        <h3>Fixby Demo Guide</h3>
        <p>Follow these steps to experience the diagnostic engine:</p>
      </div>

      <div className="guide-steps">
        <div className="guide-step">
          <div className="step-ring">
            <div className="step-dot"></div>
          </div>
          <div className="step-content">
            <h4>Describe an issue</h4>
            <p>Type <em>&quot;battery draining fast&quot;</em> in the search box, or use the quick chips.</p>
          </div>
        </div>

        <div className="guide-step">
          <div className="step-ring">
            <div className="step-dot"></div>
          </div>
          <div className="step-content">
            <h4>AI Resolves the Path</h4>
            <p>The engine will query the live backend to find the exact leaf node in the Samsung hierarchical graph.</p>
          </div>
        </div>

        <div className="guide-step">
          <div className="step-ring">
            <div className="step-dot"></div>
          </div>
          <div className="step-content">
            <h4>Simulate on Phone</h4>
            <p>Watch the One UI settings animate automatically. You can also view the X-Ray HUD for latency metrics.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
