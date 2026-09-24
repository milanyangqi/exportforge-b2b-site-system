/* eslint-disable @next/next/no-img-element */

export function IndustrialVisual() {
  return (
    <div className="industrial-visual" aria-label="Rivermake handcrafted textile visual">
      <div className="visual-grid">
        <div className="gauge">
          <span>0.002</span>
          <small>mm QA</small>
        </div>
        <img className="visual-product-image" src="/assets/current-template/woven-basket.jpg" alt="Handcrafted crochet storage baskets" />
        <div className="tool-stack">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="spec-plate">
          <strong>Rivermake</strong>
          <span>End Mills / Drill Bits / OEM</span>
        </div>
        <div className="routing-lines" />
      </div>
    </div>
  );
}
