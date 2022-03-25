import { entityChanged } from "./display-groups-presenter.js"

const displayGroups = `
<div id='dropdown-container'>
  <label for="groups-select-entities">Choose an entity:</label>
  <select name="groups-select-entities" class="select-entities" id="groups-select-entities"></select>
</div>

<div class="master-div-table">
  <table id="master-groups" class="master-table">
    <tbody id="master-groups-content">
    </tbody>
  </table>
</div>
`

const setupGroupsDropdownListeners = function () {
  const el = document.getElementById('groups-select-entities') as HTMLSelectElement
  if (el) {
    // el.addEventListener('click', handleDropDownEvent)
    el.addEventListener('change', handleDropDownEvent)
  }
}

function handleDropDownEvent(this: HTMLElement) {
  const el = this as HTMLSelectElement
  entityChanged(el.selectedIndex)
}

export { displayGroups, setupGroupsDropdownListeners }
