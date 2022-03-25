import { execSql } from '../../../../../01-Models/models.js'

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
  cncl.addEventListener('click', () => {
    const ed = document.getElementById('editing-sheet');
    if (ed) {
      ed.style.left = '100%'
    }
  })

  // Save button
  const sv = document.getElementById('add-entity-save-btn');
  if (!sv) {return}
  sv.addEventListener('click', async () => {
    const enam = document.getElementById('entity-name') as HTMLInputElement
    if (!enam) {return}
    const newCouncilName = enam.value

    // Save to database
    const mysql = "INSERT INTO Entities (EntName) VALUES ('" + newCouncilName + "' );"
    execSql(mysql)

    // Close the panel
    const esht = document.getElementById('editing-sheet');
    if (!esht) {return}
    esht.style.left = '100%'
  })
}
