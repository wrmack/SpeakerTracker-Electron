import { 
  meetingIsBeingRecorded, 
  setMeetingIsBeingRecorded,
  isSetupSheetExpanded,
  setIsSetupSheetExpanded 
} from "../../03-State/state.js"

import { 
  setTimerDisplay
} from "./speakers-presenter.js"

import {
  populateEntityDropdown, 
  populateGroupDropdown, 
  populateEventsDropdown,
  updateDataForNewMeeting,
  entityChanged,
  eventDateChanged
} from "../01-Track speakers/meetingsetup-presenter.js"

import { resetAfterMeetingSetupDoneClicked } from "./speakers-view.js"

/** The html for the slide-out meeting setup sheet. */  
const setupMeetingSheet = `
  <div id='mtgsetup-container'>
    <div id='mtgsetup-heading'><h2>Meeting setup</h2></div>
    <div id='mtgsetup-info-done'>
      <button id='mtgsetup-info-btn' class='info-btn'>d</button>
      <button id='mtgsetup-done-btn'>Done</button>
    </div>
  
    <div id='mtgsetup-entity'>
      <div id='mtgsetup-entity-dropdown-container'>
      <label for="mtgsetup-select-entity">Choose an entity:</label>
      <select name="mtgsetup-select-entity" class="mtgsetup-select" id="mtgsetup-select-entity"></select>
    </div>
    </div>
    <div id='mtgsetup-group'>
      <div id='mtgsetup-group-dropdown-container'>
        <label for="mtgsetup-select-group">Choose a meeting group:</label>
        <select name="mtgsetup-select-group" class="mtgsetup-select" id="mtgsetup-select-group"></select>
      </div>
    </div>
    <div id='mtgsetup-info-timer'>
      <button id='mtgsetup-info-timer-btn' class='info-btn'>d</button>
    </div>
    <div id='mtgsetup-timer' class='switch_container'>
      <p class='switch_text'>Show individual member times</p>
      <label class="switch">
        <input type="checkbox" id="timer_type">
        <span class="slider"></span>
      </label>
    </div>
    <div id='mtgsetup-info-record'>
      <button id='mtgsetup-info-record-btn' class='info-btn'>d</button>
    </div>
    <div id='mtgsetup-record' class='switch_container'>
      <p class='switch_text'>Create a record of speaking times for this meeting</p>
      <label class="switch">
        <input type="checkbox" id="create_record" disabled >
        <span class="slider"></span>
      </label>
    </div>
    <div id='mtgsetup-event'>
      <div id='mtgsetup-event-dropdown-container'>
        <label for="mtgsetup-select-event">Choose a meeting event:</label>
        <select name="mtgsetup-select-event" class="mtgsetup-select" id="mtgsetup-select-event"></select>
      </div>
    </div>
  </div>
`
/** Html for meeting setup sheet info */
const mtgSetupInfo = `
  <div id='mtgSetUpInfoContainer' class='info-container'>
    <p>
    Display the members of a meeting group \
    by selecting the entity and the meeting group.
    </p>
    <p>
    To create an entity, its members and \
    its meeting groups, go to the 'Setup' tab.
    </p>
  </div>
`
/** Html for meeting setup sheet timer-type info */
const mtgSetupInfoTimer = `
  <div id='mtgSetUpTimerInfoContainer' class='info-container'>
    <p>
    After setting an Entity and Meeting group, \
    turn on 'Show individual member times' to \
    display each member's time alongside the member's \
    name.
    </p>
    <p>
    Use the Play, Pause and Stop controls alongside \
    the member's name to control the member's speaking time.
    </p>
  </div>
`
/** Html for meeting setup sheet recording info */
const mtgSetupInfoRecord = `
  <div id='mtgSetUpRecordInfoContainer' class='info-container'>
    <p>
    'Create a record of speaking times for this meeting' \
    saves speaking times to the chosen meeting event \
    (meeting events are created separately in Setup).
    </p>
    <p>
    The Entity and Meeting group must have been selected \
    and 'Show individual member times' must be turned on .
    </p>
    <p>
    Press 'Save debate' to save the current debate and \
    create a new one.
    </p>
    <p>
    Press 'End this meeting' to complete the report \
    and reset.
    </p>
    <p>
    View the report in 'Reports'.
    </p>
    <p>
    To create a meeting event, go to the Setup tab then select Events.
    </p>
  </div>
`

