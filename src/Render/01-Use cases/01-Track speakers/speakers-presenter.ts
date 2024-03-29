import { 
  getEntities, 
  getEntityAtIdx,
  getGroupsForEntityId,
  getGroupForId,
  getMembersForGroupId, 
  getMemberWithId,
  getOpenEventsForCurrentGroup,
  addDebate,
  updateDebateNote,
  addDebateSection,
  addDebateSpeech,
  closeCurrentEvent,
  resetCurrentEvent,
  SectionType,
  TimerButtonMode,
  getOpenEventAtIdx
} from "../../02-Models/models.js"

import {
  getSavedEntGroupId,
  currentEntityId,
  setCurrentEntityId,
  currentGroupId,
  setCurrentGroupId,
  currentEventId,
  setCurrentEventId,
  showIndividualTimers,
  setShowIndividualTimers,
  meetingIsBeingRecorded,
  currentDebateNumber,
  setCurrentDebateNumber,
  setCurrentEntGroupEvtId,
  setMeetingIsBeingRecorded,
  currentDebateSectionNumber,
  setCurrentDebateSectionNumber,
  saveTableState,
  getTableState
} from "../../03-State/state.js"

import {
  ListMember,
  Member,
  SectionList
} from "../../../types/interfaces"

import { formatIsoDate, getTimeStringFromSeconds } from "../../04-Utils/utils.js"

let isInitialised = false

// First two tables are simply arrays of Members
// Speaking table is an array of SectionLists

let table0: Member[] = []
let table1: Member[] = []
let table2: SectionList[] = []

/**
 * A flag that is set in updateListMember when a member presses play and unset when pause or stop are clicked.
 * It is read in populateTables, and, if set, all other members play buttons are disabled.
 */
let aMemberIsSpeaking= false

async function resetTablesWithSavedData() {
  const tables = await getTableState()
  if (tables == null) {return}
  table0 = tables.table0
  table1 = tables.table1
  table2 = tables.table2
  isInitialised = true
}


/**
 * Populates the table model
 * - table0 is a Member array
 * - table1 is a Member array
 * - table2 is a SectionList array
 * 
 * @returns true if no entities are setup otherwise false
 */
