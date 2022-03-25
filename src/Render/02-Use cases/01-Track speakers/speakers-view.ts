import { 
  populateEntityDropdown, 
  populateGroupDropdown, 
  populateContextMenu,
  entityChanged,
  updateWaitingTableAfterDragging,
  updateListMember,
  resetTables,
  handleMovingMember,
  getTimeForMember 
} from './speakers-presenter.js'
import {infoText} from './info.js'
import {setCurrentEntGroupId} from '../../01-Models/models.js'

let totalSeconds = 0
let timer: number
let isTimerOn = false
let isPaused = false
let isSetupSheetExpanded = false
let isDragging = false
let draggedRow: HTMLTableRowElement
let isClockVisible = false

/** The html for the main speaker tracker page. */
const speaker_tracker = `
<!--  Clock display and controls -->
<div id="top-bar-container">
  <div id="display-area">
    <div>
      <p id="committee-name"></p>
    </div>
    <div id="clock-display" >
      00:00
    </div>
  </div>
  <div id="controls">
    <button id="btn-play">
      <span class="icon-play">a</span>
    </button>
    <button id="btn-pause" disabled>
      <span class="icon-pause">c</span>
    </button>
    <button id="btn-stop" disabled>
      <span class="icon-stop">b</span>
    </button>
  </div>
</div>

<!-- Three tables and right side-bar -->
<div id="bottom-container">

  <!--  Three tables enclosed in divs -->
  <div id="tables-container-all">
    <!-- Remaining table -->
    <div class="table-container">
      <div class='div-header'>REMAINING</div>
      <div class="div-table">
        <table id="Table0">
          <tbody id="Table0Content">
          </tbody>
        </table>
      </div>
    </div>
    <!-- Waiting table -->
    <div class="table-container">
      <div class='div-header-waiting'>
        <div class='spacer'></div>
        <div>WAITING TO SPEAK</div>
        <div id='icon-menu'>h</div>
      </div>
      <div class="div-table">
        <table id="Table1">
          <tbody id="Table1Content">
          </tbody>
        </table>
      </div>
    </div>
    <!-- Speaking table -->
    <div class="table-container">
      <div class='div-header'>SPOKEN / SPEAKING</div>
      <div class='div-table'>
        <table id="Table2">
          <tr><td><div class='spacer'></div></td></tr>
        </table>
        <div id='context-menu' tabindex='-1'></div>
      </div>
    </div>

    <!-- Large clock -->
    <div id='large-clock-display'>00:00</div>

  </div>
  <!-- Right side-bar  -->
  <div id='right-sidebar'>
    <button id='sidebar-clock-btn'></button>
    <button id='sidebar-reset-btn'><span>Reset</span></button>
    <button id='sidebar-meeting-setup-btn'><span>Meeting setup</span></button>
    <button id='sidebar-info-btn'><span>d</span></button>
  </div>

</div>
<!-- Meeting setup slide-out sheet -->
<div id='mtgsetup-sheet'></div>

`

/** The html for the slide-out meeting setup sheet. */  
const setupMeetingSheet = `
  <div id='mtgsetup-container'>
    <div id='mtgsetup-heading'><h2>Meeting setup</h2></div>
    <div id='mtgsetup-done'><button id='mtgsetup-done-btn'>Done</button></div>
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
`

/** 
 * Loads the meeting setup html into the DOM and adds a listener for 
 * the `change` event to the HTMLSelectElement. 
 */
const loadSetupMeetingSheet = () => {
  const mtgsht = document.getElementById('mtgsetup-sheet')
  if (mtgsht) {mtgsht.innerHTML = setupMeetingSheet}
  const el = document.getElementById('mtgsetup-select-entity') as HTMLSelectElement
  if (el) {  
    el.addEventListener('change', handleChangedSelection)
  }
}

//
// Listeners
//

/** 
 * Add `click` event listeners to all arrow buttons (for moving speakers between tables). 
 */
