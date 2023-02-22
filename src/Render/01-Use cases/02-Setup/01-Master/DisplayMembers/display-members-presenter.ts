import { getEntities, getMembersForCurrentEntity } from '../../../../02-Models/models.js'
import { setCurrentEntityId, currentEntityId } from '../../../../03-State/state.js'


async function loadEntitiesDropdownForMembers() {
  const entities = await getEntities()
  let options = ''
  if (currentEntityId == 0 || currentEntityId == undefined) {
    await setCurrentEntityId(entities[0].Id)
  }
  entities.forEach( (entity) => {
    if (entity.Id == currentEntityId) {
      options += `<option selected>${entity.EntName}</option>`
    }
    else {
      options += `<option>${entity.EntName}</option>`
    }
  })
  const ent = document.getElementById('mbrs-select-entities')
  if (!ent) {return}
  ent.innerHTML = options
}


async function loadMembers () {  
  const members = await getMembersForCurrentEntity()
  // if (members.length == 0) {
  //   const grpBtn = document.getElementById('setup-sidebar-groups-btn') as HTMLButtonElement
  //   if (grpBtn != null) {grpBtn.disabled = true}
  // }
  // else {
  //   const grpBtn = document.getElementById('setup-sidebar-groups-btn') as HTMLButtonElement
  //   if (grpBtn != null) {grpBtn.disabled = false}
  // }
  let tableRows = ''
  for (const i in members) {
    const myId = 'mr-r' + i
    tableRows += '<tr>'
    tableRows += "<td><button class='mbr-cell-text master-cell-btn' id=" + myId + ' >' + members[i].FirstName + ' ' + members[i].LastName + '</button> </td>'
    tableRows += '</tr>'
  }
  const memcont = document.getElementById('master-members-content')
  if (!memcont) {return}
  memcont.innerHTML = tableRows

  // Create custom event whenever a cell is clicked so that the detail view 
  // can know which member to display.  Bubble up and add event listener to document
  // in display-selected-member-view.  Pass the id of the element clicked.
  const cells = document.querySelectorAll('.mbr-cell-text')
  cells.forEach(el => { el.addEventListener('click', handleSelection )})

  // When entities are loaded, select the first cell
  if (cells.length > 0) {
    cells[0].classList.add('master-cell-btn-selected')
    cells[0].dispatchEvent(new CustomEvent('member-selected', {
      bubbles: true,
      cancelable: false,
      detail: { id: cells[0].id }
    }))
  }
}

function handleSelection(this: HTMLElement)  {
  this.dispatchEvent(new CustomEvent('member-selected', {
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

async function entityChanged(idx: number) {
  const ents = await getEntities()
  const ent = ents[idx]
  setCurrentEntityId(ent.Id)
  loadMembers()
}

export { loadEntitiesDropdownForMembers, loadMembers, entityChanged }