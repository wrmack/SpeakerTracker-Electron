import { selectedEntityId, getMembersForCurrentEntity, addEvent, execSql } from '../../../../../01-Models/models.js'
import { enableButtons } from '../../../setup-view.js'
import flatpickr from '../../../../../Flatpickr/index.js'
import { Instance } from 'flatpickr/dist/types/instance.js'
import { setSelectedEventDate } from '../../../../../01-Models/models.js'
import { getSelectedEventDate } from '../../../../../01-Models/models.js'

let memberIds: number[] = []

// Inserted into sheet
const addEventView = `
  <div class='editing-btn-container'>
    <button class='sheet-btn' id='add-event-cancel-btn'<span >Cancel</span></button>
    <button class='sheet-btn' id='add-event-save-btn'><span>Save</span></button>
  </div>
  <h1>Add a new event</h1>
  <div class='field-container'>
    <input id="test-input" class="flatpickr flatpickr-input" type="text" placeholder="Select Date.." readonly="readonly">
  </div>

`

const loadAddEventSheet = async function () {
    const edSht = document.getElementById('editing-sheet')
    if (!edSht) {return}
    edSht.innerHTML = addEventView
    const pickrInstance = flatpickr('#test-input',{}) as Instance
    console.log("pickrInstance :", pickrInstance)
    pickrInstance.config.onChange.push(function() {setSelectedEventDate(pickrInstance.selectedDates[0])})
}
  
const setupAddEventListeners = function () {
    // Cancel button
    const canBtn = document.getElementById('add-event-cancel-btn')
    if (!canBtn) {return}
    canBtn.addEventListener('click', handleCancel)

    // Save button
    const svBtn = document.getElementById('add-event-save-btn')
    if (!svBtn) {return}
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
    // const mbrTitle = document.getElementById('member-title') as HTMLInputElement
    // const newMemberTitle = mbrTitle.value 
    // const mbrFN = document.getElementById('member-first-name') as HTMLInputElement
    // const newMemberFirstName = mbrFN.value
    // const mbrLN = document.getElementById('member-last-name') as HTMLInputElement
    // const newMemberLastName = mbrLN.value

    // // Save to database
    // const entityId = selectedEntityId
    // const event = {
    //     Date: 0,
    //     Time: 0
    // }
    // await addEvent(event)
  console.log("selected date: ", getSelectedEventDate() )
    // // Add to in-memory model
    // const entity = { id: 3, name: newCouncilName }
    // entities.push(entity)

    // Close the panel
    const edSHT = document.getElementById('editing-sheet') as HTMLElement
    edSHT.style.left = '100%'
    enableButtons()

    // Emit a mbr-saved event to cause a refresh
    document.dispatchEvent(new CustomEvent('evt-saved', {
        bubbles: true,
        cancelable: false,
        detail: { }
    }))
}

export { loadAddEventSheet, setupAddEventListeners }
  