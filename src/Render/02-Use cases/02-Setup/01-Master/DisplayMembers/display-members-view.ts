import { entityChanged } from "./display-members-presenter.js"

const displayMembers = `
<div class='dropdown-container'>
  <label for="mbrs-select-entities">Choose an entity:</label>
  <select name="mbrs-select-entities" class="select-entities" id="mbrs-select-entities"> </select>
</div>

<div class="master-div-table">
  <table id="master-members" class="master-table">
    <tbody id="master-members-content">
    </tbody>
  </table>
</div>
`

const setupDropdownListeners = function () {
  const el = document.getElementById('mbrs-select-entities') as HTMLSelectElement
  if (el) {
    // el.addEventListener('click', handleDropDownEvent)
    el.addEventListener('change', handleDropDownEvent)
  }
}

function handleDropDownEvent(this: HTMLElement) {
  const el = this as HTMLSelectElement
  entityChanged(el.selectedIndex)
}

export { displayMembers, setupDropdownListeners }
