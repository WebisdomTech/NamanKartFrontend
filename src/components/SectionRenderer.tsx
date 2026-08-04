import React from "react";
import { Link } from "@tanstack/react-router";
import { hasContent } from "@/lib/cmsUtils";

export interface SectionBlock {
  id: string;
  type:
    | "hero"
    | "richText"
    | "categoryGrid"
    | "productGrid"
    | "trustStrip"
    | "faq"
    | "cta"
    | "banner"
    | "image"
    | "video"
    | "buyingGuide"
    | "careGuide";
  title?: string;
  subtitle?: string;
  layout?: string;
  order: number;
  isVisible: boolean;
  data: Record<string, any>;
  settings?: Record<string, any>;
}

interface SectionRendererProps {
  sections?: SectionBlock[];
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({ sections = [] }) => {
  if (!sections || sections.length === 0) return null;

  const visibleSections = [...sections]
    .filter((s) => s.isVisible !== false && hasContent(s))
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (visibleSections.length === 0) return null;

  return (
    <div className="space-y-12">
      {visibleSections.map((section) => {
        switch (section.type) {
          case "hero": {
            if (!hasContent(section.title) && !hasContent(section.subtitle) && !hasContent(section.data?.ctaText)) {
              return null;
            }
            return (
              <div
                key={section.id}
                className="relative bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 text-amber-50 rounded-2xl p-8 md:p-12 shadow-xl overflow-hidden"
              >
                <div className="max-w-3xl relative z-10 space-y-4">
                  {hasContent(section.title) && (
                    <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-amber-100">
                      {section.title}
                    </h1>
                  )}
                  {hasContent(section.subtitle) && (
                    <p className="text-lg md:text-xl text-amber-200/90 leading-relaxed">
                      {section.subtitle}
                    </p>
                  )}
                  {hasContent(section.data?.ctaText) && hasContent(section.data?.ctaUrl) && (
                    <div className="pt-4">
                      <Link
                        to={section.data.ctaUrl}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-amber-950 font-semibold rounded-xl transition-colors shadow-lg"
                      >
                        {section.data.ctaText} →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          case "richText": {
            const bodyContent = section.data?.content || section.subtitle || "";
            if (!hasContent(section.title) && !hasContent(bodyContent)) {
              return null;
            }
            return (
              <div key={section.id} className="prose prose-amber max-w-none bg-white p-6 md:p-8 rounded-xl shadow-sm border border-amber-100">
                {hasContent(section.title) && <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">{section.title}</h2>}
                {hasContent(bodyContent) && (
                  <div className="text-gray-700 leading-relaxed space-y-4" dangerouslySetInnerHTML={{ __html: bodyContent }} />
                )}
              </div>
            );
          }

          case "trustStrip": {
            const items = (section.data?.items || []).filter((item: any) => hasContent(item?.title) || hasContent(item?.description));
            if (!hasContent(items)) return null;
            return (
              <div key={section.id} className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-amber-50/70 border border-amber-200/60 rounded-2xl p-6">
                {items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-white/80 rounded-xl shadow-xs">
                    {hasContent(item.icon) && <span className="text-2xl">{item.icon}</span>}
                    <div>
                      {hasContent(item.title) && <h4 className="font-semibold text-xs md:text-sm text-gray-900">{item.title}</h4>}
                      {hasContent(item.description) && <p className="text-xs text-gray-500">{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            );
          }

          case "faq": {
            const faqs = (section.data?.items || []).filter((faq: any) => hasContent(faq?.question) && hasContent(faq?.answer));
            if (!hasContent(faqs)) return null;
            return (
              <div key={section.id} className="bg-white p-6 md:p-8 rounded-2xl border border-amber-100 shadow-sm space-y-6">
                {hasContent(section.title) && <h2 className="text-2xl font-serif font-bold text-gray-900">{section.title}</h2>}
                <div className="space-y-4">
                  {faqs.map((faq: any, idx: number) => (
                    <details key={idx} className="group border border-amber-100 rounded-xl p-4 [&_summary::-webkit-details-marker]:hidden bg-amber-50/30">
                      <summary className="flex items-center justify-between font-semibold text-gray-900 cursor-pointer">
                        <span>{faq.question}</span>
                        <span className="ml-2 transition-transform group-open:rotate-180">↓</span>
                      </summary>
                      <p className="mt-3 text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            );
          }

          case "categoryGrid": {
            const categories = (section.data?.items || []).filter((cat: any) => hasContent(cat?.name) || hasContent(cat?.title));
            if (!hasContent(categories)) return null;
            return (
              <div key={section.id} className="space-y-6">
                {hasContent(section.title) && <h2 className="text-2xl font-serif font-bold text-gray-900">{section.title}</h2>}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {categories.map((cat: any, idx: number) => (
                    <Link
                      key={idx}
                      to={cat.url || `/categories/${cat.slug}`}
                      className="group flex flex-col items-center text-center p-4 bg-white hover:bg-amber-50/80 border border-amber-100 rounded-xl transition-all shadow-xs hover:shadow-md"
                    >
                      <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.emoji || "📿"}</span>
                      <span className="font-semibold text-xs text-gray-900 line-clamp-1">{cat.name || cat.title}</span>
                      {hasContent(cat.tileCopy) && <span className="text-[10px] text-gray-500 line-clamp-1 mt-1">{cat.tileCopy}</span>}
                    </Link>
                  ))}
                </div>
              </div>
            );
          }

          case "buyingGuide":
          case "careGuide": {
            const steps = (section.data?.items || []).filter((step: any) => hasContent(step?.title || step?.step) || hasContent(step?.text || step?.description));
            if (!hasContent(steps)) return null;
            return (
              <div key={section.id} className="bg-amber-50/60 p-6 md:p-8 rounded-2xl border border-amber-200/80 space-y-6">
                {hasContent(section.title) && <h2 className="text-2xl font-serif font-bold text-amber-950">{section.title}</h2>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {steps.map((step: any, idx: number) => (
                    <div key={idx} className="bg-white p-5 rounded-xl border border-amber-100 shadow-xs flex items-start gap-4">
                      <span className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                        {idx + 1}
                      </span>
                      <div>
                        {hasContent(step.title || step.step) && <h4 className="font-bold text-sm text-gray-900">{step.title || step.step}</h4>}
                        {hasContent(step.text || step.description) && (
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed">{step.text || step.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          case "cta": {
            if (!hasContent(section.title) && !hasContent(section.subtitle) && !hasContent(section.data?.ctaText)) {
              return null;
            }
            return (
              <div key={section.id} className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-2xl p-8 text-center space-y-4 shadow-lg">
                {hasContent(section.title) && <h3 className="text-2xl md:text-3xl font-serif font-bold">{section.title}</h3>}
                {hasContent(section.subtitle) && <p className="text-amber-100 text-sm max-w-xl mx-auto">{section.subtitle}</p>}
                {hasContent(section.data?.ctaUrl) && (
                  <div>
                    <Link
                      to={section.data.ctaUrl}
                      className="inline-block px-8 py-3 bg-white text-amber-900 font-bold rounded-xl shadow hover:bg-amber-50 transition-colors"
                    >
                      {section.data?.ctaText || "Explore Collection"}
                    </Link>
                  </div>
                )}
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
};
