import React, { useState } from "react";
// import MultiSelectDropdown from "./components/MultiSelectDropdown.jsx";
// import DebounceSelect from "./components/DebounceSelect.jsx";
import {
  DebounceSelect,
  MultiSelectDropdown,
  MultiSelect,
  SearchInput,
  IconInput,
  DateTimeInput,
  RangePicker,
  CalendarRangePicker,
  LineDivider,
  Button,
  Switch,
  Upload,
  ColorPicker,
  CardSelect,
  EditableRows
} from "./index.js";

// import CardSelect from "./components/CardSelect.jsx";

const users = [
  { value: "1", label: "Alice Johnson", age: 30 },
  { value: "2", label: "Bob Smith", age: 28 },
  { value: "3", label: "Charlie Brown", age: 25 },
  { value: "4", label: "Diana Prince", age: 32 },
  { value: "5", label: "Ethan Hunt", age: 35 },
];

export default function App() {

  const [options, _setOptions] = useState([
    { id: 1, value: 1, label: "Alice Johnson" },
    { id: 2, value: 2, label: "Bob Smith" },
    { id: 3, value: 3, label: "Charlie Brown" },
    { id: 4, value: 4, label: "Diana Prince" },
    { id: 5, value: 5, label: "Ethan Hunt" },
  ]);

  const [userOptions, setUserOptions] = useState(users);

  const [selectedUser, setSelectedUser] = useState(null);

  const [cardSelectedKeys, setCardSelectedKeys] = useState([]);

  const [formData, setFormData] = useState({
    components: [],
    inputValue: "",
    switchEnabled: false,
    products: []
  });

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const theme = {};

  // Demo files to show in Upload when `value` is provided
  const _demoFiles = [
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
const [dateIme, setDateIme] = useState("");
  return (
    <div className="body-content">
      <div style={{ display: "flex", gap: "1rem" }}>

        {/* <MultiSelectDropdown
          loading={false}
          allowClear={true}
          // style={{ border: "2px solid red" }}
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
          // disabled={true}
        /> */}
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
          onChange={(dt) => setDateIme(dt)}
          pushUrlParamObj={"datetime"}
          predefinedRanges={['today', 'yesterday', 'lastweek', 7, 'thismonth', 'lastyear']}
          value={dateIme}
          startWith={"monday"}
          presets={[
            { label: "Clear", type: "clear" },
            { label: "Today", type: "today" },
            { label: "+1 Week", type: "days", value: 7 },
            { label: "+10 Days", type: "days", value: 10 },
            { label: "+1 Month", type: "months", value: 1 },
            { label: "+1 Year", type: "years", value: 1 }
          ]}
          disabled={false}
        />

        <IconInput
          icon={"🔍"}
          onAction={() => alert("Icon clicked!")}
        />



        <SearchInput
          width="100%"
          minWidth={200}
          maxWidth={800}
          // height={20}
          // pushUrlParamObj={"search"}
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
        {/* <MultiSelectDropdown /> */}

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
        shopping cart
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
        onChange={(files, ev, meta) => console.log("Upload onChange:", files, ev, meta)}
        onRemove={(removed, index) => console.log("Upload onRemove:", removed, index)}
        // value={demoFiles}
        // acceptFiles={}
        customText={"You can upload up to 2 files. Supported formats: .txt, .png, .jpg."}
        maxFiles={2}
        customPreview={null}
        height={40}
        width={300}
        disabled={true}
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

      <MultiSelect
        className="multi-select-dropdown"
        loading={false}
        allowClear={true}
        isMulti={true}
        options={uniqueOptions}
        selected={formData.components}
        onChange={(newValues) => setFormData({ ...formData, components: newValues })}
        // pushUrlParamObj={"ids"}
        style={{
          width: 300,
          padding: "0px 10px 0px 10px",
          borderRadius: 2,
          // background: disabled ? '#f5f5f5' : '#fff',
        }}
        controlStyle={{ width: 300, padding: "0px 10px 0px 10px" }}
        // disabled={true}
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

      <ColorPicker
        label="Accent color"
        value="#1677ff"
        onChange={(c) => console.log('color selected', c)}
        presetColors={["#1677ff", "#ff4d4f", "#52c41a", "#faad14"]}
        allowCustom={true}
        disabled={true}
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


      <EditableRows
        rows={formData.products}
        onChange={(rows) => handleChange("products", rows)}
        options1={["Option A", "Option B", "Option C"]}
        options2={["Type X", "Type Y", "Type Z"]}
        theme={theme}
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
      <CardSelect
        sk={cardSelectedKeys}
        callbackValues={(e) => console.log(e)}
        callbackEvent={(e) => console.log(e)}
        finalMarkers={(e) => setCardSelectedKeys(e)}
        lines={true}
        linesColor="#007bff"
      />
    </div>
  );
}
