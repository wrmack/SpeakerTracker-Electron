import { execSql, getGroupsForCurrentEntity, getMembersForGroupId, getMemberWithId } from "../../../../../02-Models/models.js"
import { masterRowIdx } from "../../../../../03-State/state.js"
import { enableButtons } from "../../../setup-view.js"

const deleteGroupView = `
  <div class='editing-btn-container'>
    <button class='sheet-btn cancel-btn' id='delete-group-cancel-btn'<span >Cancel</span></button>
    <button class='sheet-btn save-btn delete' id='delete-group-save-btn'><span>DELETE</span></button>
  </div>
  <h1>This will delete the meeeting group below</h1>
  <div class='field-container'>
    <label class='input-label'>Name:</label>
    <input type='text' size='100' id='input-delete-group-name' disabled>
  </div>
  <div class='field-container'>
    <label class='input-label'>Members:</label>
    <input type='text' size='100' id='input-delete-group-members' disabled>
  </div>
`
const loadDeleteGroupSheet = async function () {
  const ed = document.getElementById('editing-sheet') as HTMLElement
  ed.innerHTML = deleteGroupView
  const groups = await getGroupsForCurrentEntity()
  const group = groups[masterRowIdx]
  const groupMemberIds = await getMembersForGroupId(group.Id)
  let mbrStrg = ""
  for (let i = 0; i < groupMemberIds.length; ++i) {
    const member = await getMemberWithId(groupMemberIds[i].MemberId)
    mbrStrg += `${member.FirstName} ${member.LastName}`
    if (i < groupMemberIds.length - 1) {
      mbrStrg += ", "
    }
  }
  const gnam = document.getElementById('input-delete-group-name') as HTMLInputElement
  gnam.value = group.GrpName
  const gmem = document.getElementById('input-delete-group-members') as HTMLInputElement
  gmem.value = mbrStrg
}

const setupDeleteGroupListeners = () => {
  
  // Cancel button
  const canc = document.getElementById('delete-group-cancel-btn') as HTMLElement
  canc.addEventListener('click', handleCancel)
  
  // Delete button
  const sv = document.getElementById('delete-group-save-btn') as HTMLElement
  sv.addEventListener('click', handleDelete)
}

//
// Handlers
//

function handleCancel() {
  const ed = document.getElementById('editing-sheet') as HTMLElement
  ed.style.left = '100%'
  enableButtons()
}

async function handleDelete() {
  const groups = await getGroupsForCurrentEntity()
  const group = groups[masterRowIdx]
  // Delete group from Groups in database and any references in GroupMembers
  const mysql = `
    DELETE FROM Groups WHERE Groups.Id = ${group.Id};
    DELETE FROM GroupMembers WHERE GroupMembers.GroupId = ${group.Id};
  `
  await execSql(mysql)

  // Close the panel
  const ed = document.getElementById('editing-sheet') as HTMLElement
  ed.style.left = '100%'
  enableButtons()

  // Emit a grp-saved event to cause a refresh
  document.dispatchEvent(new CustomEvent('grp-saved', {
    bubbles: true,
    cancelable: false,
    detail: { }
  }))
}

export { loadDeleteGroupSheet, setupDeleteGroupListeners }