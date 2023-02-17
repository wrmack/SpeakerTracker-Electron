import { getEntityAtIdx, deleteEntityWithId,  execSql } from '../../../../../02-Models/models.js'
import { masterRowIdx, setCurrentEntityId, setCurrentGroupId } from '../../../../../03-State/state.js'
import { enableButtons } from '../../../setup-view.js'

const deleteEntityView = `
  <div class='editing-btn-container'>
    <button class='sheet-btn cancel-btn' id='delete-entity-cancel-btn'<span >Cancel</span></button>
    <button class='sheet-btn save-btn delete' id='delete-entity-save-btn'><span>DELETE</span></button>
  </div>
  <h1>This will delete the whole entity!</h1>
  <div class='field-container'>
    <label class='input-label'>Name:</label>
    <input type='text' size='100' placeholder='eg Some City Council' id='input-delete-entity-name'>
  </div>
`
const loadDeleteEntitySheet = async function () {
  const edsht = document.getElementById('editing-sheet')
  if (!edsht) {return}
  edsht.innerHTML = deleteEntityView
  const entity = await getEntityAtIdx(masterRowIdx)
  const entnam = document.getElementById('input-delete-entity-name') as HTMLInputElement;
  if (!entnam) {return}
  entnam.value = entity.EntName
  entnam.disabled = true
}

const setupDeleteEntityListeners = function () {
  // Cancel button
  const canc = document.getElementById('delete-entity-cancel-btn');
  if (!canc) {return}
  canc.addEventListener('click', handleCancel) 

  // Delete button
  const del = document.getElementById('delete-entity-save-btn');
  if (!del) {return}
  del.addEventListener('click', handleDelete)
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
    // Delete in database
    const entity = await getEntityAtIdx(masterRowIdx)
    await deleteEntityWithId(entity.Id)
    await setCurrentEntityId(0)
    await setCurrentGroupId(0)


    // Close the panel
    const ed = document.getElementById('editing-sheet') as HTMLElement
    ed.style.left = '100%'
    enableButtons()

   // Emit a ent-saved event to cause a refresh
   document.dispatchEvent(new CustomEvent('ent-saved', {
    bubbles: true,
    cancelable: false,
    detail: { }
  }))
}

export { loadDeleteEntitySheet, setupDeleteEntityListeners }
