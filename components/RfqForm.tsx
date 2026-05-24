"use client";

import { useState } from "react";
import type { LocaleCode } from "@/types/site";

const labels = {
  productType: { en: "Product type", zh: "产品类型", ar: "نوع المنتج" },
  quantity: { en: "Quantity", zh: "数量", ar: "الكمية" },
  email: { en: "Email", zh: "邮箱", ar: "البريد الإلكتروني" },
  destination: { en: "Destination", zh: "目的地", ar: "الوجهة" },
  message: { en: "Message", zh: "需求说明", ar: "الرسالة" },
  submit: { en: "Submit RFQ", zh: "提交询盘", ar: "إرسال الطلب" },
  customQuantity: { en: "Custom quantity", zh: "自定义数量", ar: "كمية مخصصة" },
  success: { en: "RFQ saved. KeyproTools sales can follow up with tooling details.", zh: "询盘已保存，KeyproTools 销售团队可继续跟进刀具需求。", ar: "تم حفظ الطلب ويمكن لفريق KeyproTools المتابعة." }
};

function text(key: keyof typeof labels, locale: LocaleCode) {
  return labels[key][locale as "en"] ?? labels[key].en;
}

export function RfqForm({ locale }: { locale: LocaleCode }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [quantityChoice, setQuantityChoice] = useState("100-500");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const form = new FormData(event.currentTarget);
    const customQuantity = String(form.get("customQuantity") ?? "").trim();
    const quantity = quantityChoice === "custom" ? customQuantity : quantityChoice;
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productType: form.get("productType"),
        quantity,
        email: form.get("email"),
        destination: form.get("destination"),
        message: form.get("message"),
        locale,
        sourcePath: window.location.pathname
      })
    });
    setStatus(response.ok ? "success" : "error");
  }

  return (
    <form className="rfq-form" onSubmit={submit}>
      <label>
        {text("productType", locale)}
        <input name="productType" required placeholder="End mill, drill bit, custom tooling" />
      </label>
      <label>
        {text("quantity", locale)}
        <select name="quantityPreset" required value={quantityChoice} onChange={(event) => setQuantityChoice(event.target.value)}>
          <option value="100-500">100-500 pcs</option>
          <option value="500-1000">500-1,000 pcs</option>
          <option value="1000-5000">1,000-5,000 pcs</option>
          <option value="5000+">5,000+ pcs</option>
          <option value="custom">{text("customQuantity", locale)}</option>
        </select>
      </label>
      {quantityChoice === "custom" ? (
        <label>
          {text("customQuantity", locale)}
          <input name="customQuantity" required placeholder="e.g. 2,000 pcs / 20 boxes / trial order" />
        </label>
      ) : null}
      <label>
        {text("email", locale)}
        <input name="email" required type="email" placeholder="buyer@company.com" />
      </label>
      <label>
        {text("destination", locale)}
        <input name="destination" placeholder="Vietnam, UAE, Germany..." />
      </label>
      <label className="wide">
        {text("message", locale)}
        <textarea name="message" placeholder="Diameter, flute length, coating, material, packing, target price..." />
      </label>
      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending..." : text("submit", locale)}
      </button>
      {status === "success" ? <p className="form-note">{text("success", locale)}</p> : null}
      {status === "error" ? <p className="form-note error">Please check required fields and try again.</p> : null}
    </form>
  );
}
