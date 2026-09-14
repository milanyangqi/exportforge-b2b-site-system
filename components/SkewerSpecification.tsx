"use client";
import { ArrowRight } from "lucide-react";
import type { LocaleCode } from "@/types/site";
export function SkewerSpecification({ locale }: { locale: LocaleCode }) {
  const zh = locale === "zh";
  return (
    <form
      className="gb-specification"
      action={`/${locale}/contact`}
      method="get"
    >
      <div className="gb-spec-head">
        <h3>{zh ? "说明你的规格需求" : "Refine your specification"}</h3>
        <p>
          {zh
            ? "填写期望规格，供报价确认。"
            : "Your preferred specifications, to be confirmed with your quote."}
        </p>
      </div>
      <div className="gb-spec-fields">
        <label>
          {zh ? "长度" : "Length"}
          <input
            name="length"
            placeholder={zh ? "输入长度或不确定" : "Length, or not sure"}
            maxLength={80}
          />
        </label>
        <label>
          {zh ? "直径" : "Diameter"}
          <input
            name="diameter"
            placeholder={zh ? "输入直径或不确定" : "Diameter, or not sure"}
            maxLength={80}
          />
        </label>
        <label>
          {zh ? "签头类型" : "Tip / handle"}
          <select name="tipType">
            <option value="">{zh ? "不确定" : "Not sure yet"}</option>
            <option value="Round pointed">
              {zh ? "圆尖头" : "Round pointed"}
            </option>
            <option value="Paddle handle">
              {zh ? "扁平握柄" : "Paddle handle"}
            </option>
            <option value="Knotted handle">
              {zh ? "结头" : "Knotted handle"}
            </option>
          </select>
        </label>
        <label>
          {zh ? "包装" : "Packaging"}
          <select name="packaging">
            <option value="">{zh ? "不确定" : "Not sure yet"}</option>
            <option value="Bulk packs">{zh ? "散装" : "Bulk packs"}</option>
            <option value="Retail sleeves">
              {zh ? "零售纸套" : "Retail sleeves"}
            </option>
            <option value="Private label">
              {zh ? "品牌定制" : "Private label"}
            </option>
          </select>
        </label>
        <button className="gb-button" type="submit">
          {zh ? "继续询价" : "Enquire"}
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}
