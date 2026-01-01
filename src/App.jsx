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
  { value: "1", label: "Alice Johnson", age: 30 },
  { value: "2", label: "Bob Smith", age: 28 },
  { value: "3", label: "Charlie Brown", age: 25 },
  { value: "4", label: "Diana Prince", age: 32 },
  { value: "5", label: "Ethan Hunt", age: 35 },
];

export default function App() {

  const [options, setOptions] = useState([
    { id: 1, value: 1, label: "Alice Johnson" },
    { id: 2, value: 2, label: "Bob Smith" },
    { id: 3, value: 3, label: "Charlie Brown" },
    { id: 4, value: 4, label: "Diana Prince" },
    { id: 5, value: 5, label: "Ethan Hunt" },
  ]);

  const [userOptions, setUserOptions] = useState(users);

  const [formData, setFormData] = useState({
    components: [],
    inputValue: ""
  });

  // Simulate fetching users with debounce
  const fetchUsers = async (query) => {
    // Simulate filtering users by label
    return userOptions.filter(user =>
      user.label.toLowerCase().includes(query.toLowerCase())
    );
    // const response = await getData(`/api/users?search=${query}`, "token", user.sessionId);
    // return response;
  };
  // Filter out duplicate options by value
  const uniqueOptions = options.filter(
    (option, index, self) =>
      index === self.findIndex((o) => o.value === option.value)
  );

  return (
    <div className="body-content">
      <div style={{ display: "flex", gap: "1rem" }}>

        <MultiSelectDropdown
          allowClear={true}
          style={{ border: "2px solid red" }}

          className="multi-select-dropdown"
          // isMulti={true}
          label={"components"}
          options={uniqueOptions}
          // addItem={(newOption) => console.log(newOption)}
          // addItem={(newOption) => setOptions(prev => [...prev, newOption])}
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
          dateFormat={"DD-MM-YYYY"}
          onChange={(dt) => console.log("Selected datetime:", dt)}
          pushUrlParamObj={"rangeTime"}
          predefinedRanges={["Today", "yesterday", "lastweek", 7, 30, "thismonth", "lastyear"]}
          startWith={"monday"}
        />
 

        <DateTimeInput
          time={true}
          timeStart={"00:00"}
          timezone={"UTC"}
          timeFormat={"HH:mm"}
          dateFormat={"YYYY-MM-DD"}
          onChange={(dt) => console.log("Selected datetime:", dt)}
          pushUrlParamObj={"datetime"}
          predefinedRanges={['today', 'yesterday', 'lastweek', 7, 'thismonth', 'lastyear']}
          startWith={"monday"}
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
          onSelect={(value, rest) => console.log("Selected user ID:", rest)}
          disabled={false}
          style={{ width: 300 }}
          pushUrlParamObj={"id"}
          fetchAll={false}
          addItem={(newOption) => setUserOptions(prev => [...prev, newOption])}
        />
        <MultiSelectDropdown />

      </div>
    </div>
  );
}
