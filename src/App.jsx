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
  CalendarRangePicker,
  LineDivider,
  Button,
  Switch,
  Upload
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

  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    components: [],
    inputValue: "",
    switchEnabled: false
  });

  // Demo files to show in Upload when `value` is provided
  const demoFiles = [
    { name: "sample1.txt", size: 1234 },
    { name: "picture.png", size: 23456 }
  ];

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
          loading={false}
          allowClear={true}
          style={{ border: "2px solid red" }}
          className="multi-select-dropdown"
          isMulti={true}
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
          disabled={false}
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
          disabled={false}
        />

        <IconInput
          icon={"🔍"}
          onAction={() => alert("Icon clicked!")}
        />

          <SearchInput
            textArea={true}
          // width={250}
          // height={30}
          // placeholder={"Search..."}
          // height={20}
          // pushUrlParamObj={"search"}
          // width={400}
          width="100%"
          minWidth={200}
          maxWidth={800}
        />

        <DebounceSelect
          loading={false}
          fetchOptions={fetchUsers}
          placeholder="Select a user"
          // objValue={formData.product}
          value={selectedUser}
          onSelect={(value, item) => { console.log("Selected user:", item); setSelectedUser(item); }}
          disabled={false}
          style={{ width: 300 }}
          pushUrlParamObj={"id"}
          fetchAll={false}
          addItem={(newOption) => setUserOptions(prev => [...prev, newOption])}
        />
        <MultiSelectDropdown />

      </div>

      <LineDivider
        text="Line Divider Example"
        position="center"
        color="#007bff"
        thickness={2}
        margin="30px 0"
        fontSize={16}
        fontWeight="bold"
        fontColor="#007bff"
      />

      <Button
        type="ok" // ok, cancel, delete, custom (null)
        height={30}
        onClick={() => alert("Button clicked!")}>
        Click Me
      </Button>

      <Button
        type="cancel" // ok, cancel, delete, custom (null)
        onClick={() => alert("Button clicked!")}>
        Click Me
      </Button>

      <Button
        type="delete" // ok, cancel, delete, custom (null)
        onClick={() => alert("Button clicked!")}>
        Click Me
      </Button>

      <Button
        type="custom" // ok, cancel, delete, custom (null)
        style={{ width: 200, color: "" }}
        onClick={() => alert("Button clicked!")}>
        Login
      </Button>


      <Button
        float={{
          position: "botton-left",
          bottom: 10
        }}
        type="custom" // ok, cancel, delete, custom (null)
        style={{ width: 200, color: "" }}
        onClick={() => alert("Button clicked!")}>
        floating button
      </Button>

      <Switch
        checked={formData.switchEnabled}
        onChange={(value) => setFormData({ ...formData, switchEnabled: value })}
        disabled={false}
        label="Enable Feature"
        size="medium" // small, medium, large
        style={{}}
        className=""
      />
      <LineDivider
        text="Line Divider Example"
        position="center"
        color="#007bff"
        thickness={2}
        margin="30px 0"
        fontSize={16}
        fontWeight="bold"
        fontColor="#007bff"
      />

      <Upload
        onChange={(files, ev) => console.log("Upload onChange:", files, ev)}
        value={demoFiles}
        // acceptFiles={}
        maxFiles={2}
        customPreview={null}
        height={40}
        width={300}
      />
      
    </div>
  );
}
