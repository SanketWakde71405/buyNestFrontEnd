
import {
  HiOutlineCurrencyDollar,
  HiOutlineShoppingCart,
  HiOutlineUsers,
  HiOutlineChartBar,
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

import useTheme from "../../contexts/ThemeContext";

const spark = (vals) => vals.map((v) => ({ v }));


export const KPIS = [
  {
    label: "Total Sales",
    value: "$24,560",
    trend: "18.6%",
    icon: HiOutlineCurrencyDollar,
    iconBg: "bg-indigo-50",
    darkIconBg: "dark:bg-slate-800",
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
    darkIconBg: "dark:bg-teal-950",
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
    darkIconBg: "dark:bg-slate-800",
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
    darkIconBg: "dark:bg-stone-800",
    iconColor: "text-orange-600",
    stroke: "#f97316",
    data: spark([12, 10, 14, 13, 17, 15, 16, 20, 18, 22, 21]),
  },
];

export const SALES_OVERVIEW = [
  { day: "May 12", sales: 9000, orders: 4000 },
  { day: "May 13", sales: 8200, orders: 5200 },
  { day: "May 14", sales: 12500, orders: 6000 },
  { day: "May 15", sales: 14200, orders: 7400 },
  { day: "May 16", sales: 12800, orders: 8200 },
  { day: "May 17", sales: 17000, orders: 9400 },
  { day: "May 18", sales: 16200, orders: 10200 },
];

export const STORE_SUMMARY = [
  {
    label: "Products",
    count: 320,
    icon: HiOutlineArchiveBox,
    iconBg: "bg-indigo-50",
    darkIconBg: "dark:bg-slate-800",
    iconColor: "text-indigo-600",
    linkColor: "text-indigo-600",
  },
  {
    label: "Low Stock Items",
    count: 12,
    icon: HiOutlineExclamationTriangle,
    iconBg: "bg-orange-50",
    darkIconBg: "dark:bg-stone-900",
    iconColor: "text-orange-500",
    linkColor: "text-orange-500",
  },
  {
    label: "Out of Stock Items",
    count: 5,
    icon: HiOutlineXCircle,
    iconBg: "bg-red-50",
    darkIconBg: "dark:bg-stone-800",
    iconColor: "text-red-500",
    linkColor: "text-red-500",
  },
  {
    label: "Active Coupons",
    count: 8,
    icon: HiOutlineTag,
    iconBg: "bg-emerald-50",
    darkIconBg: "dark:bg-teal-950",
    iconColor: "text-emerald-600",
    linkColor: "text-emerald-600",
  },
];

export const RECENT_ORDERS = [
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

export const STATUS_STYLES = {
  Completed: "bg-emerald-50 text-emerald-600",
  Processing: "bg-indigo-50 text-indigo-600",
  Shipped: "bg-purple-50 text-purple-600",
};

export const TOP_PRODUCTS = [
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