async function populateTables () {
  // If no entities set up - return
  const ents = await getEntities()
  if (ents.length == 0) { 
    return true
  }

  // Get saved entity and group ids, if any.
  const savedEntGpId = await getSavedEntGroupId()
  if (savedEntGpId != undefined) {
    setCurrentEntityId(savedEntGpId.entId)
    setCurrentGroupId(savedEntGpId.grpId)
  } 
  const group = await getGroupForId(currentGroupId)
  let memberIds:any[] = []
  if (group != undefined) {
    memberIds = await getMembersForGroupId(currentGroupId)
    const groupName = group.GrpName
    const comm = document.getElementById('committee-name')
    if (comm) {
      comm.innerHTML = groupName
    }
  }

  // Initialise table model

  if (!isInitialised) {

    table0 = []
    table1 = []
    table2 = []

    // Initialise table0 with all members
    if (memberIds != undefined) {
      for (let i = 0; i < memberIds.length; ++i) {
        const memberReturned = await getMemberWithId(memberIds[i].MemberId)
        const member: Member = {id: memberReturned.Id, title: memberReturned.Title, firstName: memberReturned.FirstName, lastName: memberReturned.LastName}
        table0.push(member)
      }
    }
 

    // Initialise speaking table with empty section 
    const spkgList: SectionList = {
      sectionNumber: 0,
      sectionType: SectionType.mainDebate,
      sectionHeader: "Main debate",
      sectionMembers: [],
      isCollapsed: false
    }
    table2 = [spkgList]

    // Reset initialised flag
    isInitialised = true
  }

  // Populate DOM from table model

  // Remaining table

  table0.sort((a, b) => a.lastName.localeCompare(b.lastName))

  let tableRows0 = ''
  let idx = 0
  for (const mbr of table0) {
    const mbrStrg = `${mbr.firstName} ${mbr.lastName}`
    let row = idx.toString()
    if (idx < 10) {row = "0" + row} 
    const myId = `t0-r${row}`
    tableRows0 += `<tr>`
    tableRows0 += `<td><span class='cell-text' id='${myId}'>${mbrStrg}</span><button class='arrow-button-r' id='${myId}-r' >f</button> </td>`
    tableRows0 += '</tr>'
    ++idx
  }
  const tab0 = document.getElementById('Table0Content')
  if (tab0) {tab0.innerHTML = tableRows0}
  
  // Waiting table

  let tableRows1 = ''
  idx = 0

  for (const mbr of table1) {
    const mbrStrg = `${mbr.firstName} ${mbr.lastName}`
    let row = idx.toString()
    if (idx < 10) {row = "0" + row} 
    const myId = `t1-r${row}`
    tableRows1 += `<tr class='waiting-row' id='${myId}-tr'>`
    tableRows1 += `<td><button class='arrow-button-l' id='${myId}-l'>g</button><span class='cell-text' id='${myId}'>${mbrStrg}</span><button class='arrow-button-r' id='${myId}-r' >f</button> </td>`
    tableRows1 += '</tr>'
    ++idx
  }
  const tab1 = document.getElementById('Table1Content')
  if (tab1) {tab1.innerHTML = tableRows1}


  // Speaking table

  // Get table
  const tabl2 = document.getElementById('Table2')
  if (!tabl2) {return}
  
  // Remove all 'tbody's
  // Iterating over an array and removing array elements so be careful
  // Get initial length of array so know how many times to iterate
  // Recalculate element array in each iteration and remove first element
  if (tabl2) {
    const tbs = document.getElementsByClassName('spkg-table-tbody') 
    const tbsLength = tbs.length
    for (let i = 0; i < tbsLength; ++i) {
      const tbodyArray = document.getElementsByClassName('spkg-table-tbody')
      tbodyArray[0].parentNode?.removeChild(tbodyArray[0])
    }
  }

  // Create a 'tbody' for each section
  let sectionIdx = 0
  for (const section of table2) {
    let tableRows2 = ''
    // Heading Main debate or Amendment
    tableRows2 += `<tr class='spkg-table-row'>`
    if (section.sectionType == SectionType.amendment) {
      tableRows2 += `<th>
        <div class='spkg-table-row-header'>
        ${section.sectionHeader}
        `
        if (section.isCollapsed == true) {
          tableRows2 += `<div class='chevron' style='transform: rotate(-90deg);'>V</div>`
        }
        else {
          tableRows2 += `<div class='chevron'>V</div>`
        }
        tableRows2 += `
        </div>
          <hr class='spkg-table-cell-rule'>
        </th>`
    }
    else {
      tableRows2 += `<th>
        <div class='spkg-table-row-header'>
          ${section.sectionHeader}`
          if (meetingIsBeingRecorded && sectionIdx === 0) {
            tableRows2 += `<span id='note'><button id='note-button'>Note</button></span>`
          }
        tableRows2 +=
        `</div>
          <hr class='spkg-table-cell-rule'>
        </th>`
    }

    tableRows2 += '</tr>'

    // Iterate through members in this section
    const listMbrs = section.sectionMembers
    idx = 0
    
    for (const listMbr of listMbrs) {
      let spkgTime = listMbr.speakingTime
      if (spkgTime == undefined) {spkgTime = 0}
      const timeString = getTimeStringFromSeconds(spkgTime)
      const mbr = listMbr.member
      let row = idx.toString()
      if (idx < 10) {row = "0" + row} 
      const myId = `t2-r${row}-s${sectionIdx}`
      tableRows2 += `
      <tr class='spkg-table-row'> 
        <td>`
        if (section.isCollapsed === true) {
          tableRows2 += `<div class='spkg-table-cell-container' style='overflow: hidden; max-height: 0px;'> `
        }
        else {
          tableRows2 += `<div class='spkg-table-cell-container'> `
        }
      tableRows2 += `
          <div class='spkg-table-cell-container-top'>
            <div class='spkg-table-cell-comp-left'>`
              tableRows2 += `<button class='arrow-button-l' id='${myId}-l'>g</button>`
              tableRows2 += `<span class='spkg-table-cell-text' id='${myId}-n'>${mbr.firstName} ${mbr.lastName}</span>
            </div>
            <div class='spkg-table-cell-comp-right' id='${myId}-r'>`
              if(showIndividualTimers) {
                // Rendering is left to right, starting with the pause button

                // Render the pause button
                if (listMbr.timerButtonMode == TimerButtonMode.pause_stop) {
                  // Disabled if a member is speaking and it isn't the current member 
                  if (aMemberIsSpeaking && !listMbr.timerIsActive) {
                    tableRows2 += `<button class='spkg-table-cell-timer-pause' disabled>c</button>`
                  }
                  else {
                    tableRows2 += `<button class='spkg-table-cell-timer-pause'>c</button>`
                  }
                }
                // Render the left play button
                if (listMbr.timerButtonMode == TimerButtonMode.play_stop) {
                  if (aMemberIsSpeaking && !listMbr.timerIsActive) {
                    tableRows2 += `<button class='spkg-table-cell-timer-play2' disabled>a</button>`
                  }
                  else {
                    tableRows2 += `<button class='spkg-table-cell-timer-play2'>a</button>`
                  }
                }
                // Render the timestring and add id if this is the active cell
                if (listMbr.timerIsActive == true) {
                  tableRows2 += `<span class='spkg-table-cell-timer' id='timer-active-cell'>${timeString}</span>`
                } else {
                  tableRows2 += `<span class='spkg-table-cell-timer'>${timeString}</span>`
                }
                // Render the right play button     
                if (listMbr.timerButtonMode == TimerButtonMode.play) {
                  if (aMemberIsSpeaking && !listMbr.timerIsActive) {
                    tableRows2 += `<button class='spkg-table-cell-timer-play' disabled>a</button>`
                  }
                  else {
                    tableRows2 += `<button class='spkg-table-cell-timer-play'>a</button>`
                  }
                }
                // Render the stop button
                if (listMbr.timerButtonMode == TimerButtonMode.pause_stop || 
                  listMbr.timerButtonMode == TimerButtonMode.play_stop ) {
                    if (aMemberIsSpeaking && !listMbr.timerIsActive) {
                      tableRows2 += `<button class='spkg-table-cell-timer-stop' disabled>b</button>`
                    }
                    else {
                      tableRows2 += `<button class='spkg-table-cell-timer-stop'>b</button>`
                    }
                }
              }
              `
            </div>
          </div>
          <hr class='spkg-table-cell-rule'>
        </div>
        </td>
      </tr>
    `
      tableRows2 += '</tr>'
      ++idx
    }

    const tb = tabl2.appendChild(document.createElement('tbody'))
    if (tb) {
      tb.setAttribute("class","spkg-table-tbody")
      tb.setAttribute("id", `${sectionIdx}`)
      tb.innerHTML = tableRows2
    }
    // Event listener on Amendment header
    if (section.sectionType == SectionType.amendment) {
      const hdr = tb.querySelector('.spkg-table-row-header')
      hdr?.addEventListener('click', handleCollapsibleClick)
    }

    // Scroll to entry
    const tableDiv = tabl2.parentElement
    if (tableDiv) {
      tableDiv.scrollTop = tableDiv.scrollHeight
    }
    ++sectionIdx
  }
  await saveTableState(table0,table1,table2)
  return false
}

