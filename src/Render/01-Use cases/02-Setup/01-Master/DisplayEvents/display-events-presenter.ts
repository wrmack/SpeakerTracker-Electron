import { 
  getEntities, 
  getGroupsForCurrentEntity, 
  getOpenEventsForCurrentGroup,  
} from '../../../../02-Models/models.js'
import { 
  setCurrentEntityId,  
  setCurrentGroupId, 
  currentEntityId, 
  currentGroupId  
} from '../../../../03-State/state.js'
import { formatIsoDate } from '../../../../04-Utils/utils.js'

async function loadEntitiesDropdownForEvents () {
  const entities = await getEntities()
  if (currentEntityId == 0 || currentEntityId == undefined) {
    await setCurrentEntityId(entities[0].Id)
  }
  let options = ''
  entities.forEach( (entity) => {
    if (entity.Id == currentEntityId) {
      options += `<option selected>${entity.EntName}</option>`
    }
    else {
      options += `<option>${entity.EntName}</option>`
    }
  })
  const ent = document.getElementById('events-select-entities')
  if (!ent) {return}
  ent.innerHTML = options
}

async function loadGroupsDropdownForEvents () {
  const groups = await getGroupsForCurrentEntity()
  await setCurrentGroupId(groups[0].Id)
  let options = ''
  groups.forEach( (group) => {
    if (group.Id == currentGroupId) {
      options += `<option selected>${group.GrpName}</option>`
    }
    else {
      options += `<option>${group.GrpName}</option>`
    }
  })
  const grp = document.getElementById('events-select-groups')
  if (!grp) {return}
  grp.innerHTML = options
}
  
async function loadEvents () {
  const events = await getOpenEventsForCurrentGroup()
  let tableRows = ''
  for (const i in events) {
    const isoDateStr = events[i].EventDate
    const fullString = formatIsoDate(isoDateStr)
    const myId = 'ev-r' + i
    tableRows += '<tr>'
    tableRows += "<td><button class='evt-cell-text master-cell-btn' id=" + myId + ' >' + fullString + '</button> </td>'
    tableRows += '</tr>'
  }
  const cont = document.getElementById('master-events-content')
  if (!cont) { return}
  cont.innerHTML = tableRows

  // Create custom event whenever a cell is clicked so that the detail view
  // can know which member to display.  Bubble up and add event listener to document
  // in display-selected-member-view.  Pass the id of the element clicked.
  const cells = document.querySelectorAll('.evt-cell-text')
  cells.forEach(el => { el.addEventListener('click', handleSelection )})

  // When events are loaded, select the first cell
  if (cells.length > 0) {
    cells[0].classList.add('master-cell-btn-selected')
    cells[0].dispatchEvent(new CustomEvent('event-selected', {
      bubbles: true,
      cancelable: false,
      detail: { id: cells[0].id }
    }))
  }
}

function handleSelection(this: HTMLElement)  {
  this.dispatchEvent(new CustomEvent('event-selected', {
    bubbles: true,
    cancelable: false,
    detail: { id: this.id }
  }))
  const cells = document.getElementsByClassName('master-cell-btn')
  if (cells.length > 0) {
    for (let i = 0; i < cells.length; ++i) {
      cells[i].classList.remove('master-cell-btn-selected')
    }
    this.classList.add('master-cell-btn-selected')
  }
}

async function eventsEntityChanged(idx: number) {
  const ents = await getEntities()
  const ent = ents[idx]
  setCurrentEntityId(ent.Id)
  await loadGroupsDropdownForEvents()
  await eventsGroupChanged(0)
}

async function eventsGroupChanged(idx: number) {
  const grps = await getGroupsForCurrentEntity()
  const grp = grps[idx]
  setCurrentGroupId(grp.Id)
  loadEvents()
}

export { loadEntitiesDropdownForEvents, loadGroupsDropdownForEvents, loadEvents, eventsEntityChanged, eventsGroupChanged }