const setupArrowButtonListeners =  () => {
  const buttnsR = document.querySelectorAll('.arrow-button-r')
  buttnsR.forEach(el => el.addEventListener('click', handleRightArrowClick ))

  const buttnsL = document.querySelectorAll('.arrow-button-l')
  buttnsL.forEach(el => el.addEventListener('click', handleLeftArrowClick ))
}

const setupWaitingTableMenuListener = () => {
  const menBtn = document.getElementById('icon-menu') as HTMLButtonElement
  menBtn.addEventListener('click', handleMenuClick)
}

/** 
 * Add `click` event listeners to all table cells in speaking table.
 * For popping up a context menu.
 */
const setupSpeakingTableMemberListeners = () => {
  const memberCells = document.querySelectorAll('.spkg-table-cell-text')
  memberCells.forEach(el => el.addEventListener('click', handleSpeakingTableMemberClick))
}

/**
 * Add `section-change` event listener to root document.
 * The `section-change` event is emitted when either of the following
 * is clicked in a context menu:
 * * amendment button
 * * final speaker button
 */
const setupSpeakingTableSectionChangeListener = () => {
  document.addEventListener('section-change', handleSpeakingTableSectionChange)
}

/**
 * Add `click` event listeners for meeting setup buttons:
 * * meeting setup button in right side-bar
 * * done button in meeting setup slide-out sheet.
 */
const setupMeetingSetupListeners = () => {
  const meetingSetupBtn = document.getElementById('sidebar-meeting-setup-btn')
  if (!meetingSetupBtn) {return}
  meetingSetupBtn.addEventListener('click', handleMeetingSetupButtonClick)

  const doneBtn = document.getElementById('mtgsetup-done-btn')
  if (!doneBtn) {return}
  doneBtn.addEventListener('click', handleMeetingSetupDoneButtonClick)
}

const setupClockExpandListener = () => {
  const exp = document.getElementById('sidebar-clock-btn')
  exp?.addEventListener('click', handleClockExpand)
}


/** 
 * Add `click` event listener for reset button in right side-bar.
 */
const setupResetListener = () => {
  const rst = document.getElementById('sidebar-reset-btn')
  if (!rst) {return}
  rst.addEventListener('click', handleResetButtonClick)
}

/** 
 * Add `click` event listener for info button in right side-bar.
 */
const setupInfoListener = () => {
  const info = document.getElementById('sidebar-info-btn') 
  info?.addEventListener('click', handleInfoButtonClick)
}

/**
 * Add `click` event listeners to large timer buttons.
 */
const setupTimerControlListeners = () => {
  const playbtn = document.getElementById('btn-play') as HTMLElement
  playbtn.addEventListener('click', handlePlayClicked)
  
  const pausebtn = document.getElementById('btn-pause') as HTMLElement
  pausebtn.addEventListener('click', handlePauseClicked)
  
  const stopbtn = document.getElementById('btn-stop') as HTMLElement
  stopbtn.addEventListener('click', handleStopClicked)
  
  // If setting up speakers-view coming back from setup,
  // restore the timer display.  Calling myTimer() increases
  // totalSeconds so reduce first.
  if (totalSeconds > 1) {
    totalSeconds -= 1
    myTimer()
  } 
}

/**
 * Add `click` event listeners to all timer buttons in the
 * speaking table.
 */
const setupSpeakingTableTimerListeners = () => {
  const playbtns = document.querySelectorAll('.spkg-table-cell-timer-play')
  playbtns.forEach(el => el.addEventListener('click', handlePlayClicked))
  const play2btns = document.querySelectorAll('.spkg-table-cell-timer-play2')
  play2btns.forEach(el => el.addEventListener('click', handlePlayClicked))
  const stopbtns = document.querySelectorAll('.spkg-table-cell-timer-stop')
  stopbtns.forEach(el => el.addEventListener('click', handleStopClicked))
  const pausebtns = document.querySelectorAll('.spkg-table-cell-timer-pause')
  pausebtns.forEach(el => el.addEventListener('click', handlePauseClicked))
}

