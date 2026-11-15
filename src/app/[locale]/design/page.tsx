"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Button,
  Input,
  Select,
  Alert,
  Badge,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  Tabs,
  Table,
} from "@/components/ui";
import { Plant, Warning } from "@phosphor-icons/react";

const PALETTE = [
  { name: "Deep Field Green", token: "deepGreen", hex: "#1E4D36", textClass: "text-offWhite" },
  { name: "Soil Brown", token: "soilBrown", hex: "#6B4A2F", textClass: "text-offWhite" },
  { name: "Wheat", token: "wheat", hex: "#D9B26A", textClass: "text-ink" },
  { name: "Ink", token: "ink", hex: "#1B1F1C", textClass: "text-offWhite" },
  { name: "Alert Red", token: "alertRed", hex: "#B3261E", textClass: "text-offWhite" },
  { name: "Off-White", token: "offWhite", hex: "#F6F3EC", textClass: "text-ink" },
  { name: "Border", token: "border", hex: "#D8D2C4", textClass: "text-ink" },
];

const TABLE_COLS = [
  { key: "component", label: "Component" },
  { key: "states", label: "States" },
  { key: "touchTarget", label: "Touch Target" },
  { key: "rule", label: "Rule" },
];

const TABLE_ROWS = [
  { component: "Button", states: "default, hover, focus, disabled, danger", touchTarget: "44px min-height", rule: "Rules 2, 5, 19, 28" },
  { component: "Input", states: "default, error, disabled", touchTarget: "44px min-height", rule: "Rules 5, 11, 19" },
  { component: "Select", states: "default, error, disabled", touchTarget: "44px min-height", rule: "Rules 5, 19" },
  { component: "Alert", states: "info, warning, error", touchTarget: "N/A", rule: "Rules 11, 29" },
  { component: "Badge", states: "default, optimal, moderate, conditional", touchTarget: "N/A", rule: "Rules 19, 30" },
  { component: "Skeleton", states: "pulse animation", touchTarget: "N/A", rule: "Rule 21" },
  { component: "Tabs", states: "active, inactive, focus", touchTarget: "44px min-height", rule: "Rules 19, 28" },
  { component: "Table", states: "default, row hover", touchTarget: "N/A", rule: "Rules 5, 10" },
];

const TAB_ITEMS = [
  { id: "primitives", label: "Primitives" },
  { id: "palette", label: "Colour Palette" },
  { id: "typography", label: "Typography" },
];

