import { eventsEntityChanged, eventsGroupChanged } from "./display-events-presenter.js"

const displayEvents = `
<div class='dropdown-container'>
  <label for="events-select-entities">Choose an entity:</label>
  <select name="events-select-entities" class="select-entities" id="events-select-entities"></select>
</div>
<div class='dropdown-container'>
  <label for="events-select-groups">Choose a group:</label>
  <select name="events-select-groups" class="select-entities" id="events-select-groups"></select>
</div>

<div class="master-div-table">
  <table id="master-events" class="master-table">
    <tbody id="master-events-content">
    </tbody>
  </table>
</div>
`

const setupEventsDropdownListeners = function () {
    const ent = document.getElementById('events-select-entities') as HTMLSelectElement
    if (ent) {
      ent.addEventListener('change', handleEntityDropDownChange)
    }
    const grp = document.getElementById('events-select-groups') as HTMLSelectElement
    if (grp) {
      grp.addEventListener('change', handleGroupDropDownChange)
    }
  }
  
function handleEntityDropDownChange(this: HTMLElement) {
  const el = this as HTMLSelectElement
  eventsEntityChanged(el.selectedIndex)
}

function handleGroupDropDownChange(this: HTMLElement) {
  const el = this as HTMLSelectElement
  eventsGroupChanged(el.selectedIndex)
}

export { displayEvents, setupEventsDropdownListeners }