//
// Handlers
//

async function handleMenuClick() {
  const waitingRows = document.querySelectorAll('.waiting-row')
  if (!isDragging) {
    isDragging = true
    waitingRows.forEach(el => {
      el.setAttribute("draggable", "true")
      el.addEventListener('dragstart', handleDragStart)
      el.addEventListener('dragover', handleDragOver)
      el.addEventListener('drop', handleDrop)
    })
  }
  else {
    isDragging = false
    const indexArray: number[] = []
    waitingRows.forEach(el => {
      el.removeAttribute('draggable')
      el.removeEventListener('dragstart', handleDragStart)
      el.removeEventListener('dragover', handleDragOver)
      const oldIdx = el.id.slice(4,6)
      indexArray.push(parseInt(oldIdx))
    })
    console.log('indexArray: ', indexArray)
    await updateWaitingTableAfterDragging(indexArray)
    setupArrowButtonListeners()
    setupSpeakingTableMemberListeners()
    setupSpeakingTableTimerListeners()
  }

}

function handleDragStart(ev: Event) {
  draggedRow = (ev.target as HTMLTableRowElement)
  console.log("dragstart: row: ", draggedRow)
}

function handleDragOver(ev: Event) {
  ev.preventDefault()
  console.log("dragover")
  const evTarget = ev.target
  if (evTarget instanceof HTMLElement) {
    // Need to get an array of all rows and check index position of row of event 
    // target in the array.  Create array by getting the children of <tbody>. 
    // The event target might be a <span> or <td> element depending on the dragging point.
    // Check if event target is a <td>.
    let bdy = evTarget.parentElement?.parentElement
    let rw = evTarget.parentElement
    if (!bdy || !rw) {return}
    if (bdy.id != 'Table1Content') {
      // Event target must be <span>
      bdy = bdy?.parentElement
      rw = rw?.parentElement
    }
    if (!bdy || !rw) {return}
    if (bdy.id != 'Table1Content') {return}
    // bdy must be <tbody>
    const tableRowArray = Array.from(bdy.children) as HTMLTableRowElement[]
    const indexDraggedRw = tableRowArray.indexOf(draggedRow)
    const indexDragoverRw = tableRowArray.indexOf(rw as HTMLTableRowElement)
    if(indexDragoverRw>indexDraggedRw)
      (rw).after(draggedRow)
    else
      (rw).before(draggedRow)
  } 
}

function handleDrop(this: HTMLElement, ev: Event) {
  ev.preventDefault()
  console.log("drop: ",this)
}

/**
 * Called when different entity is selected in meeting setup, emitting a `change` event.
 * Passes the index to `entityChanged` function in `speakers-presenter.js`.
 */
async function handleChangedSelection(this: HTMLSelectElement) {
  await entityChanged(this.selectedIndex)
}

async function handleRightArrowClick(this: HTMLElement) {
  const targt = this as HTMLButtonElement
  if (!targt) { return }
  const id = targt.getAttribute('id')
  if (!id) {return}
  const tableStrg = id.charAt(1)
  const tableNumber = parseInt(tableStrg)
  const rowStrg = id.slice(4,6)
  const rowNumber = parseInt(rowStrg)
  await handleMovingMember(tableNumber, rowNumber, tableNumber + 1)
  setupArrowButtonListeners()
  setupSpeakingTableMemberListeners()
  if (tableNumber == 1) { setupSpeakingTableTimerListeners() }
}

async function handleLeftArrowClick(this: HTMLElement) {
  const targt = this as HTMLButtonElement
  const id = targt.getAttribute('id')
  if (!id) { return }
  const tableStrg = id.charAt(1)
  const tableNumber = parseInt(tableStrg)
  const rowStrg = id.slice(4,6)
  const rowNumber = parseInt(rowStrg)
  let sectionNumber = 0
  if (id.length > 6) {
    sectionNumber = parseInt(id.slice(8,9))
  }
  await handleMovingMember(tableNumber, rowNumber, tableNumber - 1, sectionNumber)
  setupArrowButtonListeners()
  setupSpeakingTableMemberListeners()
}

