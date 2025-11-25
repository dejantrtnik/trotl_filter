import React, { useState } from "react";
// import { useNavigate, useSearchParams } from 'react-router-dom';
import Filter from "./components/Filter.jsx";
import "./components/Filter.css";
import Modal from './components/Modal'; 


export default function Demo() {

  // const [searchParams, setSearchParams] = useSearchParams();
  
  // const mounted = useRef(true);
  // Simple translation stub used by demo app — returns mapped keys or the key itself.
  const _translations = {
    addNew: 'addNew',
    exportFiltered: 'exportFiltered',
    therapistForm: 'therapistForm',
    refreshTable: 'refreshTable',
    searchByKeyword: 'searchByKeyword',
    deleteBatch: 'deleteBatch',
    deleteFailed: 'deleteFailed',
    resetSorting: 'resetSorting',
    showFilters: 'showFilters',
    hideFilters: 'hideFilters',
    resetSearching: 'resetSearching',
    role: 'role',
    confirmTitle: 'confirmTitle',
    confirm: 'confirm',
    cancel: 'cancel',
    confirmUnknown: 'confirmUnknown'
  };

  const t = (key) => {
    if (typeof key === 'undefined' || key === null) return '';
    return _translations[key] ?? key;
  }
  const type = ""
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(1);

  // const [searchTerm, setSearchTerm] = useState('');
  // const [status, setStatus] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  // const [startDate, setStartDate] = useState('');
  // const [endDate, setEndDate] = useState('');
  const [extraSearchTerm, setExtraSearchTerm] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [groups, setGroups] = useState([]);
  // const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showModal, setShowModal] = useState(false);
  const [contentModal, setContentModal] = useState(false);
  const [page, setPage] = useState(null);
  const [state, setState] = useState(null)
  const [selectedRows, setSelectedRows] = useState([]);
  const [resetSorting, setResetSorting] = useState(false)

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const filterConfig = [
    // {
    //   active: true,
    //   type: 'group',
    //   key: 'adminActions',
    //   label: 'Admin Actions',
    //   role: ['developer', 'admin', 'editor'],
    //   buttons: [
    //     {
    //       active: false,
    //       type: 'button',
    //       key: 'addNew',
    //       title: t("addNew"),
    //       label: t("addNew"),
    //       confirm: false,
    //       onAction: (key) => {
    //         // console.log("Custom button clicked:", key);
    //         setContentModal({
    //           title: t(type + "Form"),
    //           children: <Form onClose={onCloseModal} />
    //         })
    //         setShowModal(true); // or any other logic
    //       },
    //       role: ['developer', 'admin', 'editor'],
    //     },
    //     {
    //       active: false,
    //       type: 'button',
    //       key: 'export',
    //       label: t("exportFiltered"),
    //       confirm: true,
    //       onAction: (key) => {
    //         // console.log("Confirmed export:", key);
    //         exportFilteredRows(); // your custom logic
    //       }
    //     },
    //     {
    //       active: false,
    //       type: 'button',
    //       key: 'export',
    //       label: '📤' + t("exportFiltered"),
    //       confirm: true,
    //       onAction: (key) => {
    //         // console.log("Confirmed export:", key);
    //         exportFilteredRows(); // your custom logic
    //       }
    //     }
    //   ].filter((f) => f?.active)
    // },
    {
      active: true,
      type: 'button',
      key: 'addNew',
      title: "add new",
      label: "add new",
      confirm: false,
      onAction: (key) => {
        // console.log("Custom button clicked:", key);
        setContentModal({
          title: t("therapistForm"),
          // children: <Form onClose={onCloseModal} />
          children: <div>FORM</div>
        })
        setShowModal(true); // or any other logic
      },
      role: ['developer', 'admin', 'editor'],
    },
    {
      active: true,
      type: 'button',
      key: 'export',
      label: t("exportFiltered"),
      confirm: true,
      onAction: (key) => {
        // console.log("Confirmed export:", key);
        exportFilteredRows(); // your custom logic
      }
    },

    {
      active: true,
      type: 'icon',
      key: 'refresh',
      style: { fontSize: 25 },
      icon: '🔄', tooltip: t("refreshTable"),
      role: ['developer', 'admin', 'editor'],
      onAction: handleRefresh
    },
    {
      active: true,
      type: 'input',
      key: 'extraSearch',
      placeholder: t("searchByKeyword"),
      value: extraSearchTerm,
      role: ['developer', 'admin', 'editor']
    },
    {
      active: true, // selectedRows.length > 0,
      type: 'button',
      // key: 'export',
      label: t("deleteBatch"),
      confirm: true,
      style: { background: "#ff0000" },
      onAction: async (key) => {
        const resolve = await deleteData(origin + '/api/deletedocuments', { ids: selectedRows, type: page?.type }, user?.sessionId);
        // console.log(resolve)
        if (resolve?.success) {
          // setTimeout(() => {
          //   setRefreshTrigger(prev => prev + 1);
          //   showMessage('success', resolve?.message);
          // }, 300);
        } else {
          // showMessage('error', t("deleteFailed"));
        }
      }
    },
    {
      active: resetSorting,
      type: 'button',
      // key: 'export',
      label: t("resetSorting"),
      confirm: true,
      style: { background: "#ff0000" },
      onAction: async (key) => {
        setResetSorting(false)
      }
    },
    {
      active: true,
      type: 'multiselect',
      key: 'roles',
      value: selectedRoles,
      placeholder: 'Select roles...',
      role: ['developer', 'admin', 'editor'],
      isMulti: true,
      options: [
        { label: '</> ' + t("roles.developer"), value: 'developer' },
        { label: '👑 ' + t("roles.admin"), value: 'admin' },
        { label: '✏️ ' + t("roles.editor"), value: 'editor' },
        { label: '👁️ ' + t("roles.viewer"), value: 'viewer' }
      ]
    },
    {
      active: true,
      type: 'multiselect',
      key: 'permissions',
      value: permissions,
      placeholder: 'Select permissions...',
      role: ['developer', 'admin'],
      isMulti: true,
      options: [
        { label: '👁️‍🗨️ ' + t("permissions.read"), value: 'read' },
        { label: '✍️ ' + t("permissions.write"), value: 'write' },
        { label: '🧹 ' + t("permissions.delete"), value: 'delete' },
        { label: '🔁 ' + t("permissions.share"), value: 'share' }
      ]
    },
    {
      active: true,
      type: 'multiselect',
      key: 'groups',
      value: groups,
      placeholder: 'Select groups...',
      role: ['developer', 'admin'],
      isMulti: true,
      options: [
        { label: '👨‍💻 ' + t("groups.developerTeam"), value: 'developer_team' },
        { label: '🛡️ ' + t("groups.adminTeam"), value: 'admin_team' },
        { label: '🎬 ' + t("groups.contentTeam"), value: 'content_team' },
        { label: '👥 ' + t("groups.guestTeam"), value: 'guest_team' }
      ]
    },
  ].filter((f) => f?.active)
  return (
    <div className="body-content">
      <Filter
        // key={dataKey}
        title={type}
        config={filterConfig}
        userRole={["developer" || '']}
        urSearchParams={true}
        extraSearchTerm={extraSearchTerm}
        // theme={isDarkMode ? 'dark' : 'light'}
        onChange={(key, value) => {
          if (key === 'extraSearch') setExtraSearchTerm(value);
          if (key === 'roles') setSelectedRoles(value);
          if (key === 'permissions') setPermissions(value);
          if (key === 'groups') setGroups(value);
        }}
        onAction={(key) => {
          if (key === 'refresh') onCloseModal();
          if (key === 'addUser') onAddUser();
        }}
      />
      <Modal
        isOpen={showModal}
        title={contentModal?.title}
        // confirmLabel="Yes"
        // cancelLabel="No"
        // onConfirm={() => {
        //   exportFilteredRows();
        //   setShowModal(false);
        // }}
        onCancel={() => setShowModal(false)}
      >
        {contentModal?.children}
      </Modal>
    </div>
  );
}
