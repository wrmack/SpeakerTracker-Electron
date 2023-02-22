import { deleteMemberWithId, getMembersForCurrentEntity } from '../../../../../02-Models/models.js'
import { masterRowIdx } from '../../../../../03-State/state.js'
import { enableButtons } from '../../../setup-view.js'

const deleteMemberView = `
  <div class='editing-btn-container'>
    <button class='sheet-btn cancel-btn' id='delete-member-cancel-btn'<span >Cancel</span></button>
    <button class='sheet-btn save-btn delete' id='delete-member-save-btn'><span>DELETE</span></button>
  </div>
  <h1>This will delete the member below</h1>
  <div class='field-container'>
    <label class='input-label'>Title:</label>
    <input type='text' size='100' id='input-delete-member-title' disabled>
  </div>
  <div class='field-container'>
    <label class='input-label'>First name:</label>
    <input type='text' size='100' id='input-delete-member-firstname' disabled>
  </div>
  <div class='field-container'>
    <label class='input-label'>Last name:</label>
    <input type='text' size='100' id='input-delete-member-lastname' disabled>
  </div>  
`

const loadDeleteMemberSheet = async function () {
  const edSht = document.getElementById('editing-sheet') as HTMLElement
  edSht.innerHTML = deleteMemberView
  const members = await getMembersForCurrentEntity()
  const member = members[masterRowIdx]
  const delMbrTitle = document.getElementById('input-delete-member-title') as HTMLInputElement
  delMbrTitle.value = member.Title
  const delMbrFN = document.getElementById('input-delete-member-firstname') as HTMLInputElement
  delMbrFN.value = member.FirstName
  const delMbrLN = document.getElementById('input-delete-member-lastname') as HTMLInputElement
  delMbrLN.value = member.LastName
}

const setupDeleteMemberListeners = function () {
  // Cancel button
  const canBtn = document.getElementById('delete-member-cancel-btn') as HTMLButtonElement
  canBtn.addEventListener('click', handleCancel)

  // Delete button
  const delBtn = document.getElementById('delete-member-save-btn') as HTMLButtonElement
  delBtn.addEventListener('click', handleDelete)
}

//
// Handlers
//

function handleCancel() {
  const edSht = document.getElementById('editing-sheet') as HTMLElement
  edSht.style.left = '100%'
  enableButtons()
}

async function handleDelete() {
  const members = await getMembersForCurrentEntity()
  const member = members[masterRowIdx]

  // Delete in database
  await deleteMemberWithId(member.Id)

  // Close the panel
  const edSHt = document.getElementById('editing-sheet') as HTMLElement
  edSHt.style.left = '100%'
  enableButtons()

   // Emit a mbr-saved event to cause a refresh
   document.dispatchEvent(new CustomEvent('mbr-saved', {
    bubbles: true,
    cancelable: false,
    detail: { }
  }))
}

export { loadDeleteMemberSheet, setupDeleteMemberListeners }
