import React, { useEffect, useMemo } from "react";
import "./EditableRows.css";
import DebounceSelect from "./DebounceSelect.jsx";

// dnd-kit imports
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  defaultAnimateLayoutChanges,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const createDefaultRow = () => ({
  id: (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
  product: "",
  material: "",
  lot: "",
  quantity: 0,
  multiplier: 1,
});

function SortableRow({
  row,
  index,
  handleChange,
  removeRow,
  addRow,
  options1 = [],
  options2 = [],
  isDisabled,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
    animateLayoutChanges: (args) => defaultAnimateLayoutChanges({ ...args, wasDragging: true }),
  });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    boxShadow: isDragging ? "0 4px 8px rgba(0,0,0,0.12)" : "none",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  return (
    <div ref={setNodeRef} style={style} className="row" {...attributes}>
      <span
        {...listeners}
        className="drag-handle"
        style={{ cursor: "grab", paddingRight: "8px", userSelect: "none", fontSize: "1.2em" }}
        title="Drag to reorder"
      >
        ☰
      </span>

      {/* product selector (use provided options1 when present, otherwise DebounceSelect) */}
      {Array.isArray(options1) && options1.length > 0 ? (
        <select
          className="basic-input"
          value={row.product ?? ""}
          onChange={(e) => handleChange(index, "product", e.target.value)}
        >
          <option value="">Select</option>
          {options1.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <DebounceSelect
          objValue={row.product}
          fetchOptions={async () => []}
          onSelect={(value) => handleChange(index, "product", value)}
          disabled={false}
          style={{ width: 200 }}
        />
      )}

      {/* material selector */}
      {Array.isArray(options2) && options2.length > 0 ? (
        <select className="basic-input" value={row.material ?? ""} onChange={(e) => handleChange(index, "material", e.target.value)}>
          <option value="">Select</option>
          {options2.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <DebounceSelect
          fetchOptions={async () => []}
          onSelect={(value) => handleChange(index, "material", value)}
          disabled={false}
          style={{ width: 200 }}
        />
      )}

      <input className="basic-input" type="text" value={row.lot} placeholder="lot" onChange={(e) => handleChange(index, "lot", e.target.value)} />

      <input className="basic-input" type="number" value={row.quantity} onChange={(e) => handleChange(index, "quantity", Number(e.target.value))} />

      <input className="basic-input" type="number" value={row.multiplier} onChange={(e) => handleChange(index, "multiplier", Number(e.target.value))} />

      <button
        type="button"
        className="basic-button remove"
        style={{ background: isDisabled ? "#f18989" : "red", color: "white" }}
        onClick={(e) => {
          e.stopPropagation();
          removeRow(index);
        }}
        disabled={isDisabled}
      >
        -
      </button>

      <button
        type="button"
        className="basic-button"
        onClick={(e) => {
          e.stopPropagation();
          addRow();
        }}
      >
        +
      </button>
    </div>
  );
}

export default function EditableRows({ rows: propsRows = [], onChange = () => {}, options1 = [], options2 = [], user }) {
  // 1) Create rowsWithIds synchronously so first render has keys
  const rowsWithIds = useMemo(() => {
    return propsRows.length > 0
      ? propsRows.map((r) => (r && r.id ? r : { ...(r || {}), id: (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}` }))
      : [createDefaultRow()];
  }, [propsRows]);

  // 2) If we injected ids or injected a default row, sync them back to parent once
  useEffect(() => {
    const hasMissing = propsRows.length === 0 || propsRows.some((r) => !r || !r.id);
    if (hasMissing) {
      onChange(rowsWithIds);
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = rowsWithIds;

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = rows.findIndex((r) => r.id === active.id);
    const newIndex = rows.findIndex((r) => r.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onChange(arrayMove(rows, oldIndex, newIndex));
  };

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addRow = () => onChange([...rows, createDefaultRow()]);

  const removeRow = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    onChange(updated.length ? updated : [createDefaultRow()]);
  };

  return (
    <div className="editable-rows">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
          {rows.map((row, index) => (
            <SortableRow
              key={row.id}
              row={row}
              index={index}
              handleChange={handleChange}
              removeRow={removeRow}
              addRow={addRow}
              options1={options1}
              options2={options2}
              isDisabled={rows.length === 1}
              user={user}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
