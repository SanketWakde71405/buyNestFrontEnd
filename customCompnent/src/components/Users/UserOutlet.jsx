import React, { useState, useMemo } from "react";
import useTheme from "../../contexts/ThemeContext";
// Icons
import { LuUsers, LuUserPlus, LuUserCheck } from "react-icons/lu";
import { GrPowerCycle } from "react-icons/gr";
import { MdOutlineFileDownload } from "react-icons/md";
import { IoEyeOutline, IoCalendarOutline } from "react-icons/io5";
import { CiFilter } from "react-icons/ci";

// Components
import ButtonIcon from "../ButtonIcon";
import UserCards from "./UserCards";
import Pagination from "../Pagination";
import Dropdown from "../Dropdown";
import SearchBar from "../SearchBar";
import DatePicker from "../DatePicker";

// ─── Dummy Data ────────────────────────────────────────────────────────────────
import {
  DUMMY_USERS,
  USERS_PER_PAGE,
  STATUS_OPTIONS,
  GROUP_OPTIONS,
  STATUS_CONFIG,
} from "./DummyUsers";

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Active"];
  const Icon = cfg.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <Icon size={12} />
      {status}
    </span>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
function UserOutlet() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatus] = useState("All Statuses");
  const [groupFilter, setGroup] = useState("All Groups");
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const { theme } = useTheme();

  const userCards = [
    {
      id: "customers_total",
      icon: <LuUsers className="text-violet-600" size={28} />,
      iconBackground: theme === "dark" ? "bg-indigo-950" : "bg-violet-100",
      title: "Total Customers",
      subTitle: "1,248",
      desc: "All time customers",
    },
    {
      id: "customers_new",
      icon: <LuUserPlus className="text-green-600" size={28} />,
      iconBackground: theme === "dark" ? "bg-teal-950" : "bg-green-100",
      title: "New Customers",
      subTitle: "156",
      desc: "In last 30 days",
    },
    {
      id: "customers_repeat",
      icon: <GrPowerCycle className="text-orange-600" size={28} />,
      iconBackground: theme === "dark" ? "bg-stone-900" : "bg-orange-100",
      title: "Repeat Customers",
      subTitle: "412",
      desc: "33.01% of total",
    },
    {
      id: "customers_active",
      icon: <LuUserCheck className="text-sky-600" size={28} />,
      iconBackground: theme === "dark" ? "bg-slate-800" : "bg-sky-100",
      title: "Active Customers",
      subTitle: "980",
      desc: "78.53% of total",
    },
  ];

  const filtered = useMemo(() => {
    return DUMMY_USERS.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "All Statuses" || u.status === statusFilter;
      const matchGroup =
        groupFilter === "All Groups" || u.group === groupFilter;

      let matchDate = true;
      if (startDate) {
        const joined = new Date(u.joined);
        joined.setHours(0, 0, 0, 0);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(0, 0, 0, 0);
          matchDate = joined >= start && joined <= end;
        } else {
          matchDate = joined.getTime() === start.getTime();
        }
      }

      return matchSearch && matchStatus && matchGroup && matchDate;
    });
  }, [search, statusFilter, groupFilter, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / USERS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageUsers = filtered.slice(
    (safePage - 1) * USERS_PER_PAGE,
    safePage * USERS_PER_PAGE,
  );

  const handlePageChange = (p) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };
  const resetPage = () => setCurrentPage(1);

  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    resetPage();
  };

  return (
    <div className="flex flex-col w-full px-3 py-2 mx-4 my-2">
      {/* ── Header ── */}
      <div className="flex flex-row justify-between gap-3 items-center">
        <div className="flex flex-col justify-start items-start">
          <span className="text-zinc-800 dark:text-gray-200 font-semibold text-2xl">
            Customers
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            View and manage your customers
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
        {userCards.map((card) => (
          <UserCards
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
      <div className="mt-4 bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* ── Toolbar ── */}
        <div className="flex flex-row items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-b dark:border-slate-800 flex-wrap">
          {/* Search */}
          <SearchBar
            search={search}
            setSearch={setSearch}
            placeholder="Search customers..."
            onSearch={() => resetPage()}
          />

          {/* Status Dropdown */}
          <Dropdown
            value={statusFilter}
            options={STATUS_OPTIONS}
            onChange={(v) => {
              setStatus(v);
              resetPage();
            }}
          />

          {/* Group Dropdown */}
          <Dropdown
            value={groupFilter}
            options={GROUP_OPTIONS}
            onChange={(v) => {
              setGroup(v);
              resetPage();
            }}
          />

          {/* Date Range */}
          <DatePicker
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
          />

          {/* Filter */}
          <button className="flex items-center gap-2 border border-gray-200 dark:border dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-950 hover:border-indigo-600 hover:text-indigo-600 dark:hover-text-indigo-400 dark:hover:border-indigo-400 transition-colors ml-auto">
            <CiFilter size={18} />
            <span>Filter</span>
          </button>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-zinc-800 dark:text-gray-200 bg-gray-100 dark:bg-slate-900 uppercase tracking-wide border-b border-gray-100 dark:border-b dark:border-slate-800">
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Phone</th>
                <th className="px-4 py-3 text-left font-medium">Orders</th>
                <th className="px-4 py-3 text-left font-medium">Total Spent</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Joined On</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-y dark:divide-slate-800">
              {pageUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-gray-500 dark:text-gray-400 text-sm"
                  >
                    No customers match your filters.
                  </td>
                </tr>
              ) : (
                pageUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50/60 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Customer */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${user.color}`}
                        >
                          {user.initials}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-zinc-800 dark:text-gray-200 font-medium leading-tight">
                            {user.name}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 text-xs">
                            {user.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-4 text-zinc-800 dark:text-gray-200 text-sm">
                      {user.email}
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-4 text-zinc-800 dark:text-gray-200 whitespace-nowrap">
                      {user.phone}
                    </td>

                    {/* Orders */}
                    <td className="px-4 py-4 text-zinc-800 dark:text-gray-200 font-medium">
                      {user.orders}
                    </td>

                    {/* Total Spent */}
                    <td className="px-4 py-4 font-semibold text-zinc-800 dark:text-gray-200 whitespace-nowrap">
                      {user.spent}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge status={user.status} />
                    </td>

                    {/* Joined On */}
                    <td className="px-4 py-4 text-zinc-800 dark:text-gray-200 whitespace-nowrap">
                      {user.joined}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded-md border border-gray-200 dark:border dark:border-slate-800 text-gray-500 dark:text-gray-400 hover:border-violet-400 hover:text-violet-600 transition-colors">
                          <IoEyeOutline size={16} />
                        </button>
                        <button className="p-1.5 rounded-md border border-gray-200 dark:border dark:border-slate-800 text-gray-500 dark:text-gray-400 hover:border-violet-400 hover:text-violet-600 transition-colors">
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
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-t dark:border-slate-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing{" "}
            {filtered.length === 0 ? 0 : (safePage - 1) * USERS_PER_PAGE + 1} to{" "}
            {Math.min(safePage * USERS_PER_PAGE, filtered.length)} of{" "}
            {filtered.length} customers
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

export default UserOutlet;
