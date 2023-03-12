import { addMember } from '../../../../../02-Models/models.js'
import { currentEntityId } from '../../../../../03-State/state.js'
import { enableButtons } from '../../../setup-view.js'

// Inserted into sheet
const addMemberView = `
  <div class='editing-btn-container'>
    <button class='sheet-btn' id='cancel-btn'<span >Cancel</span></button>
    <button class='sheet-btn' id='save-btn'><span>Save</span></button>
  </div>
  <h1>Add a new member</h1>
  <div class='field-container'>
    <label class='input-label'>Title:</label>
    <input type='text' size='100' placeholder='eg Cr' id='member-title'>
  </div>
  <div class='field-container'>
    <label class='input-label'>First name:</label>
    <input type='text' size='100' placeholder='eg John' id='member-first-name'>
  </div>
  <div class='field-container'>
    <label class='input-label'>Last name:</label>
    <input type='text' size='100' placeholder='eg Smith' id='member-last-name'>
  </div>
`
const loadAddMemberSheet = function () {
  const edSht = document.getElementById('editing-sheet')
  if (!edSht) {return}
  edSht.innerHTML = addMemberView
  const title = document.getElementById('member-title')
  title?.focus()
}

const setupAddMemberListeners = function () {
  // Cancel button
  const canBtn = document.getElementById('cancel-btn')
  if (!canBtn) {return}
  canBtn.addEventListener('click', handleCancel)

  // Save button
  const svBtn = document.getElementById('save-btn')
  if (!svBtn) {return}
  svBtn.addEventListener('click', handleSave)

  // Last input field for member
  const lastName = document.getElementById('member-last-name')
  if (!lastName) {return}
  lastName.addEventListener('keypress', handleKeyPress)
}

//
// Handlers
//

function handleKeyPress(ev: KeyboardEvent) {
  if (ev.key === 'Enter') {
    handleSave()
  }
}

function handleCancel() {
  const edSht = document.getElementById('editing-sheet') as HTMLElement
  edSht.style.left = '100%'
  enableButtons()
}

async function handleSave() {
  const mbrTitle = document.getElementById('member-title') as HTMLInputElement
  const newMemberTitle = mbrTitle.value 
  const mbrFN = document.getElementById('member-first-name') as HTMLInputElement
  const newMemberFirstName = mbrFN.value
  const mbrLN = document.getElementById('member-last-name') as HTMLInputElement
  const newMemberLastName = mbrLN.value

  // Save to database
  const entityId = currentEntityId
  const member = {
    title: newMemberTitle,
    firstName: newMemberFirstName,
    lastName: newMemberLastName,
    entityId: entityId
  }
  await addMember(member)

  // // Add to in-memory model
  // const entity = { id: 3, name: newCouncilName }
  // entities.push(entity)

  // Close the panel
  const edSHT = document.getElementById('editing-sheet') as HTMLElement
  edSHT.style.left = '100%'
  enableButtons()

  // Enable Group button
  const grpBtn = document.getElementById('setup-sidebar-groups-btn') as HTMLButtonElement
  grpBtn.disabled = false

  // Emit a mbr-saved event to cause a refresh
  document.dispatchEvent(new CustomEvent('mbr-saved', {
    bubbles: true,
    cancelable: false,
    detail: { }
  }))
}

export { loadAddMemberSheet, setupAddMemberListeners }
