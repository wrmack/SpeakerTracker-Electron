import { execSql } from '../../../../../01-Models/models.js'
import { enableButtons } from '../../../setup-view.js';

// Inserted into sheet
const addEntityView = `
  <div class='editing-btn-container'>
    <button class='sheet-btn cancel-btn' id='add-entity-cancel-btn'<span >Cancel</span></button>
    <button class='sheet-btn save-btn' id='add-entity-save-btn'><span>Save</span></button>
  </div>
  <h1>Add a new entity</h1>
  <label class='input-label'>Name:</name>
  <input type='text' size='100' placeholder='eg Some City Council' id='entity-name'></input>
`
export const loadAddEntitySheet = function () {
  const ed = document.getElementById('editing-sheet');
  if (!ed) {return}
  ed.innerHTML = addEntityView
}

export const setupAddEntityListeners = function () {
  // Cancel button
  const cncl = document.getElementById('add-entity-cancel-btn');
  if (!cncl) {return}
  cncl.addEventListener('click', handleCancel) 

  // Save button
  const sv = document.getElementById('add-entity-save-btn');
  if (!sv) {return}
  sv.addEventListener('click', handleSave)
}

//
// Handlers
//

function handleCancel() {
  const edSht = document.getElementById('editing-sheet') as HTMLElement
  edSht.style.left = '100%'
  enableButtons()
}

async function handleSave() {
  const enam = document.getElementById('entity-name') as HTMLInputElement
  const newCouncilName = enam.value

  // Save to database
  const mysql = "INSERT INTO Entities (EntName) VALUES ('" + newCouncilName + "' );"
  await execSql(mysql)


  // Close the panel
  const edSHT = document.getElementById('editing-sheet') as HTMLElement
  edSHT.style.left = '100%'

  // Enable editing buttons
  enableButtons()

  // Emit a ent-saved event to cause a refresh
  document.dispatchEvent(new CustomEvent('ent-saved', {
    bubbles: true,
    cancelable: false,
    detail: { }
  }))
}