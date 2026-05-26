"use client";

import { useState } from "react";
import Image from "next/image";
import { MessageCircle, X } from "lucide-react";
import { ContactChannelIcon } from "@/components/ContactChannelIcon";
import { t } from "@/lib/i18n";
import type { ContactChannel, LocaleCode } from "@/types/site";

export function ContactDock({ locale, channels }: { locale: LocaleCode; channels: ContactChannel[] }) {
  const items = channels ?? [];
  const enabledChannels = items.filter((channel) => channel.enabled);
  const [open, setOpen] = useState(false);
  const [activeQrId, setActiveQrId] = useState<string | null>(null);
  const activeQrChannel = enabledChannels.find((channel) => channel.id === activeQrId && channel.qrCodeUrl);
  const canOpenActiveLink = Boolean(activeQrChannel?.href && !activeQrChannel.href.startsWith("#"));

  function toggleDock() {
    setOpen((current) => {
      if (current) setActiveQrId(null);
      return !current;
    });
  }

  return (
    <aside className={open ? "contact-dock expanded" : "contact-dock"} aria-label="Contact channels">
      <button
        className={open ? "contact-button contact-toggle close" : "contact-button contact-toggle"}
        type="button"
        data-label={open ? "Close" : "Contact"}
        aria-expanded={open}
        aria-label={open ? "Close contact channels" : "Open contact channels"}
        onClick={toggleDock}
      >
        {open ? <X size={30} /> : <MessageCircle size={30} />}
      </button>
      {open
        ? enabledChannels.map((channel) => {
          const label = t(channel.label, locale);

          if (channel.qrCodeUrl) {
            return (
              <button
                key={channel.id}
                className="contact-button contact-channel"
                type="button"
                style={{ background: channel.color }}
                data-label={label}
                aria-label={`${label} QR code`}
                onClick={() => setActiveQrId((current) => (current === channel.id ? null : channel.id))}
              >
                <ContactChannelIcon channel={channel} size={30} />
              </button>
            );
          }

          return (
            <a
              key={channel.id}
              className="contact-button contact-channel"
              href={channel.href}
              style={{ background: channel.color }}
              data-label={label}
              aria-label={label}
              onClick={() => setActiveQrId(null)}
            >
              <ContactChannelIcon channel={channel} size={30} />
            </a>
          );
        })
        : null}
      {open && activeQrChannel?.qrCodeUrl ? (
        <div className="contact-qr-card" role="dialog" aria-label={`${t(activeQrChannel.label, locale)} QR code`}>
          <strong>{t(activeQrChannel.label, locale)}</strong>
          <Image src={activeQrChannel.qrCodeUrl} alt={`${t(activeQrChannel.label, locale)} QR code`} width={200} height={200} unoptimized />
          <span>{activeQrChannel.value}</span>
          <div className="contact-qr-actions">
            {canOpenActiveLink ? <a href={activeQrChannel.href}>打开链接</a> : null}
            <button type="button" onClick={() => setActiveQrId(null)}>关闭</button>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
