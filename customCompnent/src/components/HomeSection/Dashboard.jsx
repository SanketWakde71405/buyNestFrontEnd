import React from "react";
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
  HiOutlineCurrencyDollar,
  HiOutlineShoppingCart,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineArrowTrendingUp,
  HiOutlineCalendarDays,
  HiOutlineChevronDown,
  HiOutlineArchiveBox,
  HiOutlineExclamationTriangle,
  HiOutlineXCircle,
  HiOutlineTag,
  HiOutlineLightBulb,
  HiOutlineSparkles,
} from "react-icons/hi2";
import {
  IoHeadsetOutline,
  IoWatchOutline,
  IoBriefcaseOutline,
  IoFootstepsOutline,
  IoVolumeHighOutline,
} from "react-icons/io5";

// ---- mock data -----------------------------------------------------------

const spark = (vals) => vals.map((v) => ({ v }));

const kpis = [
  {
    label: "Total Sales",
    value: "$24,560",
    trend: "18.6%",
    icon: HiOutlineCurrencyDollar,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    stroke: "#4f46e5",
    data: spark([10, 14, 11, 16, 14, 19, 22, 18, 24, 21, 26]),
  },
  {
    label: "Orders",
    value: "1,248",
    trend: "12.3%",
    icon: HiOutlineShoppingCart,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    stroke: "#10b981",
    data: spark([8, 9, 12, 10, 13, 12, 15, 17, 15, 19, 18]),
  },
  {
    label: "Customers",
    value: "845",
    trend: "9.4%",
    icon: HiOutlineUsers,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    stroke: "#3b82f6",
    data: spark([20, 18, 22, 21, 19, 23, 22, 25, 24, 27, 26]),
  },
  {
    label: "Revenue",
    value: "$8,950",
    trend: "15.7%",
    icon: HiOutlineChartBar,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
    stroke: "#f97316",
    data: spark([12, 10, 14, 13, 17, 15, 16, 20, 18, 22, 21]),
  },
];

const salesOverview = [
  { day: "May 12", sales: 9000, orders: 4000 },
  { day: "May 13", sales: 8200, orders: 5200 },
  { day: "May 14", sales: 12500, orders: 6000 },
  { day: "May 15", sales: 14200, orders: 7400 },
  { day: "May 16", sales: 12800, orders: 8200 },
  { day: "May 17", sales: 17000, orders: 9400 },
  { day: "May 18", sales: 16200, orders: 10200 },
];

const storeSummary = [
  {
    label: "Products",
    count: 320,
    icon: HiOutlineArchiveBox,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    linkColor: "text-indigo-600",
  },
  {
    label: "Low Stock Items",
    count: 12,
    icon: HiOutlineExclamationTriangle,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    linkColor: "text-orange-500",
  },
  {
    label: "Out of Stock Items",
    count: 5,
    icon: HiOutlineXCircle,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    linkColor: "text-red-500",
  },
  {
    label: "Active Coupons",
    count: 8,
    icon: HiOutlineTag,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    linkColor: "text-emerald-600",
  },
];

const recentOrders = [
  {
    id: "#ORD-1258",
    name: "Sarah Johnson",
    amount: "$129.99",
    status: "Completed",
  },
  {
    id: "#ORD-1257",
    name: "Michael Brown",
    amount: "$89.50",
    status: "Processing",
  },
  {
    id: "#ORD-1256",
    name: "Emily Davis",
    amount: "$45.00",
    status: "Completed",
  },
  {
    id: "#ORD-1255",
    name: "David Wilson",
    amount: "$199.99",
    status: "Shipped",
  },
  {
    id: "#ORD-1254",
    name: "Jessica Taylor",
    amount: "$74.25",
    status: "Processing",
  },
];

const statusStyles = {
  Completed: "bg-emerald-50 text-emerald-600",
  Processing: "bg-indigo-50 text-indigo-600",
  Shipped: "bg-purple-50 text-purple-600",
};

