import { getMembersForCurrentEntity, addGroup, execSql } from '../../../../../02-Models/models.js'
import { selectedEntityId } from '../../../../../03-State/state.js'
import { enableButtons } from '../../../setup-view.js'

let memberIds: number[] = []

// Inserted into sheet
const addGroupView = `
  <div class='editing-btn-container'>
    <button class='sheet-btn' id='add-group-cancel-btn'<span >Cancel</span></button>
    <button class='sheet-btn' id='add-group-save-btn'><span>Save</span></button>
  </div>
  <h1>Add a new meeting group</h1>
  <div class='field-container'>
    <label class='input-label'>Title:</label>
    <input type='text' size='100' placeholder='eg Committee One' id='add-group-name'>
  </div>
  <div class='field-container'>
    <label class='input-label'>Members:</label>
    <input type='text' size='100' placeholder='Use > to select group members' id='add-group-members' disabled>
    <div><button  class="arrow" id='add-group-arrow'>&gt;</button></div>
  </div>
`

const selectMembersView = `
  <div class='editing-btn-container'>
    <button class='sheet-btn' id='select-members-cancel-btn'<span >Cancel</span></button>
    <button class='sheet-btn' id='select-members-done-btn'><span>Done</span></button>
  </div>
  <h1>Select members for this meeting group</h1>
  <div id='selection-list'>
    <div class='cbitem'>
      <input id='cb1' type='checkbox'><label for='cb1'>One</label>
    </div>
  </div>

`


const loadAddGroupSheet = function () {
  const ed = document.getElementById('editing-sheet')
  if (!ed) {return}
  ed.innerHTML = addGroupView
}

const setupAddGroupListeners = function () {
  // Cancel button
  const canc = document.getElementById('add-group-cancel-btn')  as HTMLElement
  canc.addEventListener('click', handleCancel)

  // '>' is pressed for selecting members for meeting group
  const addgp =  document.getElementById('add-group-arrow') as HTMLElement
  addgp.addEventListener('click', async () => {
    const mem = document.getElementById('editing-sheet-selectMembers');
    if (!mem) {return}
    mem.innerHTML = selectMembersView
    moveSelectMembersSheet()
    // Select members sheet cancel button
    const canc = document.getElementById('select-members-cancel-btn')
    if (!canc) {return}
    canc.addEventListener('click', () => {
      const mem = document.getElementById('editing-sheet-selectMembers');
      if (!mem) {return}
      mem.style.left = '100%'
    })
    // Select members sheet - populate list of members
    const members = await getMembersForCurrentEntity()
    let memberItems = ''
    for (const i in members) {
      memberItems += "<div class='cbitem'>"
      memberItems += `<input class='chbx' id='cb-${i}' type='checkbox'>`
      memberItems += `<label for='cb-${i}'>${members[i].FirstName} ${members[i].LastName}</label>`
      memberItems += `<input id='cb-id-${i}' type='hidden' value=${members[i].Id}>`
      memberItems += "</div>"
      const lst = document.getElementById('selection-list');
      if (!lst) {return}
      lst.innerHTML = memberItems
    }
    // Select members sheet - done button
    const done = document.getElementById('select-members-done-btn');
    if (!done) {return}
    done.addEventListener('click', () => {
      const selectedMbrs = document.querySelectorAll('.chbx:checked') 
      const selectedMbrsIds: number[] = []
      for (let i = 0 ; i < selectedMbrs.length; ++i) {
        const memId = document.getElementById('cb-id-' + selectedMbrs[i].id.slice(3)) as HTMLInputElement;
        if (!memId) {return}
        const id = memId.value
        selectedMbrsIds.push(parseInt(id))
      }
      memberIds = selectedMbrsIds
      let mbrString = ""
      for (let i = 0 ; i < selectedMbrs.length; ++i) {
        const mbr = selectedMbrs[i] as HTMLInputElement
        if (!mbr) {return}
        const labls = mbr.labels
        if (labls && labls.length > 0) {
          mbrString += `${labls[0].textContent}`
          if (i < selectedMbrs.length - 1) {
            mbrString += ', '
          }
        }
      }
      const addgm = document.getElementById('add-group-members') as HTMLInputElement
      if (!addgm) {return}
      addgm.value = mbrString
      const ed = document.getElementById('editing-sheet-selectMembers')
      if (!ed) {return}
      ed.style.left = '100%'
    })
  })

  // Save button
  const sv = document.getElementById('add-group-save-btn') as HTMLInputElement
  sv.addEventListener('click', handleSave)
}

const moveSelectMembersSheet = () => {
  const cont = document.getElementById('content-container') as HTMLElement
  const containerWidth = cont.offsetWidth
  const sheetWidthNum = containerWidth - 405
  const sheetWidthStrg = sheetWidthNum.toString() + 'px'
  const edmem =  document.getElementById('editing-sheet-selectMembers')
  if (!edmem) {return}
  edmem.style.width = sheetWidthStrg
  // If sheet is expanded then want left side to go full length to close the sheet
  // edmem.style.left = isSheetExpanded ? '100%' : '405px'
  // isSheetExpanded = !isSheetExpanded
  edmem.style.left = (edmem.style.left == '100%' || edmem.style.left == '') ? '405px' : '100%'
}

//
// Handlers
//

function handleCancel() {
  const ed = document.getElementById('editing-sheet') as HTMLElement
  ed.style.left = '100%'
  enableButtons()
}

async function handleSave() {
  const gpnam = document.getElementById('add-group-name') as HTMLInputElement
  if (!gpnam) {return}
  const newGroupName = gpnam.value

  // Save to database
  const entityId = selectedEntityId
  const group = {
    name: newGroupName,
    entity: entityId
  }
  const groupId = await addGroup(group)
  let mySql = ''
  memberIds.forEach((mbrId) => {
    mySql += `INSERT INTO GroupMembers (GroupId, MemberId) VALUES (${groupId}, ${mbrId});`
  })
  await execSql(mySql)

  // Close the panel
  const ed = document.getElementById('editing-sheet')
  if (!ed) {return}
  ed.style.left = '100%'
  enableButtons()

  // Emit a grp-saved event to cause a refresh
  document.dispatchEvent(new CustomEvent('grp-saved', {
    bubbles: true,
    cancelable: false,
    detail: { }
  }))
}

export { loadAddGroupSheet, setupAddGroupListeners }
