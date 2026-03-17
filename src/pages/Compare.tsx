import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { ComparisonPage } from "@/components/compare/ComparisonPage";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { socialNetworkData } from "@/data/compare/social-network";
import { professionalNetworkData } from "@/data/compare/professional-network";
import { financialMediaData } from "@/data/compare/financial-media";
import { newsTerminalsData } from "@/data/compare/news-terminals";
import { whatsappGroupsData } from "@/data/compare/whatsapp-groups";

const tabs = [
  { value: "social", label: "vs Social Networks", data: socialNetworkData },
  { value: "professional", label: "vs Professional Networks", data: professionalNetworkData },
  { value: "media", label: "vs Financial Media", data: financialMediaData },
  { value: "terminals", label: "vs News Terminals", data: newsTerminalsData },
  { value: "whatsapp", label: "vs WhatsApp Groups", data: whatsappGroupsData },
];

const metaMap: Record<string, { title: string; description: string }> = {
  social: { title: "FindOO vs Social Networks — Why Financial Professionals Need a Dedicated Network", description: "Compare FindOO with Facebook, Instagram & Twitter. Discover why India's financial professionals choose a purpose-built network." },
  professional: { title: "FindOO vs LinkedIn — Industry-Specific Networking for Finance", description: "Compare FindOO with LinkedIn. See why SEBI-registered advisors, MFDs, and financial professionals prefer a dedicated financial network." },
  media: { title: "FindOO vs Moneycontrol & ET Markets — From Reader to Professional", description: "Compare FindOO with financial media portals. See why professionals choose active networking over passive news consumption." },
  terminals: { title: "FindOO vs Bloomberg Terminal — Professional Networking for Every Budget", description: "Compare FindOO with Bloomberg and Refinitiv. See how a free financial network serves the 99% excluded by terminal pricing." },
  whatsapp: { title: "FindOO vs WhatsApp Groups — From Unverified Tips to Verified Professionals", description: "Compare FindOO with financial WhatsApp & Telegram groups. Verified networking beats informal group chats." },
};

export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "social";
  const meta = metaMap[activeTab] || metaMap.social;

  usePageMeta({ title: meta.title, description: meta.description });

  return (
    <PublicPageLayout>
      <div className="container py-8">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setSearchParams({ tab: v })}
          className="w-full"
        >
          <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-xl mb-6">
            {tabs.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="flex-1 min-w-[140px] text-xs sm:text-sm py-2"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((t) => (
            <TabsContent key={t.value} value={t.value}>
              <ComparisonPage data={t.data} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </PublicPageLayout>
  );
}