/** 
 * Loads the meeting setup html into the DOM. Adds listeners for 
 * the `change` event to the entity selector, show individual times toggle and create a record toggle. 
 */
const loadSetupMeetingSheet = async () => {
  const mtgsht = document.getElementById('mtgsetup-sheet')
  if (!mtgsht) {return}
  mtgsht.innerHTML = setupMeetingSheet
  mtgsht.style.left = isSetupSheetExpanded ? '0px' : '-300px'
  if (isSetupSheetExpanded) { 
    const entOptions = await populateEntityDropdown() 
    const grpOptions = await populateGroupDropdown() 
    const evtOptions = await populateEventsDropdown()

    const ent = document.getElementById('mtgsetup-select-entity')
    if (ent) { ent.innerHTML = entOptions} 
    const grp = document.getElementById('mtgsetup-select-group')
    if (grp) {grp.innerHTML = grpOptions}
    const evt = document.getElementById('mtgsetup-select-event')
    if (evt) {evt.innerHTML = evtOptions}
  }
  
  // Info button and info display
  const mtgshtInfoBtn = document.getElementById('mtgsetup-info-btn') as HTMLButtonElement
  if (mtgshtInfoBtn) {
    mtgshtInfoBtn.addEventListener('click', handleMtgshtInfoBtnClick)
    mtgshtInfoBtn.addEventListener('blur', handleMtgshtInfoBtnBlur)
  }
  const mtgshtInfo = document.getElementById('mtgsetup-info-display')
  if (mtgshtInfo) {
    mtgshtInfo.innerHTML = mtgSetupInfo 
  }
  
  // Info button and info display for setting individual timer 
  const mtgshtInfoTimerBtn = document.getElementById('mtgsetup-info-timer-btn') as HTMLButtonElement
  if (mtgshtInfoTimerBtn) {
    mtgshtInfoTimerBtn.addEventListener('click', handleMtgshtInfoTimerBtnClick)
    mtgshtInfoTimerBtn.addEventListener('blur', handleMtgshtInfoTimerBtnBlur)
  }
  const mtgshtTimerInfo = document.getElementById('mtgsetup-info-timer-display')
  if (mtgshtTimerInfo) {
    mtgshtTimerInfo.innerHTML = mtgSetupInfoTimer 
  }

  // Info button and info display for setting "record on" 
  const mtgshtInfoRecordBtn = document.getElementById('mtgsetup-info-record-btn') as HTMLButtonElement
  if (mtgshtInfoRecordBtn) {
    mtgshtInfoRecordBtn.addEventListener('click', handleMtgshtInfoRecordBtnClick)
    mtgshtInfoRecordBtn.addEventListener('blur', handleMtgshtInfoRecordBtnBlur)
  }
  const mtgshtRecordInfo = document.getElementById('mtgsetup-info-record-display')
  if (mtgshtRecordInfo) {
    mtgshtRecordInfo.innerHTML = mtgSetupInfoRecord 
  }
  
  // Select entity - event listener
  const ent = document.getElementById('mtgsetup-select-entity') as HTMLSelectElement
  if (ent) {  
    ent.addEventListener('change', handleChangedEntitySelection)
  }
 
  // Set individual timer switch - event listener
  const timer = document.getElementById('timer_type') as HTMLInputElement
  if (timer) {  
    timer.addEventListener('change', handleChangedTimerType)
  }

  // Record event switch - event listener
  const record = document.getElementById('create_record') as HTMLInputElement
  if (record) {
    record.addEventListener('change', handleChangedRecordEvent)
  }

  // Choose event - event listener
  const eventDate = document.getElementById('mtgsetup-select-event') as HTMLSelectElement
  if (eventDate) {
    eventDate.addEventListener('change', handleChangedEventDate)
  }

  // Done button listener
  const doneBtn = document.getElementById('mtgsetup-done-btn')
  if (!doneBtn) {return}
  doneBtn.addEventListener('click', handleMeetingSetupDoneButtonClick)
}