function populateContextMenu(sectionNumber: number, rowNumber: number) {
  const numSectionsInTable = table2.length
  const section = table2[sectionNumber]
  const sectionMbrs = section.sectionMembers
  const numSpeakersInSection = sectionMbrs.length
  const lastMember = sectionMbrs[numSpeakersInSection - 1]
  const contextMenu = document.getElementById('context-menu') as HTMLDivElement


  // Is current speaker in current section of a main debate so show amendment menu

  if ((sectionNumber == numSectionsInTable - 1) && 
    (rowNumber == numSpeakersInSection -1) && 
    (section.sectionType == SectionType.mainDebate)) {
    const menu = `
      <div class='context-row'><button id='cm-amend'>Moves amendment</button></div>
      <div class='context-row'><button id='cm-again'>Speaks again</button></div>
    `
    contextMenu.innerHTML = menu
    const againBtn = document.getElementById('cm-again') as HTMLButtonElement
    const mbrClicked = section.sectionMembers[rowNumber]
    againBtn.addEventListener('click',handleContextMenuSpeakAgain.bind(null,mbrClicked,numSectionsInTable))    
    const amendBtn = document.getElementById('cm-amend') as HTMLButtonElement
    amendBtn.addEventListener('click', async () => {
      // Create new amendment section and add to table
      const newSectionNumber = sectionNumber + 1
      const sectList = {
        sectionNumber: newSectionNumber,
        sectionType: SectionType.amendment,
        sectionHeader: "Amendment",
        sectionMembers: [],
        isCollapsed: false
      }
      table2.push(sectList)
      // Add to database
      if (currentEventId !== null) {
        await addDebateSection(currentEventId,currentDebateNumber,newSectionNumber,"Amendment")
      }
      else { console.warn("currentEventId is null!")}

      // Reset Remaining table with all other members
      const currentSpkrId = lastMember.member.id
      table0 = []
      const memberIds = await getMembersForGroupId(currentGroupId)
      for (let i = 0; i < memberIds.length; ++i) {
        if (memberIds[i].MemberId != currentSpkrId) {
          const memberReturned = await getMemberWithId(memberIds[i].MemberId)
          const member: Member = {id: memberReturned.Id, title: memberReturned.Title, firstName: memberReturned.FirstName, lastName: memberReturned.LastName}
          table0.push(member)
        }
      }
      table1 = []

      await populateTables()
      document.dispatchEvent(new CustomEvent('section-change', {
        bubbles: true,
        cancelable: false,
        detail: { }
      }))
    })
  }

  // Current speaker in current section of an amendment debate so show final amendment speaker menu 
  else if ((sectionNumber == numSectionsInTable - 1) && 
  (rowNumber == numSpeakersInSection -1) && 
  (section.sectionType == SectionType.amendment)) {
    const menu = `
    <div class='context-row'><button id='cm-final'>Final speaker for amendment</button></div>
    `
    contextMenu.innerHTML = menu
    const finalBtn = document.getElementById('cm-final')
    if (!finalBtn) {return}
    finalBtn.addEventListener('click', async () => {

      // Create new main debate section and add to table
      const sectList = {
        sectionNumber: sectionNumber + 1,
        sectionType: SectionType.mainDebate,
        sectionHeader: "Main debate",
        sectionMembers: [],
        isCollapsed: false
      }
      table2.push(sectList)
      if (currentEventId !== null) {
        await addDebateSection(currentEventId, currentDebateNumber, (sectionNumber + 1), "Main debate")
      }
      else { console.warn("currentEventId is null!")}

      // Reset Remaining table with all other members
      table0 = []
      table1 = []
      // Get all speakers already spoken in main debate
      const spokenIds: number[] = []
      for (const sectionList of table2) {
        if (sectionList.sectionType == SectionType.mainDebate) {
          for (const mbr of sectionList.sectionMembers) {
            spokenIds.push(mbr.member.id)
          }
        }
      }
      // Put all other members into remaining table
      const memberIds = await getMembersForGroupId(currentGroupId)
      for (let i = 0; i < memberIds.length; ++i) {
        if (!spokenIds.includes(memberIds[i].MemberId)) {
          const memberReturned = await getMemberWithId(memberIds[i].MemberId)
          const member: Member = {id: memberReturned.Id, title: memberReturned.Title, firstName: memberReturned.FirstName, lastName: memberReturned.LastName}
          table0.push(member)
        }
      }
      await populateTables()
      document.dispatchEvent(new CustomEvent('section-change', {
        bubbles: true,
        cancelable: false,
        detail: { }
      }))
    })
  }

  // Is any speaker other than above
  else {
    const menu = `
      <div class='context-row'><button id='cm-again'>Speaks again</button></div>
    `
    contextMenu.innerHTML = menu
    const againBtn = document.getElementById('cm-again') as HTMLButtonElement
    const mbrClicked = section.sectionMembers[rowNumber]
    againBtn.addEventListener('click',handleContextMenuSpeakAgain.bind(null,mbrClicked,numSectionsInTable))
  }
}

