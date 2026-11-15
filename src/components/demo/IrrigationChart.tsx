"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { WeeklyIrrigationPlan } from "@/lib/types";
import { Drop } from "@phosphor-icons/react";

interface IrrigationChartProps {
  weeklyPlan?: WeeklyIrrigationPlan[];
  cropName?: string;
  totalRequirement?: string | number;
  method?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: Record<string, unknown> }>;
  label?: string;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload as {
      week: number;
      water_mm: number;
      stage: string;
      guidance: string;
    };

    return (
      <div className="bg-offWhite p-3 border border-border rounded text-xs space-y-1">
        <p className="font-semibold text-ink">
          Week {data.week}: {data.stage}
        </p>
        <p className="text-deepGreen font-bold">
          Water needed: {data.water_mm} mm
        </p>
        {data.guidance && (
          <p className="text-soilBrown max-w-xs">{data.guidance}</p>
        )}
      </div>
    );
  }
  return null;
}

export function IrrigationChart({
  weeklyPlan,
  cropName = "Crop",
  totalRequirement = "68 mm (Month 1)",
  method = "Controlled furrow irrigation"
}: IrrigationChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const defaultPlan: WeeklyIrrigationPlan[] = [
    {
      week: 1,
      stage: "Establishment",
      water_mm: 15,
      guidance: "Light surface irrigation to support uniform seed germination."
    },
    {
      week: 2,
      stage: "Vegetative",
      water_mm: 18,
      guidance: "Maintain root zone moisture at 50 to 55 percent."
    },
    {
      week: 3,
      stage: "Pre-flowering",
      water_mm: 20,
      guidance: "Critical irrigation window before bud formation."
    },
    {
      week: 4,
      stage: "Pod initiation",
      water_mm: 15,
      guidance: "Light furrow application. Prevent water stagnation."
    }
  ];

  const data = weeklyPlan && weeklyPlan.length > 0 ? weeklyPlan : defaultPlan;

  const chartData = data.map((item) => ({
    weekLabel: `Week ${item.week}`,
    water_mm: item.water_mm,
    stage: item.stage,
    guidance: item.guidance,
    week: item.week
  }));

  return (
    <div className="p-6 bg-offWhite border border-border rounded space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Drop size={20} className="text-deepGreen shrink-0" />
            <h3 className="text-xl font-heading font-semibold text-ink">
              4-Week Irrigation Schedule
            </h3>
          </div>
          <p className="text-sm text-soilBrown">
            Recommended water delivery in millimetres for {cropName}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs uppercase tracking-wider text-soilBrown block">
            Recommended Method
          </span>
          <span className="text-sm font-semibold text-ink">{method}</span>
        </div>
      </div>

      <div className="h-64 w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#D8D2C4"
                vertical={false}
              />
              <XAxis
                dataKey="weekLabel"
                stroke="#1B1F1C"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "#D8D2C4" }}
              />
              <YAxis
                stroke="#1B1F1C"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "#D8D2C4" }}
                unit=" mm"
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(216, 210, 196, 0.3)" }}
              />
              <Bar
                dataKey="water_mm"
                fill="#1E4D36"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full bg-[#E9E4D9] rounded flex items-center justify-center text-xs text-soilBrown">
            Loading irrigation chart...
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs text-soilBrown">
        <span>
          Total water requirement:{" "}
          <strong className="text-ink">{totalRequirement}</strong>
        </span>
        <span>Based on SMAP L4 soil moisture and GPM IMERG readings</span>
      </div>
    </div>
  );
}
