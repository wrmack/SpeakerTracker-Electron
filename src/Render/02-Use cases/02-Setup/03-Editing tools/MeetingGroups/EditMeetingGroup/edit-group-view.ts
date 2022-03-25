import { 
  masterRowIdx, 
  getGroupsForCurrentEntity, 
  getMembersForCurrentEntity, 
  execSql, 
  getMembersForGroupId,
  getMemberWithId
} from '../../../../../01-Models/models.js'

let memberIds:any[] = []

// Inserted into sheet
const editGroupView = `
  <div class='editing-btn-container'>
    <button class='sheet-btn' id='edit-group-cancel-btn'<span >Cancel</span></button>
    <button class='sheet-btn' id='edit-group-save-btn'><span>Save</span></button>
  </div>
  <h1>Edit meeting group</h1>
  <div class='field-container'>
    <label class='input-label'>Name:</label>
    <input type='text' size='100' placeholder='eg Committee One' id='edit-group-name'>
  </div>
  <div class='field-container'>
    <label class='input-label'>Members:</label>
    <input type='text' size='100' placeholder='eg John' id='edit-group-members'>
    <div><button  class="arrow" id='edit-group-arrow'>&gt;</button></div>
  </div>
`

const editSelectMembersView = `
  <div class='editing-btn-container'>
    <button class='sheet-btn' id='edit-select-members-cancel-btn'<span >Cancel</span></button>
    <button class='sheet-btn' id='edit-select-members-done-btn'><span>Done</span></button>
  </div>
  <h1>Select members for this meeting group</h1>
  <div id='edit-selection-list'>
    <div class='cbitem'>
      <input id='e-cb1' type='checkbox'><label for='e-cb1'>One</label>
    </div>
  </div>
`

const loadEditGroupSheet = async () => {
  const ed = document.getElementById('editing-sheet') as HTMLElement
  ed.innerHTML = editGroupView
  const groups = await getGroupsForCurrentEntity()
  const group = groups[masterRowIdx]
  const members = await getMembersForGroupId(group.Id)
  let mbrString = ""
  for (let i = 0 ; i < members.length; ++i) {
    const member = await getMemberWithId(members[i].MemberId)
    mbrString += `${member.FirstName} ${member.LastName}`
    if (i < memberIds.length - 1) {
      mbrString += ', '
    }
  }
  const gnam = document.getElementById('edit-group-name') as HTMLInputElement
  gnam.value = group.GrpName
  const gmem = document.getElementById('edit-group-members') as HTMLInputElement
  gmem.value = mbrString
}

const setupEditGroupListeners = () => {
  // Cancel button
  const canc = document.getElementById('edit-group-cancel-btn') as HTMLElement
  canc.addEventListener('click', handleCancel)

  // '>' is pressed for selecting members for meeting group
  const garr = document.getElementById('edit-group-arrow') as HTMLElement
  garr.addEventListener('click', async () => {
    const mem = document.getElementById('editing-sheet-selectMembers') as HTMLElement
    mem.innerHTML = editSelectMembersView
    moveEditSelectMembersSheet()
    // Select members sheet cancel button
    const selcan = document.getElementById('edit-select-members-cancel-btn') as HTMLElement
    selcan.addEventListener('click', () => {
      const selmem = document.getElementById('editing-sheet-selectMembers') as HTMLElement
      selmem.style.left = '100%'
    })
    // Select members sheet - populate list of members
    const members = await getMembersForCurrentEntity()
    let memberItems = ''
    for (const i in members) {
      memberItems += "<div class='cbitem'>"
      memberItems += `<input class='echbx' id='ecb-${i}' type='checkbox'>`
      memberItems += `<label for='ecb-${i}'>${members[i].FirstName} ${members[i].LastName}</label>`
      memberItems += `<input id='ecb-id-${i}' type='hidden' value=${members[i].Id}>`
      memberItems += "</div>"
      const selist = document.getElementById('edit-selection-list')
      if (!selist) {return}
      selist.innerHTML = memberItems
    }
    // Select members sheet - done button
    const seldone = document.getElementById('edit-select-members-done-btn') as HTMLElement
    seldone.addEventListener('click', () => {
      const selectedMbrs = document.querySelectorAll('.echbx:checked')
      const selectedMbrsIds = []
      for (let i = 0 ; i < selectedMbrs.length; ++i) {
        const elId = selectedMbrs[i].id.slice(4)
        const el = document.getElementById('ecb-id-' + elId) as HTMLInputElement
        const id = el.value
        selectedMbrsIds.push({'MemberId': id})
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
      const edgm = document.getElementById('edit-group-members') as HTMLInputElement
      edgm.value = mbrString
      const ed = document.getElementById('editing-sheet-selectMembers') as HTMLElement
      ed.style.left = '100%'
    })
  })

  // Save button
  const sv = document.getElementById('edit-group-save-btn') as HTMLElement
  sv.addEventListener('click', handleSave)
}

const moveEditSelectMembersSheet = () => {
  const cont = document.getElementById('content-container')
  if (!cont) {return}
  const containerWidth = cont.offsetWidth
  const sheetWidthNum = containerWidth - 405
  const sheetWidthStrg = sheetWidthNum.toString() + 'px'
  const selmem = document.getElementById('editing-sheet-selectMembers')
  if (!selmem) {return}
  selmem.style.width = sheetWidthStrg
  // If sheet is expanded then want left side to go full length to close the sheet
  // selmem.style.left = isSheetExpanded ? '100%' : '405px'
  // isSheetExpanded = !isSheetExpanded
  selmem.style.left = (selmem.style.left == '100%' || selmem.style.left == '') ? '405px' : '100%'
}

//
// Handlers
//

function handleCancel() {
  const ed = document.getElementById('editing-sheet') as HTMLElement
  ed.style.left = '100%'
}

async function handleSave() {
  const gnam = document.getElementById('edit-group-name') as HTMLInputElement
  const groupName = gnam.value
  const groups = await getGroupsForCurrentEntity()
  const group = groups[masterRowIdx]

  // Save to database
  let mySql = `UPDATE Groups SET GrpName = '${groupName}' WHERE Groups.Id = ${group.Id};`
  // Delete all current references to this group in GroupMembers then insert edited ones
  mySql += `DELETE FROM GroupMembers WHERE GroupMembers.GroupId = ${group.Id};`
  memberIds.forEach((mbrId) => {
    mySql += `INSERT INTO GroupMembers (GroupId, MemberId) VALUES (${group.Id}, ${mbrId.MemberId});`
  })
  await execSql(mySql)

  // Close the panel
  const ed = document.getElementById('editing-sheet') as HTMLElement
  ed.style.left = '100%'

  // Emit a mbr-saved event to cause a refresh
  document.dispatchEvent(new CustomEvent('grp-saved', {
    bubbles: true,
    cancelable: false,
    detail: { }
  }))
}



export { loadEditGroupSheet, setupEditGroupListeners }
