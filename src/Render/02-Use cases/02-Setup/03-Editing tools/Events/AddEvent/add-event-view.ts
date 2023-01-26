import { selectedGroupId, setSelectedEventDate, getSelectedEventDate, addEvent, execSql } from '../../../../../01-Models/models.js'
import { enableButtons } from '../../../setup-view.js'
import flatpickr from '../../../../../Utils/Flatpickr/index.js'
import { Instance } from 'flatpickr/dist/types/instance.js'


let memberIds: number[] = []

// Inserted into sheet
const addEventView = `
  <div class='editing-btn-container'>
    <button class='sheet-btn' id='add-event-cancel-btn'<span >Cancel</span></button>
    <button class='sheet-btn' id='add-event-save-btn'><span>Save</span></button>
  </div>
  <h1>Add a new event</h1>
  <div class='field-container'>
    <input id="input-add-event" class="flatpickr flatpickr-input" type="text" placeholder="Select Date.." readonly="readonly">
  </div>

`

const loadAddEventSheet = async function () {
    const edSht = document.getElementById('editing-sheet')
    if (!edSht) {return}
    edSht.innerHTML = addEventView
    const pickrInstance = flatpickr('#input-add-event',{enableTime: true, dateFormat: "Y-m-d H:i"}) as Instance
    pickrInstance.config.onChange.push(function() {
      const selDate = pickrInstance.selectedDates[0]
      const isoDate = pickrInstance.formatDate(selDate,'Z')
      setSelectedEventDate(isoDate)
    })
}
  
const setupAddEventListeners = function () {
    // Cancel button
    const canBtn = document.getElementById('add-event-cancel-btn')
    if (!canBtn) {return}
    canBtn.addEventListener('click', handleCancel)

    // Save button
    const svBtn = document.getElementById('add-event-save-btn')
    if (!svBtn) {return}
    svBtn.addEventListener('click', handleSave)
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

  // Save to database
  const selDate = getSelectedEventDate()
  const selGrpId = selectedGroupId
  await addEvent(selDate, selGrpId)

  // Close the panel
  const edSHT = document.getElementById('editing-sheet') as HTMLElement
  edSHT.style.left = '100%'
  enableButtons()

  // Emit a mbr-saved event to cause a refresh
  document.dispatchEvent(new CustomEvent('evt-saved', {
      bubbles: true,
      cancelable: false,
      detail: { }
  }))
}

export { loadAddEventSheet, setupAddEventListeners }
  