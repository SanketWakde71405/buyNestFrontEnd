import React, { useState } from "react";

// Icons
import { IoAddOutline } from "react-icons/io5";
import { IoRemoveOutline } from "react-icons/io5";
import { IoPencilOutline } from "react-icons/io5";
import { IoTrashOutline } from "react-icons/io5";
import { IoReorderThreeOutline } from "react-icons/io5";

function StatusPill({ status }) {
  const isActive = status === "active";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        isActive
          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
          : "bg-red-50 text-red-500 border border-red-100"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function CategoryAvatar({ name }) {
  const initial = name?.charAt(0)?.toUpperCase() || "?";
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-violet-100 dark:bg-indigo-950 text-violet-600 dark:text-violet-300 font-semibold text-xs">
      {initial}
    </div>
  );
}

function CategoryTreeNode({
  node,
  depth,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  onReorder,
  reorderEnabled,
  isDragging,
  isDropTarget,
  onNodeDragStart,
  onNodeDragEnter,
  onNodeDragEnd,
  onNodeDrop,
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node._id;

  return (
    <div
      className={
        depth > 0
          ? "ml-4 border-l border-gray-100 dark:border-slate-800 pl-3"
          : ""
      }
    >
      <div
        onClick={() => onSelect(node)}
        draggable={reorderEnabled}
        onDragStart={(e) => {
          e.stopPropagation();
          onNodeDragStart();
        }}
        onDragEnter={(e) => {
          e.stopPropagation();
          onNodeDragEnter();
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.stopPropagation();
          onNodeDrop();
        }}
        onDragEnd={(e) => {
          e.stopPropagation();
          onNodeDragEnd();
        }}
        className={`flex items-center gap-3 px-2 py-2.5 rounded-lg cursor-pointer transition-colors group ${
          isSelected
            ? "bg-violet-50 dark:bg-slate-900 ring-1 ring-violet-200 dark:ring-slate-700"
            : "hover:bg-gray-50 dark:hover:bg-slate-900"
        } ${isDragging ? "opacity-40" : ""} ${
          isDropTarget ? "ring-2 ring-violet-300 dark:ring-violet-700" : ""
        }`}
      >
        {reorderEnabled && (
          <IoReorderThreeOutline
            size={16}
            className="text-gray-300 dark:text-gray-600 shrink-0 cursor-grab active:cursor-grabbing"
          />
        )}

        {/* Expand/collapse toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) setExpanded((v) => !v);
          }}
          className={`w-5 h-5 flex items-center justify-center rounded border shrink-0 ${
            hasChildren
              ? "border-gray-300 dark:border-slate-700 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
              : "border-transparent"
          }`}
        >
          {hasChildren &&
            (expanded ? (
              <IoRemoveOutline size={12} />
            ) : (
              <IoAddOutline size={12} />
            ))}
        </button>

        <CategoryAvatar name={node.name} />

        <span className="font-medium text-sm text-zinc-800 dark:text-gray-200 truncate">
          {node.name}
        </span>

        <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full whitespace-nowrap">
          {(node.productCount || 0).toLocaleString()} Products
        </span>

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <StatusPill status={node.status} />
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(node);
              }}
              className="p-1 rounded text-blue-500 hover:bg-indigo-50 dark:hover:bg-slate-800"
            >
              <IoPencilOutline size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node);
              }}
              className="p-1 rounded text-red-400 hover:bg-red-50 dark:hover:bg-slate-800"
            >
              <IoTrashOutline size={14} />
            </button>
          </div>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="mt-0.5">
          <CategoryTree
            nodes={node.children}
            parentId={node._id}
            depth={depth + 1}
            selectedId={selectedId}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            onReorder={onReorder}
            reorderEnabled={reorderEnabled}
          />
        </div>
      )}
    </div>
  );
}

// Purely presentational — receives an already-built, already-filtered tree
// and renders it. All data fetching, tree-building, and filtering happens
// in CategoriesOutlet.
//
// Drag-and-drop reordering is scoped to one sibling group at a time: each
// CategoryTree instance (the top-level call, or the nested one rendered
// for an expanded node's children) owns its own drag state and only
// reorders within the `nodes` array it was given — a node can never be
// dragged into a different parent's list this way, matching the
// backend's reorderCategories endpoint, which only accepts a full
// replace of one parent's existing sibling set.
//
// `parentId` identifies which sibling group `nodes` represents (null for
// top-level categories, or the parent category's _id for its children)
// and is passed straight through to onReorder.
function CategoryTree({
  nodes,
  depth = 0,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  onReorder,
  reorderEnabled = false,
  parentId = null,
}) {
  const [dragId, setDragId] = useState(null);
  const [dropTargetId, setDropTargetId] = useState(null);

  if (!nodes || nodes.length === 0) {
    // Only show the empty-state message at the root — an expanded node
    // with zero (filtered-out) children should just render nothing.
    return depth === 0 ? (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
        No categories match your search.
      </div>
    ) : null;
  }

  const canReorder = reorderEnabled && typeof onReorder === "function";

  const handleDrop = () => {
    if (
      !canReorder ||
      dragId === null ||
      dropTargetId === null ||
      dragId === dropTargetId
    ) {
      setDragId(null);
      setDropTargetId(null);
      return;
    }

    const currentOrder = nodes.map((n) => n._id);
    const fromIndex = currentOrder.indexOf(dragId);
    const toIndex = currentOrder.indexOf(dropTargetId);

    setDragId(null);
    setDropTargetId(null);

    if (fromIndex === -1 || toIndex === -1) return;

    const reordered = [...currentOrder];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    onReorder(parentId, reordered);
  };

  return (
    <div className="flex flex-col gap-1">
      {nodes.map((node) => (
        <CategoryTreeNode
          key={node._id}
          node={node}
          depth={depth}
          selectedId={selectedId}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onReorder={onReorder}
          reorderEnabled={canReorder}
          isDragging={dragId === node._id}
          isDropTarget={
            canReorder && dropTargetId === node._id && dragId !== node._id
          }
          onNodeDragStart={() => setDragId(node._id)}
          onNodeDragEnter={() => {
            if (dragId && dragId !== node._id) setDropTargetId(node._id);
          }}
          onNodeDragEnd={() => {
            setDragId(null);
            setDropTargetId(null);
          }}
          onNodeDrop={handleDrop}
        />
      ))}
    </div>
  );
}

export default CategoryTree;
