"use client";

import { useState } from "react";
import type { LocaleCode } from "@/types/site";

const labels = {
  fullName: { en: "Full name", zh: "姓名", ar: "الاسم الكامل" },
  company: { en: "Company", zh: "公司", ar: "الشركة" },
  productType: { en: "Product type", zh: "产品类型", ar: "نوع المنتج" },
  quantity: { en: "Estimated quantity", zh: "预计数量", ar: "الكمية المقدرة" },
  email: { en: "Email", zh: "邮箱", ar: "البريد الإلكتروني" },
  whatsapp: { en: "WhatsApp / Phone", zh: "WhatsApp / 电话", ar: "واتساب / الهاتف" },
  destination: { en: "Country / Market", zh: "国家 / 市场", ar: "الدولة / السوق" },
  workpieceMaterial: { en: "Workpiece material", zh: "工件材料", ar: "مادة الشغل" },
  message: { en: "Message", zh: "需求说明", ar: "الرسالة" },
  submit: { en: "Submit RFQ", zh: "提交询盘", ar: "إرسال الطلب" },
  sending: { en: "Sending RFQ...", zh: "正在提交询盘...", ar: "جار إرسال الطلب..." },
  quantityPlaceholder: { en: "Enter quantity, e.g. 2,000 pcs / 20 boxes", zh: "请输入数量，例如 2,000 件 / 20 箱", ar: "أدخل الكمية، مثل 2,000 قطعة / 20 صندوق" },
  success: { en: "RFQ submitted. KeyproTools sales will review your tooling details and follow up shortly.", zh: "询盘已提交，KeyproTools 销售团队会查看刀具需求并尽快跟进。", ar: "تم إرسال الطلب. سيراجع فريق KeyproTools التفاصيل ويتابع معك قريبًا." },
  error: { en: "RFQ was not submitted. Please check required fields and try again.", zh: "询盘未提交成功，请检查必填信息后重试。", ar: "لم يتم إرسال الطلب. يرجى التحقق من الحقول المطلوبة والمحاولة مرة أخرى." }
};

function text(key: keyof typeof labels, locale: LocaleCode) {
  return labels[key][locale as "en"] ?? labels[key].en;
}

export function RfqForm({ locale }: { locale: LocaleCode }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const quantity = String(form.get("quantity") ?? "").trim();

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.get("fullName"),
          company: form.get("company"),
          productType: form.get("productType"),
          quantity,
          email: form.get("email"),
          whatsapp: form.get("whatsapp"),
          destination: form.get("destination"),
          workpieceMaterial: form.get("workpieceMaterial"),
          message: form.get("message"),
          locale,
          sourcePath: window.location.pathname
        })
      });

      if (!response.ok) {
        setStatus("error");
        return;
      }

      formElement.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="rfq-form" onSubmit={submit}>
      <label>
        {text("fullName", locale)}
        <input name="fullName" required placeholder="Jane Smith" />
      </label>
      <label>
        {text("company", locale)}
        <input name="company" placeholder="Company name" />
      </label>
      <label>
        {text("email", locale)}
        <input name="email" required type="email" placeholder="buyer@company.com" />
      </label>
      <label>
        {text("whatsapp", locale)}
        <input name="whatsapp" placeholder="+86 188 0000 0000" />
      </label>
      <label>
        {text("productType", locale)}
        <input name="productType" required placeholder="End mill, drill bit, custom tooling" />
      </label>
      <label>
        {text("quantity", locale)}
        <input name="quantity" required placeholder={text("quantityPlaceholder", locale)} />
      </label>
      <label>
        {text("destination", locale)}
        <input name="destination" placeholder="Vietnam, UAE, Germany..." />
      </label>
      <label>
        {text("workpieceMaterial", locale)}
        <input name="workpieceMaterial" placeholder="Steel, stainless steel, aluminum..." />
      </label>
      <label className="wide">
        {text("message", locale)}
        <textarea name="message" placeholder="Diameter, flute length, coating, material, packing, target price..." />
      </label>
      {status === "success" ? (
        <p className="rfq-status success" role="status" aria-live="polite">{text("success", locale)}</p>
      ) : null}
      {status === "error" ? (
        <p className="rfq-status error" role="alert">{text("error", locale)}</p>
      ) : null}
      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? text("sending", locale) : text("submit", locale)}
      </button>
    </form>
  );
}
