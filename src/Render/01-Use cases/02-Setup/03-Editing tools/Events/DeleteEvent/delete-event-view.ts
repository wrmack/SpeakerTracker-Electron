import { execSql, getEventsForCurrentGroup, getGroupForId, getEntityWithId } from '../../../../../02-Models/models.js'
import {masterRowIdx} from '../../../../../03-State/state.js'
import { enableButtons } from '../../../setup-view.js'

const deleteEventView = `
<div class='editing-btn-container'>
    <button class='sheet-btn cancel-btn' id='delete-event-cancel-btn'<span >Cancel</span></button>
    <button class='sheet-btn save-btn delete' id='delete-event-save-btn'><span>DELETE</span></button>
</div>
<h1>This will delete the event below</h1>
<div id='selected-event'>
    <div class='detail-row'>
        <span class='detail-key'>Entity:</span><span class='detail-value' id='delete-event-entity'></span>
    </div>
    <div class='detail-row'>
        <span class='detail-key'>Meeting group:</span><span class='detail-value' id='delete-event-group'></span>
    </div>
    <div class='detail-row'>
        <span class='detail-key'>Event date:</span><span class='detail-value' id='delete-event-date'></span>
    </div>
</div>
`

const loadDeleteEventSheet = async function () {
    // Inject template into DOM
    const edSht = document.getElementById('editing-sheet') as HTMLElement
    edSht.innerHTML = deleteEventView

    // Get event to be deleted
    const events = await getEventsForCurrentGroup()
    const event = events[masterRowIdx]

    // Get group, entity and date and inject into DOM
    const group = await getGroupForId(event.GroupId)
    if (!group) {return}
    const entity = await getEntityWithId(group.Entity)
    if (!entity) { return }
    
    const delEntity = document.getElementById('delete-event-entity') as HTMLInputElement
    delEntity.innerHTML = entity.EntName
    const delGroup = document.getElementById('delete-event-group') as HTMLInputElement
    delGroup.innerHTML = group.GrpName
    const delDate = document.getElementById('delete-event-date') as HTMLInputElement
    delDate.innerHTML = event.EventDate
}

const setupDeleteEventListeners = function () {
  // Cancel button
  const canBtn = document.getElementById('delete-event-cancel-btn') as HTMLButtonElement
  canBtn.addEventListener('click', handleCancel)

  // Delete button
  const delBtn = document.getElementById('delete-event-save-btn') as HTMLButtonElement
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
  const events = await getEventsForCurrentGroup()
  const event = events[masterRowIdx]
  
  // Delete in database
  const sql = `DELETE FROM Events WHERE Events.Id = ${event.Id};`
  await execSql(sql)

  // Close the panel
  const edSHt = document.getElementById('editing-sheet') as HTMLElement
  edSHt.style.left = '100%'
  enableButtons()

   // Emit a mbr-saved event to cause a refresh
   document.dispatchEvent(new CustomEvent('evt-saved', {
    bubbles: true,
    cancelable: false,
    detail: { }
  }))
}

export { loadDeleteEventSheet, setupDeleteEventListeners }
