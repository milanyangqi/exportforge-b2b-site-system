/* eslint-disable @next/next/no-img-element */

export function IndustrialVisual() {
  return (
    <div className="industrial-visual" aria-label="Xiyida Packaging custom tin box product visual">
      <div className="visual-grid">
        <div className="gauge">
          <span>QC</span>
          <small>checked</small>
        </div>
        <img className="visual-product-image" src="/assets/current-template/tin-category-range.jpg" alt="Xiyida custom tin boxes prepared for export packing" />
        <div className="tool-stack">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="spec-plate">
          <strong>Xiyida Packaging</strong>
          <span>Food / Gift / Cosmetic Tins</span>
        </div>
        <div className="routing-lines" />
      </div>
    </div>
  );
}
