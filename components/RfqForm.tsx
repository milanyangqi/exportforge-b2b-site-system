"use client";
import { useEffect, useRef, useState } from "react";
import type { LocaleCode } from "@/types/site";
export function RfqForm({
  locale,
  productType = "",
}: {
  locale: LocaleCode;
  productType?: string;
}) {
  const zh = locale === "zh";
  const ref = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const sending = useRef(false);
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    for (const key of [
      "length",
      "diameter",
      "tipType",
      "packaging",
      "productType",
    ]) {
      const field = ref.current?.elements.namedItem(
        key,
      ) as HTMLInputElement | null;
      if (field && query.has(key))
        field.value = (query.get(key) ?? "").slice(0, 120);
    }
    if (query.get("intent") === "sample") {
      const field = ref.current?.elements.namedItem(
        "message",
      ) as HTMLTextAreaElement | null;
      if (field)
        field.value = zh
          ? "我想咨询样品选项。"
          : "I would like to discuss sample options.";
    }
  }, [zh]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    sending.current = true;
    setStatus("loading");
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          locale,
          sourcePath: window.location.pathname,
        }),
      });
      if (!response.ok) throw new Error("Submission failed");
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      sending.current = false;
    }
  }
  return (
    <form className="rfq-form" ref={ref} onSubmit={submit}>
      <label>
        {zh ? "姓名 *" : "Full name *"}
        <input
          name="fullName"
          required
          maxLength={120}
          autoComplete="name"
          placeholder={zh ? "你的姓名" : "Your name"}
        />
      </label>
      <label>
        {zh ? "邮箱 *" : "Email *"}
        <input
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          placeholder="you@company.com"
        />
      </label>
      <label>
        {zh ? "公司 / 店铺" : "Company / business"}
        <input
          name="company"
          maxLength={120}
          autoComplete="organization"
          placeholder={zh ? "公司或店铺名称" : "Business name"}
        />
      </label>
      <label>
        {zh ? "WhatsApp / 电话" : "WhatsApp / phone"}
        <input
          name="whatsapp"
          maxLength={80}
          autoComplete="tel"
          placeholder={zh ? "含国家区号" : "Include country code"}
        />
      </label>
      <label>
        {zh ? "产品类型 *" : "Product type *"}
        <input
          name="productType"
          required
          maxLength={120}
          defaultValue={productType}
          placeholder={zh ? "圆竹签、扁平签……" : "Round, paddle, knotted…"}
        />
      </label>
      <label>
        {zh ? "期望数量 *" : "Estimated quantity *"}
        <input
          name="quantity"
          required
          maxLength={120}
          placeholder={
            zh ? "数量与单位，或不确定" : "Quantity + unit, or not sure"
          }
        />
      </label>
      <label>
        {zh ? "长度" : "Length"}
        <input
          name="length"
          maxLength={80}
          placeholder={zh ? "含单位，或不确定" : "Include unit, or not sure"}
        />
      </label>
      <label>
        {zh ? "直径" : "Diameter"}
        <input
          name="diameter"
          maxLength={80}
          placeholder={zh ? "含单位，或不确定" : "Include unit, or not sure"}
        />
      </label>
      <label>
        {zh ? "签头 / 握柄" : "Tip / handle"}
        <input
          name="tipType"
          maxLength={80}
          placeholder={zh ? "尖头、扁平、结头……" : "Pointed, paddle, knotted…"}
        />
      </label>
      <label>
        {zh ? "包装需求" : "Packaging"}
        <input
          name="packaging"
          maxLength={120}
          placeholder={
            zh ? "散装、零售、私标……" : "Bulk, retail, private label…"
          }
        />
      </label>
      <label className="wide">
        {zh ? "目的地" : "Delivery country / market"}
        <input
          name="destination"
          maxLength={120}
          autoComplete="country-name"
          placeholder={zh ? "国家与城市" : "Country and city"}
        />
      </label>
      <label className="wide">
        {zh ? "其他需求" : "Anything else?"}
        <textarea
          name="message"
          maxLength={4000}
          placeholder={
            zh
              ? "用途、每包数量、标签或样品需求……"
              : "Application, pack quantity, labels or sample requirements…"
          }
        />
      </label>
      <p className="gb-form-note">
        {zh
          ? "提交的信息用于处理询盘。规格、起订量、运费与交期均需报价确认。"
          : "Your details are used to respond to this enquiry. Specifications, MOQ, shipping and timing are confirmed with your quote."}
      </p>
      {status === "success" && (
        <p className="rfq-status success" role="status">
          {zh
            ? "询盘已收到，GrillBeats 将查看你的采购需求。"
            : "Enquiry received. GrillBeats will review your requirements."}
        </p>
      )}
      {status === "error" && (
        <p className="rfq-status error" role="alert">
          {zh
            ? "提交失败，信息已保留，请检查后重试。"
            : "Unable to submit. Your details are still here — please check and try again."}
        </p>
      )}
      <button type="submit" disabled={status === "loading"}>
        {status === "loading"
          ? zh
            ? "正在提交……"
            : "Sending…"
          : zh
            ? "提交询盘 →"
            : "Send enquiry →"}
      </button>
    </form>
  );
}
