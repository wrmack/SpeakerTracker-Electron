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


/**
 * ----------------- State ------------------
 * 
 * Variables which hold in-memory state.
 * 
 */

let debug = false
/**
 * Terminology
 * id: is unique and usually corresponds to id field in database record; ids in database commence at 1
 * num: not unique - as in SectionNumber (each debate starts with DebateNumber and SectionNumber set to 0)
 * idx: is index in array (or row in a table list); indices commence at 0
 */


/** ---------------- Selected Entity, Group, Event -------------------- */

/** Holds the id of the current entity.
 *  This is exported and is the source of truth for
 *  the id of the entity that is currently selected.
 */
let currentEntityId = 0

/** Holds the id of the current group.
 *  This is exported and is the source of truth for
 *  the id of the group that is currently selected.
 */
let currentGroupId = 0

let currentEventId: number | null = null

let currentEventDate = ""

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
const setCurrentEntityId = async (id: number) => {
  currentEntityId = id
  const sql = `UPDATE State SET EntityId = ${id};`
  await window.myapi.connect()
  await window.myapi.selectAll(sql)
}


/** Sets `selectedGroupId` as well as storing it in the 
 *  the database's state table.
 * @param {number} id The group's id.
 */
const setCurrentGroupId = async (id: number) => {
  currentGroupId = id
  const sql = `UPDATE State SET GroupId = ${id};`
  await window.myapi.connect()
  await window.myapi.selectAll(sql)
}

const setCurrentEventId = async (id: number) => {
  currentEventId = id
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
 * Sets currentEntityId, currentGroupId, currentEventId 
 * with values retrieved from database 
 * using the indexes passed in.
 * Updates state in database.
 */
const setCurrentEntGroupEvtId = async (entIdx: number, grpIdx: number, evtIdx: number | null) => {
  const ent = await getEntityAtIdx(entIdx) as Entity
  currentEntityId = ent.Id
  const grp = await getGroupAtIdx(grpIdx) as Group
  currentGroupId = grp.Id
  let evtId
  if (evtIdx !== null) {
    const evt = await getEventAtIdx(evtIdx) as GroupEvent
    evtId = evt.Id
  }
  else evtId = null
  currentEventId = evtId
  const sql = `UPDATE State SET EntityId = ${ent.Id}, GroupId = ${grp.Id}, EventId = ${evtId};`
  await window.myapi.selectAll(sql)
}

const setCurrentEventDate = (date: string) => {
  currentEventDate = date
}

const getCurrentEventDate = () => {
  return currentEventDate
}

/**  ------- Getters and setters: recording meetings ---------------- */ 

/**
 * Sets the currentDebateNumber variable.
 * Debate numbers start at 0.
 * @param num the current debate number
 */
const setCurrentDebateNumber = (num: number) => {
  currentDebateNumber = num
}

const setCurrentDebateSectionNumber = (sectionNum: number) => {
  currentDebateSectionNumber = sectionNum
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
    currentEntityId,
    setCurrentEntityId,
    currentGroupId,
    setCurrentGroupId,
    setCurrentEntGroupEvtId,
    setCurrentEventDate,
    getSavedEntGroupId,
    getCurrentEventDate,
    setShowIndividualTimers,
    showIndividualTimers,
    meetingIsBeingRecorded,
    setMeetingIsBeingRecorded,
    currentEventId,
    setCurrentEventId,
    currentDebateNumber,
    setCurrentDebateNumber,
    setCurrentDebateSectionNumber,
    currentDebateSectionNumber
}