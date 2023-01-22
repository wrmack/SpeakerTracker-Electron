import { displayEntities } from './01-Master/DisplayEntities/display-entities-view.js'
import { loadEntities } from './01-Master/DisplayEntities/display-entities-presenter.js'
import { displaySelectedEntity, setupEntityDetailListeners } from './02-Detail/DisplaySelectedEntity/display-selected-entity-view.js'
import { loadAddEntitySheet, setupAddEntityListeners } from './03-Editing tools/Entities/AddEntity/add-entity-view.js'
import { loadDeleteEntitySheet, setupDeleteEntityListeners } from './03-Editing tools/Entities/DeleteEntity/delete-entity-view.js'
import { loadEditEntitySheet, setupEditEntityListeners } from './03-Editing tools/Entities/EditEntity/edit-entity-view.js'

import { displayMembers, setupDropdownListeners } from './01-Master/DisplayMembers/display-members-view.js'
import { loadEntitiesDropdownForMembers, loadMembers } from './01-Master/DisplayMembers/display-members-presenter.js'
import { displaySelectedMember, setupMemberDetailListeners } from './02-Detail/DisplaySelectedMember/display-selected-member-view.js'
import { loadAddMemberSheet, setupAddMemberListeners } from './03-Editing tools/Members/AddMember/add-member-view.js'
import { loadDeleteMemberSheet, setupDeleteMemberListeners } from './03-Editing tools/Members/DeleteMember/delete-member-view.js'
import { loadEditMemberSheet, setupEditMemberListeners } from './03-Editing tools/Members/EditMember/edit-member-view.js'

import { displayGroups, setupGroupsEntitiesDropdownListeners } from './01-Master/DisplayMeetingGroups/display-groups-view.js'
import { loadEntitiesDropdownForGroups, loadGroups } from './01-Master/DisplayMeetingGroups/display-groups-presenter.js'
import { displaySelectedGroup, setupGroupDetailListeners } from './02-Detail/DisplaySelectedGroup/display-selected-group-view.js'
import { loadAddGroupSheet, setupAddGroupListeners } from './03-Editing tools/MeetingGroups/AddMeetingGroup/add-meetingGroup-view.js'
import { loadDeleteGroupSheet, setupDeleteGroupListeners } from './03-Editing tools/MeetingGroups/DeleteMeetingGroup/delete-meeting-group.js'
import { loadEditGroupSheet, setupEditGroupListeners } from './03-Editing tools/MeetingGroups/EditMeetingGroup/edit-group-view.js'

import { displayEvents } from './01-Master/DisplayEvents/display-events-view.js'
import { loadEntitiesDropdownForEvents, loadGroupsDropdownForEvents, loadEvents } from './01-Master/DisplayEvents/display-events-presenter.js'
import { loadAddEventSheet, setupAddEventListeners } from './03-Editing tools/Events/AddEvent/add-event-view.js' 


const sideBarSelection = { name: 'entities' }

const setupView = `
<div id='setup-topbar-container'>
  <div id='setup-topbar-heading' class='setup-topbar-item'></div>
  <button id='setup-topbar-add' class='setup-topbar-item'>Add</button>
  <button id='setup-topbar-trash' class='setup-topbar-item'></button>
  <button id='setup-topbar-edit' class='setup-topbar-item'>Edit</button>
</div>
<div id="setup-content-container">
  <div id="setup-sidebar"> 
    <button class="setup-sidebar-btn" id='setup-sidebar-ent-btn'>Entities</button>
    <button class="setup-sidebar-btn" id='setup-sidebar-mbrs-btn'>Members</button>
    <button class="setup-sidebar-btn" id='setup-sidebar-groups-btn'>Meeting groups</button>
    <button class="setup-sidebar-btn" id='setup-sidebar-events-btn'>Events</button>
  </div>
  <div id="setup-master"></div>
  <div id="setup-detail"></div>
</div>
<div id='editing-sheet'></div>
<div id='editing-sheet-selectMembers'></div>
`

//
// Listeners for Add, Trash, Edit buttons
//
// Editing is done by sliding in an editing sheet

const setupEditItemListeners = function () {
  // 'Add' is pressed
  const topadd = document.getElementById('setup-topbar-add');
  if (!topadd) {return}
  topadd.addEventListener('click', async () => {
    const trashBtn = document.getElementById('setup-topbar-trash') as HTMLButtonElement
    trashBtn.disabled = true
    const editBtn = document.getElementById('setup-topbar-edit') as HTMLButtonElement
    editBtn.disabled = true
    moveSheet()
    switch (sideBarSelection.name) {
      case 'entities':
        loadAddEntitySheet()
        setupAddEntityListeners()
        break
      case 'members':
        loadAddMemberSheet()
        setupAddMemberListeners()
        break
      case 'groups':
        loadAddGroupSheet()
        setupAddGroupListeners()
        break
      case 'events':
        await loadAddEventSheet()
        setupAddEventListeners()
    }
  })

  // 'Trash' is pressed
  const toptrash = document.getElementById('setup-topbar-trash');
  if (!toptrash) {return}
  toptrash.addEventListener('click', async () => {
    const addBtn = document.getElementById('setup-topbar-add') as HTMLButtonElement
    addBtn.disabled = true
    const editBtn = document.getElementById('setup-topbar-edit') as HTMLButtonElement
    editBtn.disabled = true
    moveSheet()
    switch (sideBarSelection.name) {
      case 'entities':
        loadDeleteEntitySheet()
        setupDeleteEntityListeners()
        break
      case 'members':
        loadDeleteMemberSheet()
        setupDeleteMemberListeners()
        break
      case 'groups':
        loadDeleteGroupSheet()
        setupDeleteGroupListeners()
    }
  })

  // 'Edit' is pressed
  const toped = document.getElementById('setup-topbar-edit');
  if (!toped) {return}
  toped.addEventListener('click', async () => {
    const trashBtn = document.getElementById('setup-topbar-trash') as HTMLButtonElement
    trashBtn.disabled = true
    const addBtn = document.getElementById('setup-topbar-add') as HTMLButtonElement
    addBtn.disabled = true
    moveSheet()
    switch (sideBarSelection.name) {
      case 'entities':
        loadEditEntitySheet()
        setupEditEntityListeners()
        break
      case 'members':
        loadEditMemberSheet()
        setupEditMemberListeners()
        break
      case 'groups':
        loadEditGroupSheet()
        setupEditGroupListeners()
    }
  })

}