// Meeting setup sheet handlers

async function handleMeetingSetupDoneButtonClick(this: HTMLElement) {
  const mtgSht = document.getElementById('mtgsetup-sheet')
  if (!mtgSht) {return}

  // Get selected options from dropdowns
  const elEntSelect = document.getElementById('mtgsetup-select-entity') as HTMLSelectElement
  const entIdx = elEntSelect.selectedIndex
  const elGrpSelect = document.getElementById('mtgsetup-select-group') as HTMLSelectElement
  const grpIdx = elGrpSelect.selectedIndex
  const elEvtSelect = document.getElementById('mtgsetup-select-event') as HTMLSelectElement
    
  // If there were no events set up
  if (elEvtSelect.options[0].disabled === true) {
    setMeetingIsBeingRecorded(false)
    const recordMeetingBtn = document.getElementById('create_record') as HTMLInputElement
    recordMeetingBtn.checked = false
    const event = document.getElementById('mtgsetup-event-dropdown-container') as HTMLDivElement
    event.style.visibility = 'hidden'
    const sidebarBtns = document.getElementsByClassName('sidebar-norm') as HTMLCollectionOf<HTMLButtonElement>
    for (let i = 0; i < sidebarBtns.length; i++) {
    sidebarBtns[i].style["display"] = "block"
    }
    const sidebarRecordBtns = document.getElementsByClassName('sidebar-recording') as HTMLCollectionOf<HTMLButtonElement>
    for (let i = 0; i < sidebarRecordBtns.length; i++) {
    sidebarRecordBtns[i].style["display"] = "none"
    }
    const sidebarRecordCircle = document.getElementById('sidebar-recordon-stop') as HTMLDivElement
    sidebarRecordCircle.style["display"] = "none"
  }

  let evtIdx = (meetingIsBeingRecorded) ? elEvtSelect.selectedIndex : null
  await updateDataForNewMeeting(entIdx,grpIdx,evtIdx,meetingIsBeingRecorded)
  await resetAfterMeetingSetupDoneClicked(evtIdx)

  mtgSht.style.left = isSetupSheetExpanded ? '-300px' : '0px'
  if (!isSetupSheetExpanded) { populateEntityDropdown() }
  setIsSetupSheetExpanded(!isSetupSheetExpanded)
}

function handleMtgshtInfoBtnClick(this: HTMLButtonElement) {
    const mtgshtInfo = document.getElementById('mtgsetup-info-display') as HTMLDivElement
    if (mtgshtInfo) {
        const vis = window.getComputedStyle(mtgshtInfo).visibility;  // Note that because next line starts with brackets it is necessary to use a semi-colon
        (vis == 'hidden') ? mtgshtInfo.style.visibility = 'visible' : mtgshtInfo.style.visibility = 'hidden'
    }
}

function handleMtgshtInfoBtnBlur() {
    const mtgshtInfo = document.getElementById('mtgsetup-info-display') as HTMLDivElement
    if (mtgshtInfo) {
        mtgshtInfo.style.visibility = 'hidden'
    }
}

function handleMtgshtInfoTimerBtnClick(this: HTMLButtonElement) {
    const mtgshtInfoTimer = document.getElementById('mtgsetup-info-timer-display') as HTMLDivElement
    if (mtgshtInfoTimer) {
        const vis = window.getComputedStyle(mtgshtInfoTimer).visibility;
        (vis == 'hidden') ? mtgshtInfoTimer.style.visibility = 'visible' : mtgshtInfoTimer.style.visibility = 'hidden'
    }
}

