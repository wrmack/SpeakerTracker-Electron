import { getEventsForCurrentGroup, execSql } from '../../../../../02-Models/models.js'
import {masterRowIdx, setSelectedEventDate,getSelectedEventDate } from '../../../../../03-State/state.js'
import { enableButtons } from '../../../setup-view.js'
import flatpickr from '../../../../../04-Utils/Flatpickr/index.js'
import { Instance } from 'flatpickr/dist/types/instance.js'

const editEventView = `
<div class='editing-btn-container'>
  <button class='sheet-btn cancel-btn' id='edit-event-cancel-btn'<span >Cancel</span></button>
  <button class='sheet-btn save-btn' id='edit-event-save-btn'><span>Save</span></button>
</div>
<h1>Edit event below</h1>
<div class='field-container'>
    <input id="input-edit-event" class="flatpickr flatpickr-input" type="text" placeholder="Select Date.." readonly="readonly">
</div>
`

const loadEditEventSheet = async function () {
  const edSht = document.getElementById('editing-sheet') as HTMLElement
  edSht.innerHTML = editEventView
  const events = await getEventsForCurrentGroup()
  const event = events[masterRowIdx]
  const eventEl = document.getElementById('input-edit-event') as HTMLInputElement
  eventEl.value = event.EventDate
  const pickrInstance = flatpickr('#input-edit-event',{enableTime: true, dateFormat: "Y-m-d H:i"}) as Instance
  pickrInstance.config.onChange.push(function() {
    const selDate = pickrInstance.selectedDates[0]
    const isoDate = pickrInstance.formatDate(selDate,'Z')
    setSelectedEventDate(isoDate)
  })
}

const setupEditEventListeners = () => {
  // Cancel button
  const canBtn = document.getElementById('edit-event-cancel-btn') as HTMLButtonElement
  canBtn.addEventListener('click', handleCancel)

  // Save button
  const svBtn = document.getElementById('edit-event-save-btn') as HTMLButtonElement
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
  // Get the event that needs changing
  const events = await getEventsForCurrentGroup()
  const event = events[masterRowIdx]

  // Save to database
  const selDate = getSelectedEventDate()
  const sql = `UPDATE Events SET EventDate = '${selDate}' WHERE Events.Id = '${event.Id}';`
  await execSql(sql)

  // Close the panel
  const edSHT = document.getElementById('editing-sheet') as HTMLElement
  edSHT.style.left = '100%'
  enableButtons()

  // Emit an evt-saved event to cause a refresh
  document.dispatchEvent(new CustomEvent('evt-saved', {
      bubbles: true,
      cancelable: false,
      detail: { }
  }))
}

export { loadEditEventSheet, setupEditEventListeners }
