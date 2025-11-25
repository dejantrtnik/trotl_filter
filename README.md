# trotl-table

A simple, flexible **Table UI** for React — with rows drag‑and‑drop, context menus, and persistence.

---
**DEMO:** [https://table.linijart.eu/](https://table.linijart.eu/)
---

## 🚀 Installation

```bash
npm install trotl-table
# or
yarn add trotl-table

\_(ツ)_/ Versions

1.0.8 => 
1.0.7 => removed context (better for npm consumers)
1.0.6 => ...
1.0.5 => ...
1.0.4 => fix sorting
1.0.3 => ...
1.0.2 => prepare for npm consumers
1.0.1 => initial release

⚡ Quick Start

import React, { useState } from "react";
import { Table } from "trotl-table";
import "./Table.css";

const columns = [
  { header: "ID", accessor: "id" },
  { header: "Name", accessor: "name" },
  { header: "Email", accessor: "email" }
];

const data = [
  { id: "1", name: "Alice", email: "alice@example.com" },
  { id: "2", name: "Bob", email: "bob@example.com" }
];

export default function Demo() {
  const [rows] = useState(data);

  const deleteCallback = async (row) => {
    // replace with real API call
    await new Promise((r) => setTimeout(r, 200));
    return { success: true };
  };

  const editCallback = (row) => {
    console.log("edit", row);
  };

  const viewCallback = (row) => {
    console.log("view", row);
  };

  return (
    <Table
      tableId="demo-grouped"
      columns={columns}
      data={data}
      isGrouped={false}
      groupKey="groupId"
      extraSearchTerm=""
      rowHeight={40}
      groupHeaderHeight={40}
      showKey={true}
      enableDragRow={true}
      selectedRowsCallback={(arr) => console.log("selected", arr)}
      deleteCallback={deleteCallback}
      editCallback={editCallback}
      viewCallback={viewCallback}
      buttons={["view", "edit", "delete"]}
    />
  );
}


🛠 Features
- Row selection with context‑aware state
- Sorting (asc/desc cycle per column)
- Grouped rows with expandable headers
- Search + highlight across all columns
- Drag‑and‑drop rows with auto‑scroll support
- Callbacks for view, edit, delete actions
- Context API for global table management
- Groupe tables

📚 API Reference
<Table /> Props
- tableId: unique string ID for the table
- columns: array of { header, accessor }
- data: array of row objects
- isGrouped: enable grouped mode (true/false)
- groupKey: key to group rows by
- extraSearchTerm: string to filter + highlight rows
- rowHeight: row height in px
- groupHeaderHeight: group header height in px
- showKey: show row key (true/false)
- enableDragRow: enable drag‑and‑drop (true/false)
- selectedRowsCallback: callback with selected row IDs
- editCallback: callback when editing a row
- viewCallback: callback when viewing a row
- deleteCallback: async callback for deleting a row
- buttons: array of action buttons to show

🌟 Context Hooks
Use useTable to access global state:

import { useTable } from "trotl-table";

function Toolbar({ tableId }) {
  const { selectedRows, clearSelection } = useTable();

  return (
    <div>
      <span>Selected: {selectedRows[tableId]?.length || 0}</span>
      <button onClick={() => clearSelection(tableId)}>Clear</button>
    </div>
  );
}

🎨 Styling

.highlight {
  background-color: yellow;
  font-weight: bold;
}


🏆 License
MIT — free to use, modify, and share.
---

