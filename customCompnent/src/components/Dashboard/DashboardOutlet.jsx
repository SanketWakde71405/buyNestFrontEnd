import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  HiOutlineArrowTrendingUp,
  HiOutlineCalendarDays,
  HiOutlineChevronDown,
  HiOutlineLightBulb,
  HiOutlineSparkles,
} from "react-icons/hi2";

import {
  KPIS,
  SALES_OVERVIEW,
  STORE_SUMMARY,
  RECENT_ORDERS,
  STATUS_STYLES,
  TOP_PRODUCTS,
} from "./MockData";

import DatePicker from "../DatePicker";
import Dropdown from "../Dropdown";

// ---- mock data -----------------------------------------------------------

const spark = (vals) => vals.map((v) => ({ v }));

const conversionData = spark([18, 16, 19, 17, 20, 18, 21, 19, 22, 21, 23]);

// ---- small reusable bits --------------------------------------------------

const Sparkline = ({ data, stroke }) => (
  <div className="w-24 h-10">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={stroke}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const KpiCard = ({ kpi }) => {
  const Icon = kpi.icon;
  return (
    <div className="bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${kpi.iconBg} ${kpi.darkIconBg}`}
        >
          <Icon className={`w-5 h-5 ${kpi.iconColor}`} />
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {kpi.label}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-zinc-800 dark:text-gray-200">
              {kpi.value}
            </h3>
            <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
              <HiOutlineArrowTrendingUp className="w-3.5 h-3.5" />
              {kpi.trend}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">vs last 7 days</p>
        </div>
        <Sparkline data={kpi.data} stroke={kpi.stroke} />
      </div>
    </div>
  );
};

// ---- main component --------------------------------------------------

export default function DashboardOutlet() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [salesRange, setSalesRange] = useState("Last 7 Days");
  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };
  return (
    <div className="w-full bg-[#f7f7fb] dark:bg-slate-950 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-gray-200">
            Good morning, John! 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
        {/* Date Range */}
        <DatePicker
          startDate={startDate}
          endDate={endDate}
          onChange={handleDateChange}
        />
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {KPIS.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      {/* Sales overview + Store summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-zinc-800 dark:text-gray-200">
              Sales Overview
            </h3>
            <Dropdown
              value={salesRange}
              options={[
                "Last 7 Days",
                "Last 30 Days",
                "Last 3 Months",
                "This Year",
              ]}
              onChange={setSalesRange}
            />
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600  inline-block" />
              Sales
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-200 inline-block" />
              Orders
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={SALES_OVERVIEW}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="#f1f1f5" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `$${v / 1000}K`}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [`$${value.toLocaleString()}`]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#4f46e5" }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#c7d2fe"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-zinc-800 dark:text-gray-200">
              Store Summary
            </h3>
            <a className="text-xs font-medium text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">
              View Report
            </a>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {STORE_SUMMARY.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.iconBg} ${item.darkIconBg}`}
                    >
                      <Icon className={`w-4 h-4 ${item.iconColor}`} />
                    </div>
                    <span className="text-sm text-zinc-800 dark:text-gray-200">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-zinc-800 dark:text-gray-200">
                      {item.count}
                    </span>
                    <a
                      className={`text-xs font-medium cursor-pointer hover:underline ${item.linkColor}`}
                    >
                      View all
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent orders + Top products + Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-zinc-800 dark:text-gray-200">
              Recent Orders
            </h3>
            <a className="text-xs font-medium text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">
              View All
            </a>
          </div>
          <div className="space-y-4">
            {RECENT_ORDERS.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    {order.id}
                  </p>
                  <p className="text-zinc-800 dark:text-gray-200 font-medium">
                    {order.name}
                  </p>
                </div>
                <span className="font-medium text-zinc-800 dark:text-gray-200">
                  {order.amount}
                </span>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status]}`}
                >
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-zinc-800 dark:text-gray-200">
              Top Selling Products
            </h3>
            <a className="text-xs font-medium text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">
              View All
            </a>
          </div>
          <div className="space-y-4">
            {TOP_PRODUCTS.map((product) => {
              const Icon = product.icon;
              return (
                <div
                  key={product.name}
                  className="flex items-center justify-between text-sm "
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-slate-800 dark:border dark:border-slate-700 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <span className="text-zinc-800 dark:text-gray-200 font-medium">
                      {product.name}
                    </span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400">
                    {product.sold} sold
                  </span>
                  <span className="font-semibold text-zinc-800 dark:text-gray-200">
                    {product.revenue}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-2xl p-5 flex flex-col">
          <h3 className="font-semibold text-zinc-800 dark:text-gray-200 mb-4">
            Tips &amp; Insights
          </h3>

          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-violet-50 dark:bg-slate-600/50" />
              <div className="absolute inset-[6px] rounded-full bg-violet-100 dark:bg-slate-700/50" />
              <div className="absolute inset-[12px] rounded-full bg-violet-200 dark:bg-slate-800/50" />
              <HiOutlineLightBulb className="relative w-6 h-6 text-indigo-600 dark:text-indigo-400 " />
              <HiOutlineSparkles className="absolute -top-1 -left-1 w-3.5 h-3.5 text-violet-300" />
              <HiOutlineSparkles className="absolute -bottom-1 -right-1 w-3.5 h-3.5 text-violet-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-gray-200 mb-1">
                Grow your store
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Get personalized tips and insights to grow your business faster.
              </p>
            </div>
          </div>

          <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg py-2.5 mb-4 transition-colors">
            View Insights
          </button>

          <div className="border-t border-gray-100 dark:border-t dark:border-slate-800 pt-3 mt-auto flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Conversion Rate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-zinc-800 dark:text-gray-200">2.45%</span>
                <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
                  <HiOutlineArrowTrendingUp className="w-3.5 h-3.5" />
                  0.35%
                </span>
              </div>
            </div>
            <Sparkline data={conversionData} stroke="#4f46e5" />
          </div>
        </div>
      </div>
    </div>
  );
}
