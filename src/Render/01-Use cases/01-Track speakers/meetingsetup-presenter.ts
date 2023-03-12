import {
    getEntities,
    getEntityAtIdx,
    getGroupsForEntityId,
    getOpenEventsForCurrentGroup,
    addDebate,
    addDebateSection
} from "../../02-Models/models.js"

import {
    currentEntityId,
    currentGroupId,
    currentEventId,
    setCurrentEntityId,
    setCurrentEntGroupEvtId,
    setCurrentDebateNumber,
    setMeetingIsBeingRecorded
} from "../../03-State/state.js"

import { formatIsoDate } from "../../04-Utils/utils.js"


async function populateEntityDropdown() {
  let options = ''
  const entities = await getEntities()
  if (entities.length == 0) {
    options += `<option disabled selected hidden>Go to Setup: create an Entity</option>`
    const entEl = document.getElementById('mtgsetup-select-entity')
    if (entEl) {entEl.classList.add("mtgsetup-prompt") }
  }
  else {
    entities.forEach( (entity) => {
      if (entity.Id == currentEntityId) {
        options += `<option selected>${entity.EntName}</option>`
      }
      else {
        options += `<option>${entity.EntName}</option>`
      }
    })
  }
  return options
}

async function populateGroupDropdown() {
  let options = ''
  const groups = await getGroupsForEntityId(currentEntityId)
  if (groups == undefined || groups.length == 0) {
    options += `<option disabled selected hidden>Go to Setup: create a Meeting group</option>`
    const entEl = document.getElementById('mtgsetup-select-group')
    if (entEl) {entEl.classList.add("mtgsetup-prompt") }
  }
  else {
    groups.forEach( async (group) => {
      if (group.Id == currentGroupId) {
        options += `<option selected>${group.GrpName}</option>`
      }
      else {
        options += `<option>${group.GrpName}</option>`
      }
    })
  }
  return options
}

async function populateEventsDropdown() {
  let options = ''
  const events = await getOpenEventsForCurrentGroup()
  if (events === undefined || events.length == 0) {
    options += `<option disabled selected hidden>Go to Setup: create a Meeting event</option>`
    const entEl = document.getElementById('mtgsetup-select-event')
    if (entEl) {entEl.classList.add("mtgsetup-prompt") }
  }
  else {
    let idx = 0
    events.forEach( async (event) => {
      const date = formatIsoDate(event.EventDate)
      // Select the first event
      if (idx == 0) {
        options += `<option selected>${date}</option>`
        idx += 1
      }
      else {
        options += `<option>${date}</option>`
      }
    })
  }
  return options
}

/**
 * Called after a new meeting is created in meeting setup.
 * @param entityIdx 
 * @param groupIdx 
 * @param eventIdx 
 * @param isRecorded 
 */
async function updateDataForNewMeeting(entityIdx: number, groupIdx: number, eventIdx: number | null, isRecorded: boolean ) {
  await setCurrentEntGroupEvtId(entityIdx,groupIdx,eventIdx)
  setCurrentDebateNumber(0)
  if (currentEventId !== null) {
    await addDebate(currentEventId, 0)
    await addDebateSection(currentEventId,0,0, "Main debate")
  }
  else if (isRecorded === true) { console.warn("currentEventId is null!")}
  setMeetingIsBeingRecorded(isRecorded)
}

/**
 * Gets the entity id given the index passed in.
 * Sets the global `currentEntityId` then causes the group
 * dropdown to be repopulated.
 * @param newEntityIdx The index of the current entity.
 */
async function entityChanged(newEntityIdx: number) {
    const ent = await getEntityAtIdx(newEntityIdx)
    await setCurrentEntityId(ent.Id)
}

async function eventDateChanged(idx: number) {

}

export {
    populateEntityDropdown, 
    populateGroupDropdown, 
    populateEventsDropdown,
    updateDataForNewMeeting,
    entityChanged,
    eventDateChanged
}