function handleMtgshtInfoTimerBtnBlur() {
    const mtgshtInfoTimer = document.getElementById('mtgsetup-info-timer-display') as HTMLDivElement
    if (mtgshtInfoTimer) {
        mtgshtInfoTimer.style.visibility = 'hidden'
    }
}

function handleMtgshtInfoRecordBtnClick(this: HTMLButtonElement) {
    const mtgshtInfoRecord = document.getElementById('mtgsetup-info-record-display') as HTMLDivElement
    if (mtgshtInfoRecord) {
        const vis = window.getComputedStyle(mtgshtInfoRecord).visibility;
        (vis == 'hidden') ? mtgshtInfoRecord.style.visibility = 'visible' : mtgshtInfoRecord.style.visibility = 'hidden'
    }
}

function handleMtgshtInfoRecordBtnBlur() {
    const mtgshtInfoRecord = document.getElementById('mtgsetup-info-record-display') as HTMLDivElement
    if (mtgshtInfoRecord) {
        mtgshtInfoRecord.style.visibility = 'hidden'
    }
}

  /**
 * Called when different entity is selected in meeting setup, emitting a `change` event.
 * Passes the index to `entityChanged` function in `meetingsetup-presenter.js`.
 */
async function handleChangedEntitySelection(this: HTMLSelectElement) {
    await entityChanged(this.selectedIndex)
    const grpOptions = await populateGroupDropdown() 
    const evtOptions = await populateEventsDropdown()
    const grp = document.getElementById('mtgsetup-select-group')
    if (grp) {grp.innerHTML = grpOptions}
    const evt = document.getElementById('mtgsetup-select-event')
    if (evt) {evt.innerHTML = evtOptions}
}
  
async function handleChangedTimerType(this: HTMLInputElement) {
    const rec = document.getElementById('create_record') as HTMLInputElement
    if (this.checked) {
        rec.disabled = false
        setTimerDisplay(true)
    }
    else {
        rec.disabled = true
        setTimerDisplay(false)
    }
}
  
async function handleChangedRecordEvent(this: HTMLInputElement) {
  const event = document.getElementById('mtgsetup-event-dropdown-container') as HTMLDivElement
  if (this.checked) {
      event.style.visibility = 'visible'
      setMeetingIsBeingRecorded(true)
      const sidebarBtns = document.getElementsByClassName('sidebar-norm') as HTMLCollectionOf<HTMLButtonElement>
      for (let i = 0; i < sidebarBtns.length; i++) {
      sidebarBtns[i].style["display"] = "none"
      }
      const sidebarRecordBtns = document.getElementsByClassName('sidebar-recording') as HTMLCollectionOf<HTMLButtonElement>
      for (let i = 0; i < sidebarRecordBtns.length; i++) {
      sidebarRecordBtns[i].style["display"] = "block"
      }
      const sidebarRecordCircle = document.getElementById('sidebar-recordon-stop') as HTMLDivElement
      sidebarRecordCircle.style["display"] = "flex"
  }
  else { event.style.visibility = 'hidden'
      setMeetingIsBeingRecorded(false)
      const sidebarBtns = document.getElementsByClassName('sidebar-norm') as HTMLCollectionOf<HTMLButtonElement>
      for (let i = 0; i < sidebarBtns.length; i++) {
      sidebarBtns[i].style["display"] = "block"
      }
      const sidebarRecordBtns = document.getElementsByClassName('sidebar-recording') as HTMLCollectionOf<HTMLButtonElement>
      for (let i = 0; i < sidebarRecordBtns.length; i++) {
      sidebarRecordBtns[i].style["display"] = "none"
      }
      const sidebarRecordCircle = document.getElementById('sidebar-recordon-stop') as HTMLDivElement
      sidebarRecordCircle.style["display"] = "none"
  }
}

async function handleChangedEventDate(this: HTMLSelectElement) {
    await eventDateChanged(this.selectedIndex)
}

export {
  loadSetupMeetingSheet
}