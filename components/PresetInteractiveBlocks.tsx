"use client";

/* eslint-disable @next/next/no-img-element */
import * as Accordion from "@radix-ui/react-accordion";
import * as Tabs from "@radix-ui/react-tabs";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useCallback } from "react";

type PresetBlockProps = {
  props: Record<string, unknown>;
};

function propString(props: Record<string, unknown>, key: string, fallback = "") {
  const value = props[key];
  return typeof value === "string" ? value : fallback;
}

function propNumber(props: Record<string, unknown>, key: string, fallback = 0) {
  const value = Number(props[key]);
  return Number.isFinite(value) ? value : fallback;
}

function propBoolean(props: Record<string, unknown>, key: string, fallback = false) {
  const value = props[key];
  return typeof value === "boolean" ? value : fallback;
}

function propArray<T = Record<string, unknown>>(props: Record<string, unknown>, key: string): T[] {
  const value = props[key];
  return Array.isArray(value) ? value as T[] : [];
}

function sectionHead(props: Record<string, unknown>) {
  const eyebrow = propString(props, "eyebrow");
  const title = propString(props, "title");
  const body = propString(props, "body");
  if (!eyebrow && !title && !body) return null;

  return (
    <div className="section-head">
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      {title ? <h2>{title}</h2> : null}
      {body ? <p>{body}</p> : null}
    </div>
  );
}

function itemText(item: Record<string, unknown>, key: string, fallback = "") {
  const value = item[key];
  return typeof value === "string" ? value : fallback;
}