export default function DesignPage() {
  const [activeTab, setActiveTab] = useState("primitives");
  const [inputError, setInputError] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-offWhite text-ink font-body">
      <Navbar />

      <main id="main-content" className="flex-1 w-full">
        <section className="w-full border-b border-border bg-offWhite py-10 md:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 rounded border border-border bg-offWhite px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-soilBrown">
              <Plant size={14} weight="regular" className="text-deepGreen" />
              <span>Internal Reference</span>
            </div>
            <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Design System
            </h1>
            <p className="mt-3 font-body text-base text-ink/80 leading-relaxed max-w-2xl">
              All primitives and design tokens used across AgriShift AI. Every component follows the 30 design rules: flat colour, Phosphor icons, 6px radius, 44px touch targets, no shadows.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
          <Tabs tabs={TAB_ITEMS} activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === "primitives" && (
            <div className="space-y-12">

              {/* Buttons */}
              <section>
                <h2 className="font-heading text-xl font-bold text-ink border-b border-border pb-3 mb-6">
                  Buttons
                </h2>
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-soilBrown mb-3">
                      Variants (default size: md)
                    </p>
                    <div className="flex flex-wrap gap-4 items-center">
                      <Button variant="primary">Primary</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="danger">Danger</Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-soilBrown mb-3">
                      Sizes
                    </p>
                    <div className="flex flex-wrap gap-4 items-center">
                      <Button variant="primary" size="sm">Small</Button>
                      <Button variant="primary" size="md">Medium</Button>
                      <Button variant="primary" size="lg">Large</Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-soilBrown mb-3">
                      Disabled state
                    </p>
                    <div className="flex flex-wrap gap-4 items-center">
                      <Button variant="primary" disabled>Primary Disabled</Button>
                      <Button variant="secondary" disabled>Secondary Disabled</Button>
                      <Button variant="danger" disabled>Danger Disabled</Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-soilBrown mb-3">
                      With icon (Phosphor, regular weight)
                    </p>
                    <div className="flex flex-wrap gap-4 items-center">
                      <Button variant="primary">
                        <Plant size={16} weight="regular" />
                        With Icon
                      </Button>
                      <Button variant="secondary">
                        <Warning size={16} weight="regular" />
                        With Icon
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 border border-border rounded text-xs text-soilBrown">
                    Hover: colour change only. Focus: visible ring (deepGreen). No scale, no lift, no glow. All buttons have min-height 44px.
                  </div>
                </div>
              </section>

              {/* Form Controls */}
              <section>
                <h2 className="font-heading text-xl font-bold text-ink border-b border-border pb-3 mb-6">
                  Form Controls
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-soilBrown mb-3">
                        Input: default
                      </p>
                      <Input
                        id="demo-input-default"
                        label="Village Name"
                        placeholder="e.g. Singur"
                        helpText="Enter the name of your village or block"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-soilBrown mb-3">
                        Input: error state
                      </p>
                      <Input
                        id="demo-input-error"
                        label="Latitude"
                        placeholder="22.81"
                        error={inputError ? "Latitude must be between 21.0 and 24.0." : undefined}
                        defaultValue="99"
                        onFocus={() => setInputError(true)}
                        onBlur={() => setInputError(false)}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-soilBrown mb-3">
                        Input: disabled
                      </p>
                      <Input
                        id="demo-input-disabled"
                        label="Region"
                        value="Singur, India"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-soilBrown mb-3">
                        Select: default
                      </p>
                      <Select id="demo-select-default" label="Farming Season">
                        <option value="Rabi">Rabi (Winter: Oct to Mar)</option>
                        <option value="Kharif">Kharif (Monsoon: Jun to Oct)</option>
                        <option value="Zaid">Zaid (Pre-monsoon: Mar to Jun)</option>
                      </Select>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-soilBrown mb-3">
                        Select: disabled
                      </p>
                      <Select id="demo-select-disabled" label="Soil Type" disabled>
                        <option value="Alluvial">Alluvial</option>
                      </Select>
                    </div>
                  </div>
                </div>
              </section>

              {/* Alerts */}
              <section>
                <h2 className="font-heading text-xl font-bold text-ink border-b border-border pb-3 mb-6">
                  Alerts
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-soilBrown mb-2">
                      Info severity
                    </p>
                    <Alert severity="info" title="Satellite data notice">
                      NASA POWER and SMAP observations have a 3-day publication lag. Readings reflect data up to 72 hours before the analysis date.
                    </Alert>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-soilBrown mb-2">
                      Warning severity
                    </p>
                    <Alert severity="warning" title="Moderate Risk">
                      Soil surface moisture has dropped to 42.5 percent following 18 consecutive dry days.
                    </Alert>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-soilBrown mb-2">
                      Error severity
                    </p>
                    <Alert severity="error" title="Connection failed">
                      Unable to reach the recommendation API. The service may be unavailable. Fallback data is shown.
                    </Alert>
                  </div>
                  <div className="p-4 border border-border rounded text-xs text-soilBrown">
                    Rule 11: Full 1px border on all sides. No coloured left-border stripe. Icon indicates severity.
                  </div>
                </div>
              </section>

              {/* Badges */}
              <section>
                <h2 className="font-heading text-xl font-bold text-ink border-b border-border pb-3 mb-6">
                  Badges
                </h2>
                <div className="flex flex-wrap gap-3 items-center">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="optimal">Optimal Fit</Badge>
                  <Badge variant="moderate">Moderate Fit</Badge>
                  <Badge variant="conditional">Conditional</Badge>
                  <Badge variant="low">Low Risk</Badge>
                  <Badge variant="medium">Moderate Risk</Badge>
                  <Badge variant="high">High Risk</Badge>
                </div>
                <div className="mt-4 p-4 border border-border rounded text-xs text-soilBrown">
                  Rule 19: 6px radius only. Rule 30: No pastel fills. Background tints derived from palette mixing only.
                </div>
              </section>

              {/* Skeletons */}
              <section>
                <h2 className="font-heading text-xl font-bold text-ink border-b border-border pb-3 mb-6">
                  Skeleton Loaders
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-soilBrown mb-2">
                      Skeleton (single bar)
                    </p>
                    <Skeleton className="w-48 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-soilBrown mb-2">
                      SkeletonText (3 lines)
                    </p>
                    <SkeletonText lines={3} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-soilBrown mb-2">
                      SkeletonCard (full card)
                    </p>
                    <SkeletonCard />
                  </div>
                  <div className="p-4 border border-border rounded text-xs text-soilBrown">
                    Rule 21: Skeleton loaders shown for every data-driven region. animate-pulse is functional, not decorative.
                  </div>
                </div>
              </section>

              {/* Tabs */}
              <section>
                <h2 className="font-heading text-xl font-bold text-ink border-b border-border pb-3 mb-6">
                  Tabs
                </h2>
                <Tabs
                  tabs={[
                    { id: "overview", label: "Overview" },
                    { id: "details", label: "Field Details" },
                    { id: "sources", label: "Data Sources" },
                  ]}
                  activeTab="overview"
                  onTabChange={() => {}}
                />
                <div className="mt-4 p-4 border border-border rounded text-xs text-soilBrown">
                  Active tab: deepGreen bottom border. Inactive: soilBrown text, hover to ink. No sliding animation. 44px touch target.
                </div>
              </section>

              {/* Table */}
              <section>
                <h2 className="font-heading text-xl font-bold text-ink border-b border-border pb-3 mb-6">
                  Table
                </h2>
                <Table
                  columns={TABLE_COLS}
                  rows={TABLE_ROWS}
                  caption="Design system component audit"
                />
                <div className="mt-4 p-4 border border-border rounded text-xs text-soilBrown">
                  Responsive: wrapped in overflow-x-auto. Header: #E9E4D9 background. Row hover: #EAE7DF.
                </div>
              </section>
            </div>
          )}

          {activeTab === "palette" && (
            <div className="space-y-6">
              <h2 className="font-heading text-xl font-bold text-ink border-b border-border pb-3">
                Colour Palette
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {PALETTE.map((colour) => (
                  <div key={colour.hex} className="border border-border rounded overflow-hidden">
                    <div
                      className={`h-20 flex items-end px-3 pb-2 ${colour.textClass}`}
                      style={{ backgroundColor: colour.hex }}
                    >
                      <span className="text-xs font-mono font-semibold">{colour.hex}</span>
                    </div>
                    <div className="p-3 bg-offWhite">
                      <p className="text-sm font-semibold text-ink">{colour.name}</p>
                      <p className="text-xs text-soilBrown font-mono">{colour.token}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border border-border rounded text-xs text-soilBrown">
                Rule 4: Exactly seven brand colours. Tints like #E9E4D9 and #E5ECE7 are derived by mixing with offWhite and are permitted. No blue, purple, pink, orange, neon, or pastel fills from Tailwind defaults.
              </div>
            </div>
          )}

          {activeTab === "typography" && (
            <div className="space-y-10">
              <h2 className="font-heading text-xl font-bold text-ink border-b border-border pb-3">
                Typography
              </h2>

              <div className="space-y-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-soilBrown">
                  Fraunces (font-heading): Headings only
                </p>
                <div className="space-y-3 border border-border rounded p-6">
                  <p className="font-heading text-5xl font-bold text-ink leading-tight">Heading 1</p>
                  <p className="font-heading text-4xl font-bold text-ink leading-tight">Heading 2</p>
                  <p className="font-heading text-3xl font-bold text-ink leading-tight">Heading 3</p>
                  <p className="font-heading text-2xl font-semibold text-ink leading-tight">Heading 4</p>
                  <p className="font-heading text-xl font-semibold text-ink leading-tight">Heading 5</p>
                  <p className="font-heading text-lg font-semibold text-soilBrown leading-tight">Heading 6 (muted)</p>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-soilBrown">
                  Source Sans 3 (font-body): Body, labels, captions
                </p>
                <div className="space-y-3 border border-border rounded p-6">
                  <p className="font-body text-xl text-ink leading-relaxed">Large body (xl): AgriShift AI reads live satellite data to rank crops for your plot.</p>
                  <p className="font-body text-base text-ink leading-relaxed">Base body: Transparent 100-point scoring validated against ICAR and BCKV agronomic research.</p>
                  <p className="font-body text-sm text-ink/80 leading-relaxed">Small body (sm): Surface and root-zone soil moisture from NASA SMAP L4 assimilation model, 9km resolution.</p>
                  <p className="font-body text-xs text-soilBrown leading-normal">Caption (xs): Field context: Smallholder plots average 1 to 3 acres. All coordinates use decimal degrees.</p>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-soilBrown">
                  Noto Sans Bengali (font-bengali): Bengali text only
                </p>
                <div className="space-y-3 border border-border rounded p-6">
                  <p className="font-bengali text-2xl text-ink leading-relaxed">ফসলের সুপারিশ</p>
                  <p className="font-bengali text-xl text-ink leading-relaxed">হুগলি জেলার ক্ষুদ্র কৃষকদের জন্য স্যাটেলাইট পরামর্শ</p>
                  <p className="font-bengali text-base text-ink/80 leading-relaxed">নাসা আর্থ অবজারভেশন ডেটার ভিত্তিতে ১০০ পয়েন্ট স্কোরিং সিস্টেম।</p>
                  <p className="font-bengali text-sm text-soilBrown leading-relaxed">সর্ষে, মসুর, ভুট্টা, ধান, আলু, পাট, গম</p>
                </div>
              </div>

              <div className="p-4 border border-border rounded text-xs text-soilBrown">
                Rule 10: Never use Inter, Geist, or Space Grotesk. Use font-heading for all headings (h1-h6), font-body for all body text, font-bengali for all Bengali-language content only.
              </div>
            </div>
          )}

          {/* Info alert at bottom */}
          <Alert severity="info">
            This page is for internal design review only. It documents every primitive used in AgriShift AI.
            All 30 design rules are enforced across every component shown here.
          </Alert>
        </div>
      </main>

      <Footer />
    </div>
  );
}
