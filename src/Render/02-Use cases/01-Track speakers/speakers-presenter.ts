import { 
  getEntities, 
  getGroupsForEntityId,
  getGroupForId,
  getMembersForGroupId, 
  getMemberWithId,
  getSavedEntGroupId,
  selectedEntityId,
  setSelectedEntityId,
  selectedGroupId,
  setSelectedGroupId,
  Member,
  ListMember,
  SectionList,
  SectionType,
  getEntityAtIdx,
  TimerButtonMode
} from "../../01-Models/models.js"

let isInitialised = false

// First two tables are simply arrays of Members
// Speaking table is an array of SectionLists

let table0: Member[] = []
let table1: Member[] = []
let table2: SectionList[] = []


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

async function populateTables () {
  // If no entities set up - return
  const ents = await getEntities()
  if (ents.length == 0) { return}
  // Get saved entity and group ids, if any.
  const savedEntGpId = await getSavedEntGroupId()
  if (savedEntGpId != undefined) {
    setSelectedEntityId(savedEntGpId.entId)
    setSelectedGroupId(savedEntGpId.grpId)
  } 
  const group = await getGroupForId(selectedGroupId)
  let memberIds:any[] = []
  if (group != undefined) {
    memberIds = await getMembersForGroupId(selectedGroupId)
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
      sectionMembers: []
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
    tableRows2 += `<tr class='spkg-table-row'>`
    if (section.sectionType == SectionType.amendment) {
      tableRows2 += `<th>
        <div class='spkg-table-row-header'>
          ${section.sectionHeader}<div class='chevron'>V</div>
        </div>
          <hr class='spkg-table-cell-rule'>
        </th>`
    }
    else {
      tableRows2 += `<th>
        <div class='spkg-table-row-header'>
          ${section.sectionHeader}
        </div>
          <hr class='spkg-table-cell-rule'>
        </th>`
    }

    tableRows2 += '</tr>'

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
          <td>
            <div class='spkg-table-cell-container'> 
              <div class='spkg-table-cell-container-top'>
                <div class='spkg-table-cell-comp-left'>`
                  if (listMbr.timerButtonMode == TimerButtonMode.play) {
                    tableRows2 += `<button class='arrow-button-l' id='${myId}-l'>g</button>`
                  } 
                  tableRows2 += `<span class='spkg-table-cell-text' id='${myId}-n'>${mbr.firstName} ${mbr.lastName}</span>
                </div>
                <div class='spkg-table-cell-comp-right' id='${myId}-r'>`
                  if (listMbr.timerButtonMode == TimerButtonMode.pause_stop) {
                    tableRows2 += `<button class='spkg-table-cell-timer-pause'>c</button>`
                  }
                  if (listMbr.timerButtonMode == TimerButtonMode.play_stop) {
                    tableRows2 += `<button class='spkg-table-cell-timer-play2'>a</button>`
                  }
                  if (listMbr.timerIsActive == true) {
                    tableRows2 += `<span class='spkg-table-cell-timer' id='timer-active-cell'>${timeString}</span>`
                  } else {
                    tableRows2 += `<span class='spkg-table-cell-timer'>${timeString}</span>`
                  }     
                  if (listMbr.timerButtonMode == TimerButtonMode.play) {
                    tableRows2 += `<button class='spkg-table-cell-timer-play'>a</button>`
                  }
                  if (listMbr.timerButtonMode == TimerButtonMode.pause_stop || 
                    listMbr.timerButtonMode == TimerButtonMode.play_stop ) {
                    tableRows2 += `<button class='spkg-table-cell-timer-stop'>b</button>`
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
}

function populateContextMenu(sectionNumber: number, rowNumber: number) {
  const numSectionsInTable = table2.length
  const section = table2[sectionNumber]
  const sectionMbrs = section.sectionMembers
  const numSpeakersInSection = sectionMbrs.length
  const lastMember = sectionMbrs[numSpeakersInSection - 1]

  // Current speaker in current section of a main debate so show amendment menu

  if ((sectionNumber == numSectionsInTable - 1) && 
    (rowNumber == numSpeakersInSection -1) && 
    (section.sectionType == SectionType.mainDebate)) {
    const menu = `
      <div class='context-row'><button id='cm-amend'>Moves amendment</button></div>
      <div class='context-row'><button id='cm-again'>Speaks again</button></div>
    `
    const cm = document.getElementById('context-menu')
    if (!cm) {return}
    cm.innerHTML = menu
    const amendBtn = document.getElementById('cm-amend')
    if (!amendBtn) {return}
    amendBtn.addEventListener('click', async () => {
      // Create new amendment section and add to table
      const sectList = {
        sectionNumber: sectionNumber + 1,
        sectionType: SectionType.amendment,
        sectionHeader: "Amendment",
        sectionMembers: []
      }
      table2.push(sectList)
      // Reset Remaining table with all other members
      const currentSpkrId = lastMember.member.id
      table0 = []
      const memberIds = await getMembersForGroupId(selectedGroupId)
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
  if ((sectionNumber == numSectionsInTable - 1) && 
  (rowNumber == numSpeakersInSection -1) && 
  (section.sectionType == SectionType.amendment)) {
    const menu = `
    <div class='context-row'><button id='cm-final'>Final speaker for amendment</button></div>
    `
    const cm = document.getElementById('context-menu')
    if (!cm) {return}
    cm.innerHTML = menu
    const finalBtn = document.getElementById('cm-final')
    if (!finalBtn) {return}
    finalBtn.addEventListener('click', async () => {

      // Create new main debate section and add to table
      const sectList = {
        sectionNumber: sectionNumber + 1,
        sectionType: SectionType.mainDebate,
        sectionHeader: "Main debate",
        sectionMembers: []
      }
      table2.push(sectList)
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
      const memberIds = await getMembersForGroupId(selectedGroupId)
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
}

// Meeting setup

async function populateEntityDropdown() {
  let options = ''
  const entities = await getEntities()
  if (entities.length == 0) {
    options += `<option disabled selected hidden>Go to Setup and create an Entity</option>`
    const entEl = document.getElementById('mtgsetup-select-entity')
    if (entEl) {entEl.classList.add("mtgsetup-prompt") }
  }
  else {
    entities.forEach( (entity) => {
      if (entity.Id == selectedEntityId) {
        options += `<option selected>${entity.EntName}</option>`
      }
      else {
        options += `<option>${entity.EntName}</option>`
      }
    })
  }

  const ent = document.getElementById('mtgsetup-select-entity')
  if (ent) { ent.innerHTML = options} 
}
 /**
  * Gets the entity id given the index passed in.
  * Sets the global `selectedEntityId` then causes the group
  * dropdown to be repopulated.
  * @param newEntityIdx The index of the selected entity.
  */
async function entityChanged(newEntityIdx: number) {
  const ent = await getEntityAtIdx(newEntityIdx)
  await setSelectedEntityId(ent.Id)
  await populateGroupDropdown()
}

async function populateGroupDropdown() {
  let options = ''
  const groups = await getGroupsForEntityId(selectedEntityId)
  if (groups.length == 0) {
    options += `<option disabled selected hidden>Go to Setup and create a Meeting group</option>`
    const entEl = document.getElementById('mtgsetup-select-group')
    if (entEl) {entEl.classList.add("mtgsetup-prompt") }
  }
  else {
    groups.forEach( async (group) => {
      if (group.Id == selectedGroupId) {
        options += `<option selected>${group.GrpName}</option>`
      }
      else {
        options += `<option>${group.GrpName}</option>`
      }
    })
  }

  const grp = document.getElementById('mtgsetup-select-group')
  if (grp) {grp.innerHTML = options}
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
  }
  if (target == 'spkg-table-cell-timer-stop') {
    mbr.timerButtonMode = TimerButtonMode.off
    mbr.timerIsActive = false
    mbr.speakingTime = seconds as number
  }
  if (target == 'spkg-table-cell-timer-pause') {
    mbr.timerButtonMode = TimerButtonMode.play_stop
    mbr.timerIsActive = false
    mbr.speakingTime = seconds as number
  }
  if (target == 'spkg-table-cell-timer-play2') {
    mbr.timerButtonMode = TimerButtonMode.pause_stop
    mbr.timerIsActive = true
    // mbr.speakingTime = seconds as number
  }
  await populateTables()
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


// Reset button

async function resetTables() {
  // if (grpIdx != undefined) { groupIdx = grpIdx}
  isInitialised = false
  await populateTables()
}

// Handlers

function handleCollapsibleClick (this: Element) {
  const bdy = this.parentNode?.parentNode?.parentNode
  if (!bdy) {return}
  const rowDivs = bdy.querySelectorAll('.spkg-table-cell-container')
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
  }
  else {chv.style.transform = 'rotate(-0deg)'}
}

// Helpers

function getTimeStringFromSeconds(seconds: number) {
  let minuteStrg = ''
  let secondStrg = ''
  const minute = Math.floor((seconds) / 60)
  const secondsRemg = seconds - (minute * 60)
  if (minute < 10) { minuteStrg = '0' + minute.toString() } else { minuteStrg = minute.toString()}
  if (secondsRemg < 10) { secondStrg = '0' + seconds.toString() } else { secondStrg = seconds.toString()}
  return `${minuteStrg}:${secondStrg}`
}

export { 
  handleMovingMember,
  entityChanged,
  populateTables, 
  populateContextMenu,
  populateEntityDropdown, 
  populateGroupDropdown, 
  updateWaitingTableAfterDragging,
  updateListMember,
  resetTables, 
  getTimeForMember
}
