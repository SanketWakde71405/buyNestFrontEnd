import { IoSearchOutline } from "react-icons/io5";

function SearchBar({ search, setSearch, placeholder, onSearch }) {
  return (
    <div className="relative flex-1 min-w-[200px] max-w-xs">
      <IoSearchOutline
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
      />

      <input
        type="text"
        placeholder={placeholder || "Search..."}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);

          // Optional callback
          if (onSearch) {
            onSearch(e.target.value);
          }
        }}
        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border dark:border-slate-800 rounded-lg text-zinc-800 dark:text-gray-200 placeholder-gray-500  dark:placeholder-gray-400 focus:outline-none focus:border-violet-400 dark:focus:border-none focus:ring-1 focus:ring-violet-100 dark:focus:ring-1 dark:focus:ring-slate-700 transition-colors"
      />
    </div>
  );
}

export default SearchBar;
