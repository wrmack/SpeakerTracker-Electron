import { masterRowIdx, getMembersForCurrentEntity, execSql } from '../../../../../01-Models/models.js'

const editMemberView = `
<div class='editing-btn-container'>
  <button class='sheet-btn cancel-btn' id='edit-member-cancel-btn'<span >Cancel</span></button>
  <button class='sheet-btn save-btn' id='edit-member-save-btn'><span>Save</span></button>
</div>
<h1>Edit member below</h1>
<div class='field-container'>
  <label class='input-label'>Title:</label>
  <input type='text' size='100' id='input-edit-member-title'>
</div>
<div class='field-container'>
  <label class='input-label'>First name:</label>
  <input type='text' size='100' id='input-edit-member-firstname'>
</div>
<div class='field-container'>
  <label class='input-label'>Last name:</label>
  <input type='text' size='100' id='input-edit-member-lastname'>
</div>
`

const loadEditMemberSheet = async function () {
  const edSht = document.getElementById('editing-sheet') as HTMLElement
  edSht.innerHTML = editMemberView
  const members = await getMembersForCurrentEntity()
  const member = members[masterRowIdx]
  const mbrTitle = document.getElementById('input-edit-member-title') as HTMLInputElement
  mbrTitle.value = member.Title
  const mbrFN = document.getElementById('input-edit-member-firstname') as HTMLInputElement
  mbrFN.value = member.FirstName
  const mbrLN = document.getElementById('input-edit-member-lastname') as HTMLInputElement
  mbrLN.value = member.LastName
}

const setupEditMemberListeners = () => {
  // Cancel button
  const canBtn = document.getElementById('edit-member-cancel-btn') as HTMLButtonElement
  canBtn.addEventListener('click', handleCancel)

  // Save button
  const svBtn = document.getElementById('edit-member-save-btn') as HTMLButtonElement
  svBtn.addEventListener('click', handleSave)
}

//
// Handlers
//

function handleCancel() {
  const edSht = document.getElementById('editing-sheet') as HTMLElement
  edSht.style.left = '100%'
}

async function handleSave() {
  const mbrTitle = document.getElementById('input-edit-member-title') as HTMLInputElement
  const title = mbrTitle.value
  const mbrFN = document.getElementById('input-edit-member-firstname') as HTMLInputElement
  const firstName = mbrFN.value
  const mbrLN = document.getElementById('input-edit-member-lastname') as HTMLInputElement
  const lastName = mbrLN.value

  // Change in database
  const members = await getMembersForCurrentEntity()
  const member = members[masterRowIdx]
  const mysql = `UPDATE Members SET Title = '${title}', FirstName = '${firstName}', LastName = '${lastName}' WHERE Members.Id = ${member.Id};`
  await execSql(mysql)

  // Close the panel
  const edSht = document.getElementById('editing-sheet') as HTMLButtonElement
  edSht.style.left = '100%'

  // Emit a mbr-saved event to cause a refresh
  document.dispatchEvent(new CustomEvent('mbr-saved', {
    bubbles: true,
    cancelable: false,
    detail: { }
  }))
}

export { loadEditMemberSheet, setupEditMemberListeners }
