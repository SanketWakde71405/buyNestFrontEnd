export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export const formatCurrency = (value) =>
  value == null
    ? "—"
    : `₹ ${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;    