function handleSpeakingTableMemberClick(this: HTMLElement, ev: Event) {
  const contextMenu = document.getElementById('context-menu')
  if (!contextMenu) {return}
  if (ev instanceof PointerEvent) {
    contextMenu.style.top = (ev.y + 5).toString() + "px"
  }
  contextMenu.style.display = contextMenu.style.display == 'block' ? contextMenu.style.display = 'none' : contextMenu.style.display = 'block'
  const secNumStrg = this.getAttribute('id')?.slice(8,9)
  const rowNumStrg = this.getAttribute('id')?.slice(5,6)
  contextMenu.focus()
  contextMenu.addEventListener('focusout', handleContextMenuBlur)
  if (secNumStrg != undefined && rowNumStrg != undefined) {
    populateContextMenu(parseInt(secNumStrg),parseInt(rowNumStrg))
  }
}

function handleSpeakingTableSectionChange(this: HTMLElement) {
  setupArrowButtonListeners()
  setupSpeakingTableMemberListeners()
  // setupSpeakingTableSectionChangeListener()
  const contextMenu = document.getElementById('context-menu')
  if (!contextMenu) {return}
  contextMenu.style.display = contextMenu.style.display == 'block' ? contextMenu.style.display = 'none' : contextMenu.style.display = 'block'
}

async function handleMeetingSetupButtonClick(this: HTMLElement) {
  const mtg = document.getElementById('mtgsetup-sheet')
  if (!mtg) {return}
  mtg.style.left = isSetupSheetExpanded ? '-300px' : '0px'
  if (!isSetupSheetExpanded) { 
    await populateEntityDropdown() 
    await populateGroupDropdown() 
  }
  isSetupSheetExpanded = !isSetupSheetExpanded
}

async function handleMeetingSetupDoneButtonClick(this: HTMLElement) {
  const elEntSelect = document.getElementById('mtgsetup-select-entity') as HTMLSelectElement
  const entIdx = elEntSelect.selectedIndex
  const elGrpSelect = document.getElementById('mtgsetup-select-group') as HTMLSelectElement
  const grpIdx = elGrpSelect.selectedIndex
  const mtgSht = document.getElementById('mtgsetup-sheet')
  if (!mtgSht) {return}
  mtgSht.style.left = isSetupSheetExpanded ? '-300px' : '0px'
  if (!isSetupSheetExpanded) { populateEntityDropdown() }
  isSetupSheetExpanded = !isSetupSheetExpanded
  await setCurrentEntGroupId(entIdx,grpIdx)
  await resetTables()
  setupArrowButtonListeners()
  setupMeetingSetupListeners()
  setupResetListener()
  setupSpeakingTableSectionChangeListener()
}

async function handleResetButtonClick(this: HTMLElement) {
  await resetTables()
  setupArrowButtonListeners()
  setupMeetingSetupListeners()
  setupSpeakingTableSectionChangeListener()
  const clk = document.getElementById('clock-display')
  if (!clk) {return} 
  clk.innerHTML = '00:00' 
}

function handleInfoButtonClick() {
  const childWindow = window.open('', 'modal')
  if (childWindow) {
    childWindow.document.write(infoText)
  }
}

/**
 * Handles the play button click event. 
 * 
 * For a play button on a speaking table cell:
 * * inserts the id: `'timer-active-cell'`
 * * calls `updateListMember` function of speakers-presenter.js.
 * 
 * Then calls `startTimer()`.
 * @param this The play button.
 */