const setupSidebarListeners =  function () {
  // Entities button
  const sident = document.getElementById('setup-sidebar-ent-btn')
  if (!sident) {return}
  sident.addEventListener('click', () => {
    showEntities()
    removeSelectedClass()
    sident.classList.add('setup-sidebar-btn-selected')
    sideBarSelection.name = 'entities'
  })
  document.addEventListener('ent-saved', async (event) => {
    if (event instanceof CustomEvent) {
      
      await showEntities()
    }
  })

  // Members button
  const sidemem =  document.getElementById('setup-sidebar-mbrs-btn')
  if (!sidemem) {return}
  sidemem.addEventListener('click', () => {
    showMembers()
    removeSelectedClass()
    sidemem.classList.add('setup-sidebar-btn-selected')
    sideBarSelection.name = 'members'
  })
  document.addEventListener('mbr-saved', async (event) => {
    if (event instanceof CustomEvent) {
      await showMembers()
    }
  })

  // Meeting groups button
  const sidegp = document.getElementById('setup-sidebar-groups-btn');
  if (!sidegp) {return}
  sidegp.addEventListener('click', () => {
    showGroups()
    removeSelectedClass()
    sidegp.classList.add('setup-sidebar-btn-selected')
    sideBarSelection.name = 'groups'
  })
  document.addEventListener('grp-saved', async (event) => {
    if (event instanceof CustomEvent) {
      await showGroups()
    }
  })

  // Events button
  const sideevt = document.getElementById('setup-sidebar-events-btn');
  if (!sideevt) {return}
  sideevt.addEventListener('click', () => {
    showEvents()
    removeSelectedClass()
    sideevt.classList.add('setup-sidebar-btn-selected')
    sideBarSelection.name = 'events'
  })
  document.addEventListener('evt-saved', async (event) => {
    if (event instanceof CustomEvent) {
      await showEvents()
    }
  })
}

//
// Handlers for button events
//

const showEntities = async () => {
  const mas = document.getElementById('setup-master') as HTMLElement
  const head = document.getElementById('setup-topbar-heading') as HTMLElement
  const detail = document.getElementById('setup-detail') as HTMLElement
  mas.innerHTML = displayEntities
  head.innerHTML = 'Entities'
  detail.innerHTML = displaySelectedEntity
  setupEntityDetailListeners()
  await loadEntities()
}

const showMembers = async () => {
  const mast = document.getElementById('setup-master') as HTMLElement
  mast.innerHTML = displayMembers
  const head = document.getElementById('setup-topbar-heading') as HTMLElement
  head.innerHTML = 'Members'
  setupMemberDetailListeners()
  await loadEntitiesDropdownForMembers()
  setupDropdownListeners()
  await loadMembers()
  const det = document.getElementById('setup-detail') as HTMLElement
  det.innerHTML = displaySelectedMember
}

const showGroups = async () => {
  const mast = document.getElementById('setup-master') as HTMLElement
  mast.innerHTML = displayGroups
  const head = document.getElementById('setup-topbar-heading') as HTMLElement
  head.innerHTML = 'Meeting groups'
  setupGroupDetailListeners()
  await loadEntitiesDropdownForGroups()
  setupGroupsEntitiesDropdownListeners()
  await loadGroups()
  const det = document.getElementById('setup-detail') as HTMLElement
  det.innerHTML = displaySelectedGroup
}

const showEvents = async () => {
  const mast = document.getElementById('setup-master') as HTMLElement
  mast.innerHTML = displayEvents
  const head = document.getElementById('setup-topbar-heading') as HTMLElement
  head.innerHTML = 'Events'
  // setupGroupDetailListeners()
  await loadEntitiesDropdownForEvents()
  await loadGroupsDropdownForEvents()
  // setupEventsEntitiesDropdownListeners()
  await loadEvents()
  // const det = document.getElementById('setup-detail') as HTMLElement
  // det.innerHTML = displaySelectedEvent
}


// Helpers

const removeSelectedClass = () => {
  const sideBarButtons = document.getElementsByClassName('setup-sidebar-btn') 
  for (let i = 0; i < sideBarButtons.length; ++i) {
    sideBarButtons[i].classList.remove('setup-sidebar-btn-selected')
  }
}

const moveSheet = () => {
  const ed = document.getElementById('editing-sheet') as HTMLElement
  ed.style.left = (ed.style.left == '100%' || ed.style.left == '') ? '405px' : '100%'
  if (ed.style.left == '100%') {enableButtons()}
}

const enableButtons = () => {
  const addBtn = document.getElementById('setup-topbar-add') as HTMLButtonElement
  addBtn.disabled = false
  const trashBtn = document.getElementById('setup-topbar-trash') as HTMLButtonElement
  trashBtn.disabled = false
  const editBtn = document.getElementById('setup-topbar-edit') as HTMLButtonElement
  editBtn.disabled = false
}


export {
  setupView,
  setupEditItemListeners,
  setupSidebarListeners,
  showEntities,
  enableButtons
}