const handleContextMenuSpeakAgain = async (mbrParam: ListMember,numSectionsInTableParam:number) => {
  // Get member
  const mbr = mbrParam
  const finalSection = table2[numSectionsInTableParam - 1]
  const newRow = finalSection.sectionMembers.length
  // Get new row
  const duplicateMbr: ListMember = {
    row: newRow,
    member: mbr.member,
    startTime: null,
    speakingTime: 0,
    timerButtonMode: TimerButtonMode.play,
    timerIsActive: false
  }
  // Get last section
  const lastSection = table2[numSectionsInTableParam - 1]
  lastSection.sectionMembers.push(duplicateMbr)
  await populateTables()
  // Has been a change to the section
  document.dispatchEvent(new CustomEvent('section-change', {
    bubbles: true,
    cancelable: false,
    detail: { }
  }))
}

async function updateWaitingTableAfterDragging(indexArray: number[]) {
  const newMemberArray: Member[] = []
  indexArray.forEach(idx => {
    const mbr = table1[idx]
    newMemberArray.push(mbr)
  })
  table1 = newMemberArray
  await populateTables()
}


async function updateListMember(section: number, row: number, target: string, seconds?: number) {
  // Get section
  const sect = table2[section]
  // Get list member
  const mbr = sect.sectionMembers[row]
  // Set list member properties
  if (target == 'spkg-table-cell-timer-play') {
    mbr.timerButtonMode = TimerButtonMode.pause_stop
    mbr.timerIsActive = true
    mbr.startTime = new Date()
    aMemberIsSpeaking = true
  }
  if (target == 'spkg-table-cell-timer-stop') {
    mbr.timerButtonMode = TimerButtonMode.off
    mbr.timerIsActive = false
    mbr.speakingTime = seconds as number
    aMemberIsSpeaking = false
    if (mbr.startTime && meetingIsBeingRecorded == true) {
      const eventEl = document.getElementById('mtgsetup-select-event') as HTMLSelectElement
      if (!eventEl) { return} 
      const eventIdx = eventEl.options.selectedIndex
      const evt = await getOpenEventAtIdx(eventIdx)
      setCurrentEventId(evt.Id)
      const debateNum = currentDebateNumber
      setCurrentDebateNumber(debateNum)
      
      await addDebateSpeech(evt.Id, debateNum, sect.sectionNumber, mbr.member.id, mbr.startTime.toISOString(), mbr.speakingTime )
    }
  }
  if (target == 'spkg-table-cell-timer-pause') {
    mbr.timerButtonMode = TimerButtonMode.play_stop
    mbr.timerIsActive = false
    mbr.speakingTime = seconds as number
    aMemberIsSpeaking = false
  }
  if (target == 'spkg-table-cell-timer-play2') {
    mbr.timerButtonMode = TimerButtonMode.pause_stop
    mbr.timerIsActive = true
    aMemberIsSpeaking = true
    // mbr.speakingTime = seconds as number
  }
  await populateTables()
}

