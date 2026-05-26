"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { ContactChannelIcon } from "@/components/ContactChannelIcon";
import { t } from "@/lib/i18n";
import type { ContactChannel, LocaleCode } from "@/types/site";

export function PublicContactList({
  channels,
  locale
}: {
  channels: ContactChannel[];
  locale: LocaleCode;
}) {
  const [currentChannels, setCurrentChannels] = useState(channels);

  useEffect(() => {
    setCurrentChannels(channels);
  }, [channels]);

  useEffect(() => {
    let cancelled = false;

    async function refreshContacts() {
      try {
        const response = await fetch("/api/site-state", { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json() as { contactChannels?: ContactChannel[] };
        if (!cancelled && Array.isArray(payload.contactChannels)) {
          setCurrentChannels(payload.contactChannels);
        }
      } catch {
        // Keep the server-rendered contact list if the public refresh is unavailable.
      }
    }

    void refreshContacts();
    window.addEventListener("focus", refreshContacts);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", refreshContacts);
    };
  }, []);

  const visibleChannels = currentChannels.filter((channel) => channel.enabled && channel.type !== "rfq");

  if (visibleChannels.length === 0) return null;

  return (
    <div className="stack-list public public-contact-list">
      {visibleChannels.map((channel) => (
        <a key={channel.id} href={channel.href} style={{ "--channel-color": channel.color } as CSSProperties}>
          <span className="public-contact-icon">
            <ContactChannelIcon channel={channel} size={22} />
          </span>
          <span>
            <strong>{t(channel.label, locale)}</strong>
            <small>{channel.value}</small>
          </span>
        </a>
      ))}
    </div>
  );
}
