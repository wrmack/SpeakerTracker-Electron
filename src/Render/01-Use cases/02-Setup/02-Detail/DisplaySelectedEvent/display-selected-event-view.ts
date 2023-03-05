import { getOpenEventAtIdx, getGroupForId, getEntityWithId } from '../../../../02-Models/models.js'
import { setMasterRowIdx } from '../../../../03-State/state.js'
import { formatIsoDate } from '../../../../04-Utils/utils.js'

const displaySelectedEvent = `
  <div id='selected-event'>
    <div class='detail-row'>
      <span class='detail-key'>Entity:</span><span class='detail-value' id='event-entity'></span>
    </div>
    <div class='detail-row'>
      <span class='detail-key'>Meeting group:</span><span class='detail-value' id='event-group'></span>
    </div>
    <div class='detail-row'>
      <span class='detail-key'>Event date:</span><span class='detail-value' id='event-date'></span>
    </div>
  </div>
`
// Listens for the 'event-selected' event
const setupEventDetailListeners = function () {
  document.addEventListener('event-selected', handleEventSelected)
}

async function handleEventSelected (ev: Event) {
  if (ev instanceof CustomEvent) {
    // Get row index
    const rowStrg = ev.detail.id.slice(4)
    const rowNumber = parseInt(rowStrg)

    // Get event on that row
    const event = await getOpenEventAtIdx(rowNumber)
    const eventDate = event.EventDate
    const dateString = formatIsoDate(eventDate)

    // Get group from event and entity from group
    const group = await getGroupForId(event.GroupId)
    let groupName = ""
    let entityName = ""
    if (group) {
      groupName = group.GrpName 
      const entity = await getEntityWithId(group.Entity)
      entityName = entity.EntName
    }

    // Inject into html
    const evEnt = document.getElementById('event-entity')
    if (!evEnt) {return}
    evEnt.innerHTML = entityName
    const evGrp= document.getElementById('event-group');
    if (!evGrp) {return}
    evGrp.innerHTML = groupName
    const evDate = document.getElementById('event-date');
    if (!evDate) {return}
    evDate.innerHTML = dateString
    
    setMasterRowIdx(rowNumber)
  }
}


export { displaySelectedEvent, setupEventDetailListeners }