function updateTimeForListMember(seconds: number) {
  const activeCell = document.getElementById('timer-active-cell') 
  if (!activeCell) {return}  // In case not set
  const parent = activeCell.parentNode as HTMLElement
  const rowDetails = parent.id
  const section = rowDetails.slice(8,9)
  const row = rowDetails.slice(4,6)
  const tblSection = table2[parseInt(section)]
  const mbr = tblSection.sectionMembers[parseInt(row)]
  mbr.speakingTime = seconds
}


/**
 * Called after "Save this debate" button is clicked. 
 * Increases the debate number for next debate.
 * Creates a new debate in the database. 
 */
async function updateDataAfterSaveDebate() {
  const newDebateNum = currentDebateNumber + 1
  setCurrentDebateNumber(newDebateNum)
  setCurrentDebateSectionNumber(0)
  if (currentEventId !== null) {
    await addDebate(currentEventId, newDebateNum)
    await addDebateSection(currentEventId,newDebateNum,0,"Main debate")
  }
  else {console.warn("currentEventId is null!")}
}

async function updateDataAfterEndMeeting() {
  await closeCurrentEvent()
}

async function updateDataAfterCancelMeeting() {
  await resetCurrentEvent()
}

async function setNoteForCurrentDebate(note:string) {
  if (currentEventId !== null) {
    await updateDebateNote(currentEventId, currentDebateNumber, note)
  }
  else {console.warn("currentEventId is null!")}
}

