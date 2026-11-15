"use client";

import React from "react";
import { RiskAlert } from "@/lib/types";
import { Warning, WarningCircle, Info, ShieldCheck } from "@phosphor-icons/react";

interface RiskAlertsProps {
  alerts?: RiskAlert[];
}

export function RiskAlerts({ alerts }: RiskAlertsProps) {
  const defaultAlerts: RiskAlert[] = [
    {
      id: "risk-dry-spell",
      severity: "medium",
      category: "rainfall",
      title: "Dry-Spell Risk Flag",
      description:
        "Extended dry period detected via GPM IMERG satellite precipitation readings (18 consecutive dry days in Hooghly).",
      mitigation:
        "Ensure timely tube-well or lift irrigation. Avoid delaying first watering beyond crown root initiation."
    },
    {
      id: "risk-pest-aphid",
      severity: "medium",
      category: "pest",
      title: "Aphid and Morning Fog Advisory",
      description:
        "Dense morning fog combined with current relative humidity increases likelihood of mustard aphid proliferation in mid January.",
      mitigation:
        "Install yellow sticky traps at 10 per acre and inspect lower leaves twice weekly."
    }
  ];

  const items = alerts && alerts.length > 0 ? alerts : defaultAlerts;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
      case "high":
        return <Warning size={22} className="text-alertRed shrink-0 mt-0.5" />;
      case "medium":
        return <WarningCircle size={22} className="text-alertRed shrink-0 mt-0.5" />;
      case "low":
      default:
        return <Info size={22} className="text-soilBrown shrink-0 mt-0.5" />;
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case "critical":
        return "Critical Risk";
      case "high":
        return "High Risk";
      case "medium":
        return "Moderate Risk";
      case "low":
      default:
        return "Advisory";
    }
  };

  return (
    <div className="p-6 bg-offWhite border border-border rounded space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h3 className="text-xl font-heading font-semibold text-ink">
            Active Agronomic Risk Flags
          </h3>
          <p className="text-sm text-soilBrown">
            Earth observation alerts derived from NASA POWER, SMAP, and GPM feeds
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 bg-[#E9E4D9] text-soilBrown rounded border border-border">
          <ShieldCheck size={16} className="text-deepGreen" />
          <span>{items.length} Active Warnings</span>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((alert) => (
          <div
            key={alert.id}
            className="p-4 bg-offWhite border border-border rounded space-y-2"
          >
            <div className="flex items-start gap-3">
              {getSeverityIcon(alert.severity)}
              <div className="space-y-1 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-semibold text-ink text-base">
                    {alert.title}
                  </h4>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded border border-border ${
                      alert.severity === "high" || alert.severity === "critical" || alert.severity === "medium"
                        ? "text-alertRed bg-[#FBF0EE]"
                        : "text-soilBrown bg-[#E9E4D9]"
                    }`}
                  >
                    {getSeverityLabel(alert.severity)}
                  </span>
                </div>
                <p className="text-sm text-soilBrown">{alert.description}</p>
                {alert.mitigation && (
                  <div className="pt-2 text-xs text-ink">
                    <span className="font-semibold text-deepGreen">
                      Recommended Mitigation:{" "}
                    </span>
                    <span>{alert.mitigation}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-border text-xs text-soilBrown flex items-center justify-between">
        <span>GPM IMERG and NASA POWER anomaly tracking</span>
        <span>Updated daily</span>
      </div>
    </div>
  );
}
