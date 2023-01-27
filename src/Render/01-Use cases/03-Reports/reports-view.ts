const reportsView = `
<div id='reports-topbar-container'>
  <div id='reports-topbar-heading' class='setup-topbar-item'></div>
  <button id='reports-topbar-add' class='setup-topbar-item'>Add</button>
  <button id='reports-topbar-trash' class='setup-topbar-item'></button>
  <button id='reports-topbar-edit' class='setup-topbar-item'>Edit</button>
</div>
<div id="reports-content-container">
  <div id="reports-sidebar"> 
    <button class="setup-sidebar-btn" id='reports-sidebar-ent-btn'>Entities</button>
    <button class="setup-sidebar-btn" id='reports-sidebar-mbrs-btn'>Members</button>
    <button class="setup-sidebar-btn" id='reports-sidebar-groups-btn'>Meeting groups</button>
    <!-- <button class="setup-sidebar-btn">Events</button> -->
  </div>
  <div id="reports-master"></div>
  <div id="reports-detail"></div>
</div>
<!-- <div id='editing-sheet'></div>
<div id='editing-sheet-selectMembers'></div> -->
`

export {
    reportsView
}