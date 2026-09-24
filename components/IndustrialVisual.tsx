/* eslint-disable @next/next/no-img-element */

export function IndustrialVisual() {
  return (
    <div className="industrial-visual" aria-label="LoftyVista hair accessories product visual">
      <div className="visual-grid">
        <div className="gauge">
          <span>0.002</span>
          <small>mm QA</small>
        </div>
        <img className="visual-product-image" src="/assets/current-template/oem.jpg" alt="LoftyVista hair accessory design concept" />
        <div className="tool-stack">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="spec-plate">
          <strong>LoftyVista</strong>
          <span>Bows / Clips / OEM</span>
        </div>
        <div className="routing-lines" />
      </div>
    </div>
  );
}
