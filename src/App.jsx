import React, { useState } from "react";
import MultiSelectDropdown from "./components/MultiSelectDropdown.jsx";
import DebounceSelect from "./components/DebounceSelect.jsx";

const users = [
  { id: 1, value: 1, label: "Alice Johnson" },
  { id: 2, value: 2, label: "Bob Smith" },
  { id: 3, value: 3, label: "Charlie Brown" },
  { id: 4, value: 4, label: "Diana Prince" },
  { id: 5, value: 5, label: "Ethan Hunt" },
];

export default function App() {

  // Simulate fetching users with debounce
  const fetchUsers = async (query) => {
    // Simulate filtering users by label
    return users.filter(user =>
      user.label.toLowerCase().includes(query.toLowerCase())
    );
    // const response = await getData(`/api/users?search=${query}`, "token", user.sessionId);
    // return response;
  };

  return (
    <div className="body-content">
      <div style={{ display: "flex", gap: "1rem" }}>
        <MultiSelectDropdown />
        <DebounceSelect
          fetchOptions={fetchUsers}
          placeholder="Select a user"
          // objValue={formData.product}
          onSelect={(value) => console.log("Selected user ID:", value)}
          disabled={false}
          style={{ width: 300 }}
          pushUrlParamObj={"id"}
        />
        <MultiSelectDropdown />
      </div>
    </div>
  );
}