import { 
    getEntityAtIdx, 
    getGroupIdsForEntityId, 
    getGroupAtIdx, 
    groupIdExists, 
    entityIdExists, 
    getEventAtIdx, 
} from "../02-Models/models.js"
import {
  Entity,
  Member,
  Group,
  GroupEvent,
  DebateSpeech
} from "../../types/interfaces"

// 
// State
// 

/**
 * Terminology
 * id: is unique and usually corresponds to id field in database record
 * num: not unique - as in SectionNumber (each debate starts with SectionNumber set to 0)
 * idx: is index in array (or row in a table list)
 */

// In-memory state

/** ---------------- Selected Entity, Group, Event -------------------- */

/** Holds the id of the selected entity.
 *  This is exported and is the source of truth for
 *  the id of the entity that is currently selected.
 */
let selectedEntityId = 0

/** Holds the id of the selected group.
 *  This is exported and is the source of truth for
 *  the id of the group that is currently selected.
 */
let selectedGroupId = 0

let selectedEventId = 0

let selectedEventDate = ""

/** ---------------------- Setup ------------------------------- */

/** Store idx of selected master row */
let masterRowIdx = 0


/** ------------------ Recording meetings ---------------------- */

let currentDebateNumber: number
let currentDebateSectionNumber: number
// let currentDebateSpeechNumber = 0


/** --------------- Meeting setup sheet -------------------- */

/** Whether members on speaking table have individual timers */
let showIndividualTimers = false

/** Whether meeting is being recorded */
let meetingIsBeingRecorded = false


/**  ------- Getters and setters: selected Entity, Group, Event ---------------- */ 

/** Sets `selectedEntityId` as well as storing it in the 
 *  the database's state table.
 * @param {number} id The entity's id.
 */
const setSelectedEntityId = async (id: number) => {
  selectedEntityId = id
  const sql = `UPDATE State SET EntityId = ${id};`
  await window.myapi.connect()
  await window.myapi.selectAll(sql)
}


/** Sets `selectedGroupId` as well as storing it in the 
 *  the database's state table.
 * @param {number} id The group's id.
 */
const setSelectedGroupId = async (id: number) => {
  selectedGroupId = id
  const sql = `UPDATE State SET GroupId = ${id};`
  await window.myapi.connect()
  await window.myapi.selectAll(sql)
}

const setSelectedEventId = async (id: number) => {
  selectedEventId = id
  const sql = `UPDATE State SET EventId = ${id};`
  await window.myapi.connect()
  await window.myapi.selectAll(sql)
}

const getSavedEntGroupId = async () => {
  // Check there is saved state in database
  const rowsSql = `SELECT COUNT(*) AS RowCount FROM State;`
  await window.myapi.connect()
  const rows = await window.myapi.selectAll(rowsSql)
  if (rows[0].RowCount == 0) {
    // No saved state exists so save first group of first entity
    const ent = await getEntityAtIdx(0) as Entity
    const grpIds = await getGroupIdsForEntityId(ent.Id)
    let createRowSql = ''
    if (grpIds.length == 0) {
      createRowSql = `INSERT INTO State (EntityId) VALUES (${ent.Id})`
    }
    else {
      createRowSql = `INSERT INTO State (EntityId, GroupId) VALUES (${ent.Id}, ${grpIds[0].Id})` 
    }
    await window.myapi.selectAll(createRowSql)
    return {entId: ent.Id, grpId: grpIds[0]}
  } else {
    // Get the saved state
    const sql = `SELECT EntityId, GroupId FROM State;`
    const ret = await window.myapi.selectAll(sql)
    let entId = ret[0].EntityId as number
    let grpId = ret[0].GroupId as number
    // Sanity check entId
    const entExists = await entityIdExists(entId)
    if (!entExists) {
      const ent = await getEntityAtIdx(0)
      entId = ent.Id 
    }
    // Sanity check grpId
    const grpExists = await groupIdExists(grpId)
    if (!grpExists) {
      const grpIds = await getGroupIdsForEntityId(entId)
      if (grpIds.length > 0) {
        grpId = grpIds[0].Id
      }
    }
    return {entId: entId, grpId: grpId}
  }
}

/**
 * Sets selectedEntityId, selectedGroupId, selectedEventId 
 * with values retrieved from database 
 * using the indexes passed in.
 * Updates state in database.
 */
const setCurrentEntGroupEvtId = async (entIdx: number, grpIdx: number, evtIdx: number) => {
  const ent = await getEntityAtIdx(entIdx) as Entity
  selectedEntityId = ent.Id
  const grp = await getGroupAtIdx(grpIdx) as Group
  selectedGroupId = grp.Id
  const evt = await getEventAtIdx(evtIdx) as GroupEvent
  selectedEventId = evt.Id
  const sql = `UPDATE State SET EntityId = ${ent.Id}, GroupId = ${grp.Id}, EventId = ${evt.Id};`
  await window.myapi.selectAll(sql)
}

const setSelectedEventDate = (date: string) => {
  selectedEventDate = date
}

const getSelectedEventDate = () => {
  return selectedEventDate
}

/**  ------- Getters and setters: recording meetings ---------------- */ 

const setCurrentDebateNumber = (num: number) => {
  currentDebateNumber = num
}

/**  ------- Getters and setters: setup ---------------- */ 

const setMasterRowIdx = (idx: number) => {
  masterRowIdx = idx
}

/**  ------- Getters and setters: meeting setup sheet ---------------- */ 

function setShowIndividualTimers(showTimer: boolean) {
  showIndividualTimers = showTimer
}

function setMeetingIsBeingRecorded(on: boolean) {
  meetingIsBeingRecorded = on ? true : false
}

export {
    masterRowIdx,
    setMasterRowIdx,
    selectedEntityId,
    setSelectedEntityId,
    selectedGroupId,
    setSelectedGroupId,
    setCurrentEntGroupEvtId,
    setSelectedEventDate,
    getSavedEntGroupId,
    getSelectedEventDate,
    setShowIndividualTimers,
    showIndividualTimers,
    meetingIsBeingRecorded,
    setMeetingIsBeingRecorded,
    selectedEventId,
    setSelectedEventId,
    currentDebateNumber,
    setCurrentDebateNumber,
    currentDebateSectionNumber
}