import { 
    getEntityAtIdx, 
    getGroupIdsForEntityId, 
    getGroupAtIdx, 
    groupIdExists, 
    entityIdExists, 
    getEventAtIdx, 
    Entity,
    Group,
    GroupEvent 
} from "../02-Models/models.js"

// 
// State
// 


// In-memory state

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

/** Store idx of selected master row */
let masterRowIdx = 0

/** Whether members on speaking table have individual timers */
let showIndividualTimers = false


// Getters and setters

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

const setMasterRowIdx = (idx: number) => {
  masterRowIdx = idx
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


function setShowIndividualTimers(showTimer: boolean) {
  showIndividualTimers = showTimer
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
}