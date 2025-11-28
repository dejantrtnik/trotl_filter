import React, { useState } from "react";
// import MultiSelectDropdown from "./components/MultiSelectDropdown.jsx";
// import DebounceSelect from "./components/DebounceSelect.jsx";
import { DebounceSelect, MultiSelectDropdown, SearchInput } from "./index.js";


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

        <SearchInput /> 

        <div
          title={"tooltip"}
          style={{
            position: "relative",
            display: "inline-block",
            height: "34px", 
            verticalAlign: "middle"
          }}
        >
          <input
            className="basic-input"
            value={formData?.inputValue}
            style={{
              marginBottom: "10px",
              padding: "5px",
              width: "200px",
              paddingRight: formData?.inputValue ? "24px" : undefined,
              height: "100%",
              boxSizing: "border-box"
            }}
            onChange={e => {
              const newValue = e.target.value;
              setFormData(prev => ({ ...prev, inputValue: newValue }));

              // Update the URL search param
              const params = new URLSearchParams(window.location.search);
              params.set("search", newValue);
              const newUrl =
                window.location.pathname +
                (params.toString() ? "?" + params.toString() : "");
              window.history.replaceState({}, "", newUrl);
            }}
          />
          {formData?.inputValue && (
            <span
              // className="date-clear"
              onClick={() => {
                setFormData(prev => ({ ...prev, inputValue: "" }));
                const params = new URLSearchParams(window.location.search);
                params.delete("search");
                const newUrl =
                  window.location.pathname +
                  (params.toString() ? "?" + params.toString() : "");
                window.history.replaceState({}, "", newUrl);
              }}
              title="Clear date"
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                fontSize: "14px",
                color: "#000000ff",
                lineHeight: "1",
                // fontWeight: "bold"
              }}>
              ✖
            </span>
          )}
        </div>

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

// <div className="filter-date" title={"tooltip"}>
// <input
//     className="basic-input"
//   // type={item.addTime ? 'datetime-local' : 'date'}
//   // value={item.value || ''}
//   // onChange={e => onChange?.(item.key, e.target.value)}
//   />
//   {/*
//
//           {item.value && (
//             <span
//               className="date-clear"
//               // onClick={() => onChange?.(item.key, '')}
//               title="Clear date"
//             >
//               ✖️
//             </span>
//           )}
//             */}
// </div>