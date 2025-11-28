import React, { useState } from "react";
// import MultiSelectDropdown from "./components/MultiSelectDropdown.jsx";
// import DebounceSelect from "./components/DebounceSelect.jsx";
import {
  DebounceSelect,
  MultiSelectDropdown,
  SearchInput,
  IconInput,
  DateTimeInput,
  RangePicker,
  CalendarRangePicker
} from "./index.js";


const users = [
  { id: 1, value: 1, label: "Alice Johnson" },
  { id: 2, value: 2, label: "Bob Smith" },
  { id: 3, value: 3, label: "Charlie Brown" },
  { id: 4, value: 4, label: "Diana Prince" },
  { id: 5, value: 5, label: "Ethan Hunt" },
];

export default function App() {
  const [formData, setFormData] = useState({
    components: [],
    inputValue: ""
  });

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
        <MultiSelectDropdown
          className="multi-select-dropdown"
          isMulti={true}
          label={"components"}
          options={[
            { id: 1, value: 1, label: "Alice Johnson" },
            { id: 2, value: 2, label: "Bob Smith" },
            { id: 3, value: 3, label: "Charlie Brown" },
            { id: 4, value: 4, label: "Diana Prince" },
            { id: 5, value: 5, label: "Ethan Hunt" },
          ]}
          closeMenuOnSelect={false}
          selected={formData.components}
          // onChange={(newValues) => console.log(newValues)}
          onChange={(newValues) => setFormData({ ...formData, components: newValues })}
          // required={isRequired("components")}
          pushUrlParamObj={"ids"}
        />


        <RangePicker
          time={true}
          timeStart={"00:00"}
          timezone={"UTC"}
          timeFormat={"HH:mm"}
          dateFormat={"YYYY-MM-DD"}
          onChange={(dt) => console.log("Selected datetime:", dt)}
          pushUrlParamObj={"rangeTime"}
        />

        <DateTimeInput
          time={true}
          timeStart={"00:00"}
          timezone={"UTC"}
          timeFormat={"HH:mm"}
          dateFormat={"YYYY-MM-DD"}
          onChange={(dt) => console.log("Selected datetime:", dt)}
          pushUrlParamObj={"datetime"}
        />

        <IconInput
          icon={"🔍"}
          onAction={() => alert("Icon clicked!")}
        />

        <SearchInput
          pushUrlParamObj={"search"}
        />

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
