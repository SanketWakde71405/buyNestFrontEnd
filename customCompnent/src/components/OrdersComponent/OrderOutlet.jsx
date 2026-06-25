import React, { useState, useMemo } from "react";
import { CiFilter } from "react-icons/ci";
import { MdOutlineFileDownload } from "react-icons/md";
import {
  IoBagHandleOutline,
  IoCartOutline,
  IoEyeOutline,
  IoCalendarOutline,
  IoSearchOutline,
} from "react-icons/io5";
import { GoClock } from "react-icons/go";
import { ImCancelCircle } from "react-icons/im";
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
} from "react-icons/io5";


import ButtonIcon from "../ButtonIcon";
import OrderCards from "./OrderCards";
import Pagination from "../Pagination";
import Dropdown from "../Dropdown";

// ─── Dummy Data ────────────────────────────────────────────────────────────────
import { DUMMY_ORDERS,ORDERS_PER_PAGE,STATUS_OPTIONS,PAYMENT_OPTIONS, STATUS_CONFIG } from "./dummyOrders";

// ─── Payment Icon ──────────────────────────────────────────────────────────────
function PaymentIcon({ type }) {
  if (type === "mastercard") {
    return (
      <span className="inline-flex items-center gap-0.5">
        <span className="w-4 h-4 rounded-full bg-red-500 opacity-90 -mr-2 block" />
        <span className="w-4 h-4 rounded-full bg-yellow-400 opacity-90 block" />
      </span>
    );
  }
  if (type === "visa") {
    return (
      <span className="font-bold text-blue-800 text-xs tracking-widest italic">
        VISA
      </span>
    );
  }
  if (type === "paypal") {
    return (
      <span className="font-bold text-blue-600 text-xs">
        <span className="text-blue-800">Pay</span>Pal
      </span>
    );
  }
  return null;
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || {};
  const Icon = cfg.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      {Icon && <Icon size={13} />}
      {status}
    </span>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
function OrderOutlet() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatus] = useState("All Statuses");
  const [paymentFilter, setPayment] = useState("All Payment Methods");
  const [currentPage, setCurrentPage] = useState(1);

  const orderCards = [
    {
      id: "orders",
      icon: <IoBagHandleOutline className="text-violet-600" size={28} />,
      iconBackground: "bg-violet-100",
      title: "Total Orders",
      subTitle: "320",
      desc: "All time orders",
    },
    {
      id: "completed",
      icon: <IoCartOutline className="text-green-600" size={28} />,
      iconBackground: "bg-green-100",
      title: "Completed Orders",
      subTitle: "188",
      desc: "58.75% of total",
    },
    {
      id: "pending",
      icon: <GoClock className="text-orange-600" size={28} />,
      iconBackground: "bg-orange-100",
      title: "Pending Orders",
      subTitle: "72",
      desc: "22.50% of total",
    },
    {
      id: "cancelled",
      icon: <ImCancelCircle className="text-red-600" size={28} />,
      iconBackground: "bg-red-100",
      title: "Cancelled Orders",
      subTitle: "60",
      desc: "18.75% of total",
    },
  ];

  const filtered = useMemo(() => {
    return DUMMY_ORDERS.filter((o) => {
      const matchSearch =
        search === "" ||
        o.customer.toLowerCase().includes(search.toLowerCase()) ||
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "All Statuses" || o.status === statusFilter;
      const matchPayment =
        paymentFilter === "All Payment Methods" || o.payment === paymentFilter;
      return matchSearch && matchStatus && matchPayment;
    });
  }, [search, statusFilter, paymentFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ORDERS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageOrders = filtered.slice(
    (safePage - 1) * ORDERS_PER_PAGE,
    safePage * ORDERS_PER_PAGE,
  );

  const handlePageChange = (p) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };

  const handleFilter = (key, val) => {
    setCurrentPage(1);
    if (key === "status") setStatus(val);
    if (key === "payment") setPayment(val);
  };

  return (
    <div className="flex flex-col w-full px-3 py-2 mx-4 my-2">
      {/* ── Header ── */}
      <div className="flex flex-row justify-between gap-3 items-center">
        <div className="flex flex-col justify-start items-start">
          <span className="text-zinc-800 font-semibold text-2xl">Orders</span>
          <span className="text-gray-500 text-sm">
            View and manage all customer orders
          </span>
        </div>
        <div className="flex flex-row gap-2 justify-center items-center m-4">
          <ButtonIcon
            text="Export"
            icon={<MdOutlineFileDownload size={22} />}
          />
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="flex flex-row gap-2 justify-center items-center pr-4 py-1">
        {orderCards.map((card) => (
          <OrderCards
            key={card.id}
            icon={card.icon}
            iconBackground={card.iconBackground}
            title={card.title}
            subTitle={card.subTitle}
            desc={card.desc}
          />
        ))}
      </div>

      {/* ── Table Card ── */}
      <div className="mt-4 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* ── Toolbar ── */}
        <div className="flex flex-row items-center gap-3 px-4 py-3 border-b border-gray-100">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <IoSearchOutline
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg text-zinc-700 placeholder-gray-400 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-100 transition-colors"
            />
          </div>

          {/* Status Dropdown */}
          <Dropdown
            value={statusFilter}
            options={STATUS_OPTIONS}
            onChange={(v) => handleFilter("status", v)}
          />

          {/* Payment Dropdown */}
          <Dropdown
            value={paymentFilter}
            options={PAYMENT_OPTIONS}
            onChange={(v) => handleFilter("payment", v)}
          />

          {/* Date Range */}
          <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-zinc-500 bg-white hover:border-violet-400 transition-colors min-w-[155px]">
            <IoCalendarOutline
              size={15}
              className="text-violet-500 flex-shrink-0"
            />
            <span>Select Date Range</span>
          </button>

          {/* Filter */}
          <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 bg-white hover:border-indigo-400 hover:text-indigo-600 transition-colors ml-auto">
            <CiFilter size={18} />
            <span>Filter</span>
          </button>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="px-4 py-3 text-left font-medium">Order ID</th>
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Total</th>
                <th className="px-4 py-3 text-left font-medium">Payment</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Items</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pageOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-gray-400 text-sm"
                  >
                    No orders match your filters.
                  </td>
                </tr>
              ) : (
                pageOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    {/* Order ID */}
                    <td className="px-4 py-4 font-medium text-zinc-700 whitespace-nowrap">
                      {order.id}
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${order.color}`}
                        >
                          {order.initials}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-zinc-800 font-medium leading-tight">
                            {order.customer}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {order.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4 text-zinc-600 whitespace-nowrap">
                      <div>{order.date}</div>
                      <div className="text-xs text-gray-400">{order.time}</div>
                    </td>

                    {/* Total */}
                    <td className="px-4 py-4 font-semibold text-zinc-800 whitespace-nowrap">
                      {order.total}
                    </td>

                    {/* Payment */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <PaymentIcon type={order.paymentIcon} />
                        <div className="flex flex-col">
                          {order.cardLast4 && (
                            <span className="text-zinc-500 text-xs">
                              •••• {order.cardLast4}
                            </span>
                          )}
                          <span className="text-zinc-400 text-xs">
                            {order.payment}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>

                    {/* Items */}
                    <td className="px-4 py-4 text-zinc-500">
                      {order.items} {order.items === 1 ? "item" : "items"}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded-md border border-gray-200 text-gray-400 hover:border-violet-400 hover:text-violet-600 transition-colors">
                          <IoEyeOutline size={16} />
                        </button>
                        <button className="p-1.5 rounded-md border border-gray-200 text-gray-400 hover:border-violet-400 hover:text-violet-600 transition-colors">
                          <IoCalendarOutline size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Footer / Pagination ── */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span className="text-sm text-gray-400">
            Showing{" "}
            {filtered.length === 0 ? 0 : (safePage - 1) * ORDERS_PER_PAGE + 1}{" "}
            to {Math.min(safePage * ORDERS_PER_PAGE, filtered.length)} of{" "}
            {filtered.length} orders
          </span>
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}

export default OrderOutlet;
