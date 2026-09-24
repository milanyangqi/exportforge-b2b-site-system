/* eslint-disable @next/next/no-img-element */

export function IndustrialVisual() {
  return (
    <div className="industrial-visual" aria-label="DawnOrigin beauty tools product visual">
      <div className="visual-grid">
        <div className="gauge">
          <span>0.002</span>
          <small>mm QA</small>
        </div>
        <img className="visual-product-image" src="/assets/current-template/gift-set.jpg" alt="DawnOrigin beauty tool gift set concept" />
        <div className="tool-stack">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="spec-plate">
          <strong>DawnOrigin</strong>
          <span>End Mills / Drill Bits / OEM</span>
        </div>
        <div className="routing-lines" />
      </div>
    </div>
  );
}
