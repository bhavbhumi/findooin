import { motion, AnimatePresence } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { PageHero } from "@/components/PageHero";
import { ComparisonPage } from "@/components/compare/ComparisonPage";
import { socialNetworkData } from "@/data/compare/social-network";
import { professionalNetworkData } from "@/data/compare/professional-network";
import { financialMediaData } from "@/data/compare/financial-media";
import { newsTerminalsData } from "@/data/compare/news-terminals";
import { whatsappGroupsData } from "@/data/compare/whatsapp-groups";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: "easeOut" as const },
  }),
};

const tabs = [
  { key: "social", label: "vs Social Networks", data: socialNetworkData },
  { key: "professional", label: "vs Professional Networks", data: professionalNetworkData },
  { key: "media", label: "vs Financial Media", data: financialMediaData },
  { key: "terminals", label: "vs News Terminals", data: newsTerminalsData },
  { key: "whatsapp", label: "vs WhatsApp Groups", data: whatsappGroupsData },
];

const metaMap: Record<string, { title: string; description: string }> = {
  social: { title: "FindOO vs Social Networks — Why Financial Professionals Need a Dedicated Network", description: "Compare FindOO with Facebook, Instagram & Twitter. Discover why India's financial professionals choose a purpose-built network." },
  professional: { title: "FindOO vs LinkedIn — Industry-Specific Networking for Finance", description: "Compare FindOO with LinkedIn. See why SEBI-registered advisors and MFDs prefer a dedicated financial network." },
  media: { title: "FindOO vs Moneycontrol & ET Markets — From Reader to Professional", description: "Compare FindOO with financial media portals. See why professionals choose active networking over passive consumption." },
  terminals: { title: "FindOO vs Bloomberg Terminal — Professional Networking for Every Budget", description: "Compare FindOO with Bloomberg and Refinitiv. A free financial network for the 99% excluded by terminal pricing." },
  whatsapp: { title: "FindOO vs WhatsApp Groups — From Unverified Tips to Verified Professionals", description: "Compare FindOO with financial WhatsApp & Telegram groups. Verified networking beats informal chats." },
};

const Compare = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam && tabs.some(t => t.key === tabParam) ? tabParam : "social");

  const meta = metaMap[activeTab] || metaMap.social;
  usePageMeta({ title: meta.title, description: meta.description });

  useEffect(() => {
    if (tabParam && tabs.some(t => t.key === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setSearchParams({ tab: key });
  };

  const activeData = tabs.find(t => t.key === activeTab)?.data || socialNetworkData;

  return (
    <PublicPageLayout>
      <PageHero
        breadcrumb="Compare"
        title="How FindOO Compares"
        titleAccent="to Alternatives"
        subtitle="See why India's financial professionals choose a purpose-built financial network over generic platforms, media portals, and informal groups."
        variant="waves"
      />

      {/* Sticky Tabs */}
      <div className="border-b border-border bg-background sticky top-16 z-30">
        <div className="container flex gap-0 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-5 py-3.5 text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === tab.key
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="compare-tab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          <ComparisonPage data={activeData} />
        </motion.div>
      </AnimatePresence>
    </PublicPageLayout>
  );
};

export default Compare;
