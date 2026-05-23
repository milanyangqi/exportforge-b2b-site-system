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
  success: { en: "RFQ saved. Sales notification is ready for email integration.", zh: "询盘已保存，邮件通知接口已预留。", ar: "تم حفظ الطلب وتجهيز إشعار المبيعات." }
};

function text(key: keyof typeof labels, locale: LocaleCode) {
  return labels[key][locale as "en"] ?? labels[key].en;
}

export function RfqForm({ locale }: { locale: LocaleCode }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productType: form.get("productType"),
        quantity: form.get("quantity"),
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
        <select name="quantity" required defaultValue="500-1000">
          <option value="500-1000">500-1,000 pcs</option>
          <option value="1000-5000">1,000-5,000 pcs</option>
          <option value="5000+">5,000+ pcs</option>
        </select>
      </label>
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
        <textarea name="message" placeholder="Material, specs, coating, MOQ, packing, certificates..." />
      </label>
      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending..." : text("submit", locale)}
      </button>
      {status === "success" ? <p className="form-note">{text("success", locale)}</p> : null}
      {status === "error" ? <p className="form-note error">Please check required fields and try again.</p> : null}
    </form>
  );
}
