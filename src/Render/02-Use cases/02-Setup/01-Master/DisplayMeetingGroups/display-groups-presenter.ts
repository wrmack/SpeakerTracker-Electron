import { getEntities, getGroupsForCurrentEntity, setSelectedEntityId, selectedEntityId } from '../../../../01-Models/models.js'

async function loadGroupsDropdown () {
  const entities = await getEntities()
  if (selectedEntityId == 0 || selectedEntityId == undefined) {
    await setSelectedEntityId(entities[0].Id)
  }
  let options = ''
  entities.forEach( (entity) => {
    if (entity.Id == selectedEntityId) {
      options += `<option selected>${entity.EntName}</option>`
    }
    else {
      options += `<option>${entity.EntName}</option>`
    }
  })
  const ent = document.getElementById('groups-select-entities')
  if (!ent) {return}
  ent.innerHTML = options
}

async function loadGroups () {
  const groups = await getGroupsForCurrentEntity()
  let tableRows = ''
  for (const i in groups) {
    const myId = 'gp-r' + i
    tableRows += '<tr>'
    tableRows += "<td><button class='group-cell-text master-cell-btn' id=" + myId + ' >' + groups[i].GrpName + '</button> </td>'
    tableRows += '</tr>'
  }
  const cont = document.getElementById('master-groups-content')
  if (!cont) { return}
  cont.innerHTML = tableRows

  // Create custom event whenever a cell is clicked so that the detail view
  // can know which member to display.  Bubble up and add event listener to document
  // in display-selected-member-view.  Pass the id of the element clicked.
  const cells = document.querySelectorAll('.group-cell-text')
  cells.forEach(el => { el.addEventListener('click', handleSelection )})

  // When entities are loaded, select the first cell
  if (cells.length > 0) {
    cells[0].classList.add('master-cell-btn-selected')
    cells[0].dispatchEvent(new CustomEvent('group-selected', {
      bubbles: true,
      cancelable: false,
      detail: { id: cells[0].id }
    }))
  }
}

function handleSelection(this: HTMLElement)  {
  this.dispatchEvent(new CustomEvent('group-selected', {
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
  setSelectedEntityId(ent.Id)
  loadGroups()
}

export { loadGroupsDropdown, loadGroups, entityChanged }