async function handlePlayClicked(this: HTMLElement, ev: Event): Promise<void> {
  if (this.className == 'spkg-table-cell-timer-play') {
    // Timer starts at zero
    totalSeconds = 0
    // Remove any existing `timer-active-cell` ids
    const tacs = document.querySelectorAll('#timer-active-cell')
    for (const cell of tacs) {
      cell.removeAttribute('#timer-active-cell')
    }
    // Get the cell span element that displays the timer and add the attribute id `timer-active-cell`
    const tmr = this.previousSibling as HTMLElement
    tmr.id = 'timer-active-cell'
    // Update list member details
    // id of row is like t2-r01-s0-r
    const parnt = this.parentNode as HTMLElement
    const rowDetails = parnt.id
    const section = rowDetails.slice(8,9)
    const row = rowDetails.slice(4,6)
    const target = ev.target as HTMLElement
    await  updateListMember(parseInt(section), parseInt(row), target.className)
    setupArrowButtonListeners()
    setupSpeakingTableMemberListeners()
    setupSpeakingTableTimerListeners()
    // setupSpeakingTableSectionChangeListener()
  }
  if (this.className == 'spkg-table-cell-timer-play2') {
     // Remove any existing `timer-active-cell` ids
     const tacs = document.querySelectorAll('#timer-active-cell')
     for (const cell of tacs) {
       cell.removeAttribute('#timer-active-cell')
     }
    // Get the cell span element that displays the timer and add the attribute id `timer-active-cell`
    const tmr = this.nextSibling as HTMLElement
    tmr.id = 'timer-active-cell'
    // Update list member details
    // id of row is like t2-r01-s0-r
    const parnt = this.parentNode as HTMLElement
    const rowDetails = parnt.id
    const section = rowDetails.slice(8,9)
    const row = rowDetails.slice(4,6)
    // Timer starts at where it paused - retrieve speaking time for member
    const secs = getTimeForMember(parseInt(section), parseInt(row))
    console.log("secs: ", secs)
    totalSeconds = secs
    isPaused = true
    // Update list member
    const target = ev.target as HTMLElement
    await  updateListMember(parseInt(section), parseInt(row), target.className)
    setupArrowButtonListeners()
    setupSpeakingTableMemberListeners()
    setupSpeakingTableTimerListeners()
  }
  if (this.id == 'btn-play') {
    const btn = this as HTMLButtonElement
    btn.disabled = true
    const pauseBtn = document.getElementById('btn-pause') as HTMLButtonElement
    pauseBtn.disabled = false
    const stopBtn = document.getElementById('btn-stop') as HTMLButtonElement
    stopBtn.disabled = false
  }
  startTimer()
}


/**
 * Handles the stop button click event. 
 * 
 * For a stop button on a speaking table cell:
 * * removes the id: `'timer-active-cell'`
 * * calls `updateListMember` function of speakers-presenter.js.
 * 
 * Then calls `stopTimer()`.
 * @param this The stop button.
 */
async function handleStopClicked(this: HTMLElement, ev: Event) {
  if (this.className == 'spkg-table-cell-timer-stop') {
    // Remove any existing `timer-active-cell` ids
    const tacs = document.querySelectorAll('#timer-active-cell')
    for (const cell of tacs) {
      cell.removeAttribute('#timer-active-cell')
    }
    // Update list member details
    const parnt = this.parentNode as HTMLElement
    // id of row is like t2-r01-s0-r
    const rowDetails = parnt.id
    const section = rowDetails.slice(8,9)
    const row = rowDetails.slice(4,6)
    const target = ev.target as HTMLElement
    await  updateListMember(parseInt(section), parseInt(row), target.className, totalSeconds)
    setupArrowButtonListeners()
    setupSpeakingTableMemberListeners()
    setupSpeakingTableTimerListeners()
  }
  if (this.id == 'btn-stop') {
    const stopBtn = this as HTMLButtonElement
    stopBtn.disabled = true
    const pauseBtn = document.getElementById('btn-pause') as HTMLButtonElement
    pauseBtn.disabled = true
    const playBtn = document.getElementById('btn-play') as HTMLButtonElement
    playBtn.disabled = false
  }
  stopTimer()
}