export function PresetAccordion({ props }: PresetBlockProps) {
  const items = propArray<Record<string, unknown>>(props, "items")
    .map((item, index) => ({
      id: itemText(item, "id", `item-${index}`),
      title: itemText(item, "title", `Question ${index + 1}`),
      body: itemText(item, "body")
    }))
    .filter((item) => item.title || item.body);
  const defaultIndex = propNumber(props, "defaultOpenIndex", 0);

  return (
    <section className={`section preset-block preset-accordion tone-${propString(props, "tone", "light")}`}>
      {sectionHead(props)}
      <Accordion.Root className="preset-accordion-list" collapsible defaultValue={items[defaultIndex]?.id} type="single">
        {items.map((item) => (
          <Accordion.Item className="preset-accordion-item" key={item.id} value={item.id}>
            <Accordion.Header>
              <Accordion.Trigger className="preset-accordion-trigger">
                <span>{item.title}</span>
                <ChevronDown size={18} />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="preset-accordion-content">
              <p>{item.body}</p>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>
  );
}

export function PresetTabs({ props }: PresetBlockProps) {
  const items = propArray<Record<string, unknown>>(props, "items")
    .map((item, index) => ({
      id: itemText(item, "id", `tab-${index}`),
      label: itemText(item, "label", `Tab ${index + 1}`),
      title: itemText(item, "title"),
      body: itemText(item, "body"),
      imageUrl: itemText(item, "imageUrl"),
      metric: itemText(item, "metric")
    }))
    .filter((item) => item.label || item.title || item.body);
  const firstValue = items[0]?.id ?? "tab-0";

  return (
    <section className={`section preset-block preset-tabs tone-${propString(props, "tone", "light")}`}>
      {sectionHead(props)}
      <Tabs.Root className="preset-tabs-root" defaultValue={firstValue}>
        <Tabs.List className="preset-tabs-list" aria-label={propString(props, "title", "Tabs")}>
          {items.map((item) => (
            <Tabs.Trigger className="preset-tabs-trigger" key={item.id} value={item.id}>
              {item.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {items.map((item) => (
          <Tabs.Content className="preset-tabs-panel" key={item.id} value={item.id}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
              <div>
                {item.metric ? <span>{item.metric}</span> : null}
                {item.title ? <h3>{item.title}</h3> : null}
                {item.body ? <p>{item.body}</p> : null}
              </div>
              {item.imageUrl ? <img src={item.imageUrl} alt={item.title || item.label} loading="lazy" /> : null}
            </motion.div>
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </section>
  );
}

export function PresetCarousel({ props }: PresetBlockProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: propBoolean(props, "loop", true) });
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const items = propArray<Record<string, unknown>>(props, "items")
    .map((item, index) => ({
      title: itemText(item, "title", `Slide ${index + 1}`),
      body: itemText(item, "body"),
      imageUrl: itemText(item, "imageUrl"),
      href: itemText(item, "href"),
      tag: itemText(item, "tag")
    }))
    .filter((item) => item.title || item.body || item.imageUrl);

  return (
    <section className={`section preset-block preset-carousel tone-${propString(props, "tone", "light")}`}>
      <div className="preset-carousel-head">
        {sectionHead(props)}
        <div className="preset-carousel-controls">
          <button type="button" aria-label="Previous slide" onClick={scrollPrev}><ChevronLeft size={18} /></button>
          <button type="button" aria-label="Next slide" onClick={scrollNext}><ChevronRight size={18} /></button>
        </div>
      </div>
      <div className="preset-carousel-viewport" ref={emblaRef}>
        <div className="preset-carousel-track">
          {items.map((item, index) => {
            const card = (
              <article className="preset-carousel-card">
                {item.imageUrl ? <img src={item.imageUrl} alt={item.title} loading={index === 0 ? "eager" : "lazy"} /> : null}
                <div>
                  {item.tag ? <span>{item.tag}</span> : null}
                  <h3>{item.title}</h3>
                  {item.body ? <p>{item.body}</p> : null}
                </div>
              </article>
            );
            return item.href ? <a className="preset-carousel-slide" href={item.href} key={`${item.title}-${index}`}>{card}</a> : <div className="preset-carousel-slide" key={`${item.title}-${index}`}>{card}</div>;
          })}
        </div>
      </div>
    </section>
  );
}

export function PresetStatsGrid({ props }: PresetBlockProps) {
  const stats = propArray<Record<string, unknown>>(props, "stats")
    .map((item) => ({
      value: itemText(item, "value"),
      label: itemText(item, "label"),
      body: itemText(item, "body")
    }))
    .filter((item) => item.value || item.label);

  return (
    <section className={`section preset-block preset-stats tone-${propString(props, "tone", "light")} columns-${propString(props, "columns", "auto")}`}>
      {sectionHead(props)}
      <div className="preset-stats-grid">
        {stats.map((item, index) => (
          <motion.article initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04, duration: 0.25 }} key={`${item.value}-${index}`}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
            {item.body ? <p>{item.body}</p> : null}
          </motion.article>
        ))}
      </div>
    </section>
  );
}

export function PresetLogoCloud({ props }: PresetBlockProps) {
  const logos = propArray<Record<string, unknown>>(props, "logos")
    .map((item) => ({
      name: itemText(item, "name"),
      logoUrl: itemText(item, "logoUrl")
    }))
    .filter((item) => item.name || item.logoUrl);

  return (
    <section className={`section preset-block preset-logo-cloud tone-${propString(props, "tone", "light")}`}>
      {sectionHead(props)}
      <div className="preset-logo-grid">
        {logos.map((item, index) => (
          <span key={`${item.name}-${index}`}>
            {item.logoUrl ? <img src={item.logoUrl} alt={item.name} loading="lazy" /> : null}
            <strong>{item.name}</strong>
          </span>
        ))}
      </div>
    </section>
  );
}

export function PresetTimelineSteps({ props }: PresetBlockProps) {
  const steps = propArray<Record<string, unknown>>(props, "steps")
    .map((item, index) => ({
      label: itemText(item, "label", String(index + 1).padStart(2, "0")),
      title: itemText(item, "title"),
      body: itemText(item, "body")
    }))
    .filter((item) => item.title || item.body);

  return (
    <section className={`section preset-block preset-timeline tone-${propString(props, "tone", "light")}`}>
      {sectionHead(props)}
      <div className="preset-timeline-list">
        {steps.map((item, index) => (
          <article key={`${item.title}-${index}`}>
            <span>{item.label}</span>
            <div>
              <h3>{item.title}</h3>
              {item.body ? <p>{item.body}</p> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function PresetTestimonials({ props }: PresetBlockProps) {
  const testimonials = propArray<Record<string, unknown>>(props, "testimonials")
    .map((item) => ({
      quote: itemText(item, "quote"),
      name: itemText(item, "name"),
      role: itemText(item, "role"),
      imageUrl: itemText(item, "imageUrl")
    }))
    .filter((item) => item.quote || item.name);

  return (
    <section className={`section preset-block preset-testimonials tone-${propString(props, "tone", "light")} layout-${propString(props, "layout", "grid")}`}>
      {sectionHead(props)}
      <div className="preset-testimonial-grid">
        {testimonials.map((item, index) => (
          <motion.article initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05, duration: 0.25 }} key={`${item.name}-${index}`}>
            <Quote size={22} />
            {item.quote ? <p>{item.quote}</p> : null}
            <div>
              {item.imageUrl ? <img src={item.imageUrl} alt={item.name} loading="lazy" /> : null}
              <span>
                <strong>{item.name}</strong>
                {item.role ? <small>{item.role}</small> : null}
              </span>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