const topProducts = [
  {
    name: "Wireless Headphones",
    sold: 325,
    revenue: "$4,550",
    icon: IoHeadsetOutline,
  },
  {
    name: "Smart Watch Series 5",
    sold: 210,
    revenue: "$3,150",
    icon: IoWatchOutline,
  },
  {
    name: "Leather Backpack",
    sold: 180,
    revenue: "$2,340",
    icon: IoBriefcaseOutline,
  },
  {
    name: "Minimalist Sneakers",
    sold: 165,
    revenue: "$1,980",
    icon: IoFootstepsOutline,
  },
  {
    name: "Bluetooth Speaker",
    sold: 140,
    revenue: "$1,260",
    icon: IoVolumeHighOutline,
  },
];

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
    <div className="bg-white rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${kpi.iconBg}`}
        >
          <Icon className={`w-5 h-5 ${kpi.iconColor}`} />
        </div>
        <span className="text-sm text-gray-500">{kpi.label}</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-gray-900">{kpi.value}</h3>
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

export default function Dashboard() {
  return (
    <div className="w-full bg-[#f7f7fb] p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good morning, John! 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
          <HiOutlineCalendarDays className="w-4 h-4 text-gray-500" />
          May 12 – May 18, 2024
          <HiOutlineChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      {/* Sales overview + Store summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900">Sales Overview</h3>
            <button className="flex items-center gap-1 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
              Last 7 Days
              <HiOutlineChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
              Sales
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-200 inline-block" />
              Orders
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={salesOverview}
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

        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Store Summary</h3>
            <a className="text-xs font-medium text-indigo-600 cursor-pointer hover:underline">
              View Report
            </a>
          </div>
          <div className="divide-y divide-gray-100">
            {storeSummary.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.iconBg}`}
                    >
                      <Icon className={`w-4 h-4 ${item.iconColor}`} />
                    </div>
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">
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
        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Recent Orders</h3>
            <a className="text-xs font-medium text-indigo-600 cursor-pointer hover:underline">
              View All
            </a>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <p className="text-gray-400 text-xs">{order.id}</p>
                  <p className="text-gray-800 font-medium">{order.name}</p>
                </div>
                <span className="font-medium text-gray-900">
                  {order.amount}
                </span>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[order.status]}`}
                >
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">
              Top Selling Products
            </h3>
            <a className="text-xs font-medium text-indigo-600 cursor-pointer hover:underline">
              View All
            </a>
          </div>
          <div className="space-y-4">
            {topProducts.map((product) => {
              const Icon = product.icon;
              return (
                <div
                  key={product.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-gray-500" />
                    </div>
                    <span className="text-gray-800 font-medium">
                      {product.name}
                    </span>
                  </div>
                  <span className="text-gray-400">{product.sold} sold</span>
                  <span className="font-semibold text-gray-900">
                    {product.revenue}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 flex flex-col">
          <h3 className="font-semibold text-gray-900 mb-4">
            Tips &amp; Insights
          </h3>

          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-violet-50" />
              <div className="absolute inset-[6px] rounded-full bg-violet-100" />
              <div className="absolute inset-[12px] rounded-full bg-violet-200" />
              <HiOutlineLightBulb className="relative w-6 h-6 text-violet-600" />
              <HiOutlineSparkles className="absolute -top-1 -left-1 w-3.5 h-3.5 text-violet-300" />
              <HiOutlineSparkles className="absolute -bottom-1 -right-1 w-3.5 h-3.5 text-violet-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1">
                Grow your store
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Get personalized tips and insights to grow your business faster.
              </p>
            </div>
          </div>

          <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg py-2.5 mb-4 transition-colors">
            View Insights
          </button>

          <div className="border-t border-gray-100 pt-3 mt-auto flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">Conversion Rate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-gray-900">2.45%</span>
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