async function handlePauseClicked(this: HTMLElement, ev: Event) {
  if (this.className == 'spkg-table-cell-timer-pause') {
    // Remove any existing `timer-active-cell` ids
    const tacs = document.querySelectorAll('#timer-active-cell')
    for (const cell of tacs) {
      cell.removeAttribute('#timer-active-cell')
    }
    // Update list member details
    // id of row is like t2-r01-s0-r
    const parnt = this.parentNode as HTMLElement
    const rowDetails = parnt.id
    const section = rowDetails.slice(8,9)
    const row = rowDetails.slice(4,6)
    const target = ev.target as HTMLElement
    await  updateListMember(parseInt(section), parseInt(row), target.className, totalSeconds)
    setupArrowButtonListeners()
    setupSpeakingTableMemberListeners()
    setupSpeakingTableTimerListeners()
  }
  if (this.id == 'btn-pause') {
    const pauseBtn = this as HTMLButtonElement
    pauseBtn.disabled = true
    const playBtn = document.getElementById('btn-play') as HTMLButtonElement
    playBtn.disabled = false
    const stopBtn = document.getElementById('btn-stop') as HTMLButtonElement
    stopBtn.disabled = false
  }
  stopTimer()
  isPaused = true
}

// function handleSpkgTableTimerEvent(this: Element, ev: Event) {
//   if (ev instanceof CustomEvent) {
//     if (this.parentNode && this instanceof HTMLElement) {
//       const tmr = this.parentNode.querySelector('.spkg-table-cell-timer') 
//       if ( tmr && tmr instanceof HTMLElement){
//         tmr.innerText = ev.detail.t
//       }
//     }
//   }
// }

function handleContextMenuBlur (this: HTMLElement, ev: Event) {
  if ( ev && ev instanceof FocusEvent && ev.relatedTarget) {
    if (ev.relatedTarget instanceof Element) {
      if (ev.relatedTarget.id == 'cm-amend' || ev.relatedTarget.id == 'cm-final') {
        return
      }
    } 
  }
  this.style.display = 'none'
}

function handleClockExpand(this: HTMLElement) {
  const clk = document.getElementById('large-clock-display') as HTMLElement
  if (isClockVisible == false) {
    clk.style.visibility = 'visible'
    this.style.backgroundImage = 'url("./images/shrink.png")'
  }
  else {
    clk.style.visibility = 'hidden'
    this.style.backgroundImage = 'url("./images/expand.png")'
  }
  isClockVisible = isClockVisible == false ? true : false
}

// Timer functions
function startTimer () {
  // Don't start another timer if one is running
  if (isTimerOn == true) {return}
  if (isPaused == false) {
    totalSeconds = 0
  }
  else {
    isPaused = false
  }
  
  timer = setInterval(myTimer as TimerHandler, 1000)
  console.log("timer: ",timer)
  isTimerOn = true
}

function stopTimer () {
  clearInterval(timer)
  isTimerOn = false
  isPaused = false
}

function myTimer () {
  ++totalSeconds
  let minuteStrg = ''
  let secondStrg = ''
  const minute = Math.floor((totalSeconds) / 60)
  const seconds = totalSeconds - (minute * 60)
  if (minute < 10) { minuteStrg = '0' + minute.toString() } else { minuteStrg = minute.toString()}
  if (seconds < 10) { secondStrg = '0' + seconds.toString() } else { secondStrg = seconds.toString()}
  const clk = document.getElementById('clock-display')
  if (!clk) {return} 
  clk.innerHTML = minuteStrg + ':' + secondStrg
  const largeClk = document.getElementById('large-clock-display')
  if (!largeClk) {return}
  largeClk.innerHTML = minuteStrg + ':' + secondStrg
  const ac = document.getElementById('timer-active-cell') 
  if (!ac) {return}
  ac.innerText = minuteStrg + ':' + secondStrg
}

export { 
  speaker_tracker, 
  loadSetupMeetingSheet,
  setupArrowButtonListeners, 
  setupTimerControlListeners, 
  setupMeetingSetupListeners,
  setupResetListener,
  setupInfoListener,
  setupClockExpandListener,
  setupSpeakingTableSectionChangeListener,
  setupWaitingTableMenuListener 
}