function getTimeForMember(section: number, row: number) {
  // Get section
  const sect = table2[section]
  // Get list member
  const mbr = sect.sectionMembers[row]
  // Return list member speaking time
  let seconds = mbr.speakingTime
  if (seconds == undefined) { seconds = 0}
  return seconds
}

function setTimerDisplay(showTimer: boolean) {
  setShowIndividualTimers(showTimer)
}

// Reset button

async function resetTables() {
  // if (grpIdx != undefined) { groupIdx = grpIdx}
  isInitialised = false
  aMemberIsSpeaking = false
  await populateTables()
}

// Handlers

async function handleMovingMember(sourceTable: number, sourceRow: number, destinationTable: number, sectionNumber?: number) {
  
  if (sourceTable == 0 && destinationTable == 1) {
    const memberToMove: Member[] = table0.splice(sourceRow, 1)
    table1.push(memberToMove[0])
  }
  else if (sourceTable == 1 && destinationTable == 0) {
    const memberToMove: Member[] = table1.splice(sourceRow, 1) 
    table0.push(memberToMove[0])
  }
   // Moving from Waiting Table to Speaking Table
  else if (sourceTable == 1 && destinationTable == 2) {
    // The member to move - an array of one
    const memberToMove: Member[] = table1.splice(sourceRow, 1) 
    // The last section of the table
    const lastSection: SectionList = table2[table2.length - 1]
    // Construct a ListMember
    const listMbr: ListMember = {
      row: lastSection.sectionMembers.length, 
      member: memberToMove[0], 
      startTime: null,
      speakingTime: 0,
      timerButtonMode: 0,
      timerIsActive: false
    }
    // Add the ListMember to the table section
    lastSection.sectionMembers.push(listMbr)
  }
  // Moving from Speaking Table to Waiting Table
  else if (sourceTable == 2 && destinationTable == 1) {
    // Remove member from table
    if (sectionNumber == undefined) {sectionNumber = 0}
    const secList = table2[sectionNumber]
    const listMemberToMove = secList.sectionMembers.splice(sourceRow,1)
    // Push onto destination table
    table1.push(listMemberToMove[0].member)
  }
  await populateTables()
}


function handleCollapsibleClick (this: Element) {
  const bdy = this.parentNode?.parentNode?.parentNode as HTMLTableSectionElement
  if (!bdy) {return}
  const rowDivs = bdy.querySelectorAll('.spkg-table-cell-container')
  const sectionNum = parseInt(bdy.id)

  for (const rowDiv of rowDivs) {
    if (rowDiv instanceof HTMLDivElement) {
      rowDiv.style.overflow = 'hidden'
      rowDiv.style.maxHeight = rowDiv.style.maxHeight == '0px' ? '40px' : '0px'
    }
  }
  const elArray = this.getElementsByClassName('chevron')
  const chv = elArray[0] as HTMLElement
  if (chv.style.transform == 'rotate(0deg)' || getComputedStyle(chv).transform == 'matrix(1, 0, 0, 1, 0, 0)') {
    chv.style.transform = 'rotate(-90deg)'
    table2[sectionNum].isCollapsed = true
  }
  else {
    chv.style.transform = 'rotate(-0deg)'
    table2[sectionNum].isCollapsed = false
  }
}



export { 
  resetTablesWithSavedData,
  handleMovingMember,
  populateTables, 
  populateContextMenu,
  updateWaitingTableAfterDragging,
  updateListMember,
  updateTimeForListMember,
  updateDataAfterSaveDebate,
  updateDataAfterEndMeeting,
  updateDataAfterCancelMeeting,
  resetTables, 
  getTimeForMember,
  setTimerDisplay,
  setNoteForCurrentDebate
}
