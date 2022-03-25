import { masterRowIdx, getEntityAtIdx, execSql } from '../../../../../01-Models/models.js'

const editEntityView = `
<div class='editing-btn-container'>
  <button class='sheet-btn cancel-btn' id='edit-entity-cancel-btn'<span >Cancel</span></button>
  <button class='sheet-btn save-btn' id='edit-entity-save-btn'><span>Save</span></button>
</div>
<h1>Edit entity name</h1>
<div class='field-container'>
  <label class='input-label'>Name:</label>
  <input type='text' size='100' id='input-edit-entity-name'>
</div>
`

const loadEditEntitySheet = async function () {
  const ed = document.getElementById('editing-sheet')
  if (!ed) {return}
  ed.innerHTML = editEntityView
  const entity = await getEntityAtIdx(masterRowIdx)
  const enam = document.getElementById('input-edit-entity-name') as HTMLInputElement;
  if (!enam) {return}
  enam.value = entity.EntName
}

const setupEditEntityListeners = () => {
  // Cancel button
  const canc = document.getElementById('edit-entity-cancel-btn');
  if (!canc) {return}
  canc.addEventListener('click', () => {
    const ed = document.getElementById('editing-sheet')
    if (!ed) {return}
    ed.style.left = '100%'
  })

  // Save button
  const sv = document.getElementById('edit-entity-save-btn');
  if (!sv) {return;}
  sv.addEventListener('click', async () => {
    const enam = document.getElementById('input-edit-entity-name') as HTMLInputElement;
    if (!enam) {return}
    const newName = enam.value
    // Change in database
    const entity = await getEntityAtIdx(masterRowIdx)
    const mysql = `UPDATE Entities SET EntName = '${newName}' WHERE Entities.Id = ${entity.Id};`
    execSql(mysql)

    // Close the panel    
    const ed = document.getElementById('editing-sheet')
    if (!ed) {return}
    ed.style.left = '100%'
  })
}

export { loadEditEntitySheet, setupEditEntityListeners }