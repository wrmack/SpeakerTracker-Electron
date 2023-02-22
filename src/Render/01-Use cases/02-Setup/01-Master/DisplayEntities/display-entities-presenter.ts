import { getEntities } from '../../../../02-Models/models.js';

/**
 * 
 * @returns number of entities
 */
async function loadEntities () {
  const entities = await getEntities()
  const numEntities = entities.length
  const mbrsBtn = document.getElementById('setup-sidebar-mbrs-btn') as HTMLButtonElement
  const grpBtn = document.getElementById('setup-sidebar-groups-btn') as HTMLButtonElement
  const evtBn = document.getElementById('setup-sidebar-events-btn') as HTMLButtonElement
  // if (entities.length == 0){
  //   mbrsBtn.disabled = true
  //   grpBtn.disabled = true
  //   evtBn.disabled = true
  // }
  // else {
  //   mbrsBtn.disabled = false
  //   grpBtn.disabled = false
  // }
  let tableRows = ''
  for (const i in entities) {
    const myId = 'en-r' + i
    tableRows += '<tr>'
    tableRows += `<td><button class='ent-cell-btn master-cell-btn' id='${myId}' > ${entities[i].EntName}</button> </td>`
    tableRows += '</tr>'
  }
  const cntnt = document.getElementById('master-entities-content');
  if (!cntnt) { return }
  cntnt.innerHTML = tableRows;

  // Create custom event.  Bubble up and add event listener to document
  // in display-selected-entity-view.  Pass the id attribute of the element clicked.
  const cells = document.querySelectorAll('.ent-cell-btn') 
  cells.forEach(el  => el.addEventListener('click', () => {
    handleSelection(el)
    el.dispatchEvent(new CustomEvent('entity-selected', {
      bubbles: true,
      cancelable: false,
      detail: { id: el.id }
    }))
  }))

  // When entities are loaded, select the first cell
  if (cells.length > 0) {
    cells[0].dispatchEvent(new CustomEvent('entity-selected', {
      bubbles: true,
      cancelable: false,
      detail: { id: cells[0].id }
    }))
    handleSelection(cells[0])
  }
  return numEntities
}

const handleSelection = (el: Element) => {
  const cells = document.getElementsByClassName('master-cell-btn')
  for (let i = 0; i < cells.length; ++i) {
    cells[i].classList.remove('master-cell-btn-selected')
  }
  el.classList.add('master-cell-btn-selected')
}

export { loadEntities }
