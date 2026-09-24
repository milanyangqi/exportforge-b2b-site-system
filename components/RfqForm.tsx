"use client";

import { useState } from "react";
import type { LocaleCode } from "@/types/site";

export function RfqForm({ locale }: { locale: LocaleCode }) {
  const zh = locale === "zh";
  const label = (en: string, cn: string) => zh ? cn : en;
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    const form = event.currentTarget;
    const payload = new FormData(form);
    payload.set("locale", locale);
    payload.set("sourcePath", window.location.pathname);
    try {
      const response = await fetch("/api/leads", { method: "POST", body: payload });
      if (!response.ok) {
        const result = await response.json().catch(() => ({})) as { error?: string };
        setError(result.error || label("Please review the form and try again.", "请检查表单后重试。"));
        setStatus("error");
        return;
      }
      form.reset();
      setStatus("success");
    } catch {
      setError(label("The request could not be sent. Please try again.", "询价提交失败，请重试。"));
      setStatus("error");
    }
  }

  return <form className="rfq-form" onSubmit={submit} encType="multipart/form-data">
    <label className="rfq-upload">{label("CAD drawing (optional)", "CAD 图纸（可选）")}
      <input name="cadFile" type="file" accept=".step,.stp,.stl,.3mf,.obj,.igs,.iges,.pdf,.zip" />
      <small>{label("STEP, STP, STL, 3MF, OBJ, IGES, PDF or ZIP; max 8 MB. You can also describe your part below.", "支持 STEP、STP、STL、3MF、OBJ、IGES、PDF、ZIP；最大 8 MB。也可在下方描述零件。")}</small>
    </label>
    <label>{label("Full name", "姓名")}<input name="fullName" required autoComplete="name" /></label>
    <label>{label("Work email", "工作邮箱")}<input name="email" required type="email" autoComplete="email" /></label>
    <label>{label("Company", "公司")}<input name="company" autoComplete="organization" /></label>
    <label>{label("Quantity", "数量")}<input name="quantity" required placeholder={label("e.g. 20 pieces", "例如 20 件")} /></label>
    <label>{label("Part or project name", "零件或项目名称")}<input name="productType" required placeholder={label("e.g. enclosure prototype", "例如 外壳样件")} /></label>
    <label>{label("Preferred material", "材料偏好")}<input name="workpieceMaterial" placeholder={label("If known", "如已确定请填写")} /></label>
    <label>{label("Destination country", "目的地国家")}<input name="destination" /></label>
    <label>{label("WhatsApp or phone", "WhatsApp 或电话")}<input name="whatsapp" /></label>
    <label className="wide">{label("Finish, tolerance, timing and other requirements", "表面、公差、交期及其他要求")}<textarea name="message" rows={5} placeholder={label("Tell us what the part must do and anything critical to your quote.", "请说明零件用途及影响报价的关键要求。")}/></label>
    {status === "success" && <p className="rfq-status success" role="status">{label("Your request was received. Keep the drawing reference for follow-up.", "已收到您的询价，我们会根据提交信息跟进。")}</p>}
    {status === "error" && <p className="rfq-status error" role="alert">{error}</p>}
    <button type="submit" disabled={status === "loading"}>{status === "loading" ? label("Sending...", "提交中…") : label("Send custom quote request", "提交定制询价")}</button>
  </form>;
}
