import { selectedEntityId, selectedGroupId } from "../03-State/state.js";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare interface MyAPI {
  
  /** Connect to database */
  connect: () => Promise<void>;
  
  /** Initialise database with empty tables if they don't exist */
  initDb: () =>  Promise<void>;
  close: () => void;
  
  /** Runs SQL statements (can be more than one) in a string with no results returned.
   * 
   * node-sqlite3 API: db.exec wrapped in db.serialize  */ 
  execSQL: (arg0: string) =>  Promise<void>;
  
  /** Runs the SQL query with the specified parameters and 
   * calls the callback afterwards if there is an error. 
   * 
   * node-sqlite3 API: db.run.*/
  runSQL: (sql: string, params: any) =>  Promise<void>;

  /** Runs the SQL query with the specified parameters and calls 
   * the callback with all result rows afterwards. 
   * 
   * node-sqlite3 API: db.all wrapped in db.serialize.*/ 
  selectAll: (sql: string, val?: never[]) => Promise<any[]>;

  getPaths: () => {userData: string, appData: string, logs: string, appPath: string };

}

declare global {
  interface Window {
      myapi: MyAPI;
  }
}

// Access to sqlite3 node module

/** 
 * Execute a collection of SQL statements passed in through a string. 
 * There is no return value.
 */ 
const execSql = async function (mysql: string) {
  await window.myapi.connect()
  window.myapi.execSQL(mysql)
}

//
// Entities
//

/** Retrieve all entities.
 *  Entities are ordered by entity name. 
 * @returns Array of Entity records ordered by EntName. */ 
const getEntities = async function () {
  const sql = 'SELECT * FROM Entities ORDER BY EntName;'
  await window.myapi.connect()
  const rows = await window.myapi.selectAll(sql)
  console.log('getEntities rows: ' + rows)
  return rows
}

/** Get entity id using currently selected entity idx.
 * 
*/ 
// const getSelectedEntityId = async function () {
//   const ents = await getEntities()
//   if (ents.length > 0)  {
//     return ents[selectedEntityIdx].Id
//   }
//   else {
//     return null
//   }
// }

/** Get entity at a given row idx 
 * @param {number} idx The row index.
 * @returns An entity Promise.
 * */ 
const getEntityAtIdx = async (idx: number) => {
  const entities = await getEntities()
  const selectedEntity = entities[idx]
  return selectedEntity as Entity
}

const getEntityWithId = async (id: number) => {
  const sql = `SELECT * FROM Entities WHERE Entities.Id = ${id};`
  await window.myapi.connect()
  const ent = await window.myapi.selectAll(sql)
  return ent[0] as Entity
}

const deleteEntityWithId = async (id: number) => {
  const mysql1 = `
  DELETE FROM Entities WHERE Entities.Id = ${id};
  DELETE FROM Members WHERE Members.Entity = ${id};
  `
  await window.myapi.connect()
  await window.myapi.execSQL(mysql1)
  
  const mysql2 = `DELETE FROM Groups WHERE Groups.Entity = ${id} RETURNING Groups.Id;`
  await window.myapi.connect()
  const grpIds = await window.myapi.selectAll(mysql2)
  
  let mysql3 = ''
  grpIds.forEach( (grpId) => {
    mysql3 += `DELETE FROM GroupMembers WHERE GroupMembers.GroupId = ${grpId.Id};`
  })
  if (mysql3.length > 0) {
    await window.myapi.connect()
    await window.myapi.execSQL(mysql3)
  }
}

/**
 * Checks if the given entity id exists in the Entities table.
 * @param id the entity id being checked
 * @returns true if the entity id exists otherwise false
 */
const entityIdExists = async (id: number) => {
  const mySql = `SELECT * FROM Entities WHERE Entities.Id = ${id}`
  await window.myapi.connect()
  const ent = await window.myapi.selectAll(mySql)
  if (ent.length == 0) {
    return false
  }
  else {
    return true
  }
}

//
// Members
//

// Get member at a given row idx
const getMemberAtIdx = async (idx: number) => {
  const members = await getMembersForCurrentEntity()
  const selectedMember = members[idx]
  return selectedMember
}

// Get member with member Id
const getMemberWithId = async (id: number): Promise<{ Id: number; Title: string; FirstName: string; LastName: string; Entity: number }> => {
  const mysql = `SELECT * FROM Members WHERE Members.Id = ${id}`
  await window.myapi.connect()
  const mbr = await window.myapi.selectAll(mysql)
  return mbr[0]
}

// Retrieve all members for currently selected entity
const getMembersForCurrentEntity = async function () {
  const entityId = selectedEntityId
  const sql = 'SELECT Id, Title, FirstName, LastName FROM Members WHERE Members.Entity = ' + entityId.toString() + ';'
  console.log('getMembers sql: ' + sql)
  await window.myapi.connect()
  return await window.myapi.selectAll(sql)
}

// Retrieve all members for entity id
const getMembersForEntityId = async (entityId: number) => {
  const sql = `SELECT Title, FirstName, LastName FROM Members WHERE Members.Entity = ${entityId};`
  console.log('getMembersForEntityId sql: ' + sql)
  await window.myapi.connect()
  return await window.myapi.selectAll(sql)
}

/** Add a member */ 
const addMember = async function (member: any) {
  const sql = 'INSERT INTO Members (Title , FirstName, LastName, Entity) VALUES ($title, $firstName, $lastName, $entity);'
  await window.myapi.connect()
  window.myapi.runSQL(sql, {
    $title: member.title,
    $firstName: member.firstName,
    $lastName: member.lastName,
    $entity: member.entityId
  })
}


//
// Groups
//

/** Retrieve all meeting groups for currently selected entity */ 
const getGroupsForCurrentEntity = async function () {
  const entityId = selectedEntityId
  const sql = `SELECT Id, GrpName FROM Groups WHERE Groups.Entity = ${entityId} ORDER BY GrpName;`
  console.log('getGroups sql: ' + sql)
  await window.myapi.connect()
  return await window.myapi.selectAll(sql)
}

/** Retrieve all group ids for given entity id. 
 *  @param {number} id The entity id.
 *  @returns An array of group records containing only the Id field.
*/
const getGroupIdsForEntityId = async function (id: number) {
  const sql = `SELECT Id FROM GROUPS WHERE Groups.Entity = ${id} ORDER BY GrpName;`
  await window.myapi.connect()
  return await window.myapi.selectAll(sql)
}

/** Retrieve all groups for given entity id. 
 *  @param {number} id The entity id.
 *  @returns An array of group records containing all fields.
*/
const getGroupsForEntityId = async function (id: number) {
  const sql = `SELECT * FROM GROUPS WHERE Groups.Entity = ${id} ORDER BY GrpName;`
  await window.myapi.connect()
  return await window.myapi.selectAll(sql)
}

const getGroupAtIdx = async (idx: number) => {
  const groups = await getGroupsForCurrentEntity()
  const selectedGroup = groups[idx]
  return selectedGroup
}

/** Add a meeting group and return the new Id */ 
const addGroup = async function (group: any) {
  const sql = `
    INSERT INTO Groups (GrpName, Entity) VALUES ('${group.name}', ${group.entity}) RETURNING Id;
  `
  await window.myapi.connect()
  const groupId = await window.myapi.selectAll(sql)
  return groupId[0].Id
}

/** Retrieve group record for given group id */
const getGroupForId = async (id: number) => {
  const sql = `SELECT * FROM Groups WHERE Groups.Id = ${id};`
  await window.myapi.connect()
  const group = await window.myapi.selectAll(sql)
  return group == undefined ? undefined : group[0] as Group
}

/** 
 * Get members for a group using the group Id (primary key) and returning 
 * an array of member id records [{MemberId: value}].
 */
 const getMembersForGroupId = async (id: number) => {
  const sql = `SELECT MemberId FROM GroupMembers WHERE GroupId = ${id};`
  await window.myapi.connect()
  const mbrIds = await window.myapi.selectAll(sql)
  return mbrIds 
}

/**
 * Checks if the given group id exists in the Groups table.
 * @param id the group id
 * @returns true if the group id exists otherwise false
 */
const groupIdExists = async (id: number) => {
  const sql = `SELECT * FROM Groups WHERE Id = ${id}`
  await window.myapi.connect()
  const group = await window.myapi.selectAll(sql)
  if (group.length == 0) {
    return false
  }
  else {
    return true
  }
}

//
// Events
//
// An event's data are:
// - Id
// - meeting group (relationship one-to-many: an event can belong to only 1 group; a group can have many events )
// - date of event
// - debates (relationship)
// A debate's data are 
// - debate number
// - text note
// - debate sections (relationship)
// A debate section's data are 
// - section name (main, amendment)
// - section number
// - debate (relationship) 
// - speech events (relationship)
// A speech event's data are 
// - start time
// - elapsed minutes
// - elapsed seconds
// - member (relationship)
// - debate section (relationship one-to-one)


const addEvent = async (eventDate: string, groupId: number) => {
  const sql = 'INSERT INTO Events (GroupId, EventDate) VALUES ($groupId, $eventDate);'
  await window.myapi.connect()
  await window.myapi.runSQL(sql, {$groupId: groupId, $eventDate: eventDate})
}

const getEventsForCurrentGroup = async () => {
  const groupId = selectedGroupId
  const sql = `SELECT Id, GroupId, EventDate FROM Events WHERE Events.GroupId = ${groupId} ORDER BY EventDate;`
  await window.myapi.connect()
  return await window.myapi.selectAll(sql) as GroupEvent[]
}

const getEventAtIdx = async (idx: number) => {
  const events = await getEventsForCurrentGroup() 
  const selectedEvent = events[idx]
  return selectedEvent 
}

const addDebateSpeech = async (memberId: number, startTime: string, seconds: number, sectionId: number) => {
 const sql = `INSERT INTO DebateSpeeches (MemberId, StartTime, Seconds, SectionId) VALUES (${memberId}, ${startTime}, ${seconds}, ${sectionId});`
 await window.myapi.connect()
 await window.myapi.selectAll(sql)
}


 
//
// Models for entity, group, member, event which mirror database
//

// Property labels uppercase consistent with database field names
interface Entity {
  Id: number,
  EntName: string
}

// Property labels lowercase - legacy
interface Member {
  id: number,
  title: string,
  firstName: string,
  lastName: string
}

interface Group {
  Id: number,
  GrpName: string,
  Entity: number
}

// Use GroupEvent to avoid clash with in-built Event
interface GroupEvent {
  Id: number,
  GroupId: number,
  EventDate: string
}

interface DebateSpeech {
  Id: number,
  StartTime: string,
  Seconds: number,
  SectionId: number,
  MemberId: number
}

//
// Model for managing data for speaking table - does not mirror database
//

/** .play, .pause_stop, .play_stop, off */
enum TimerButtonMode {
  play,
  pause_stop,
  play_stop,
  off
}

enum SectionType {
  mainDebate,
  amendment,
  off
}

interface ListMember {
  row: number,
  member: Member,
  startTime: Date | null,
  speakingTime: number,
  timerButtonMode: TimerButtonMode,
  timerIsActive: boolean
}

interface SectionList {
  sectionNumber: number,
  sectionType: SectionType,
  sectionHeader: string,
  sectionMembers: ListMember[]
}

interface SpeakingTable {
  id: number,
  sectionLists: SectionList[]
}




export {
  execSql,
  getEntities,
  getEntityAtIdx,
  getEntityWithId,
  deleteEntityWithId,
  getMembersForCurrentEntity,
  getMemberAtIdx,
  getMemberWithId,
  getMembersForEntityId,
  addMember,
  addGroup,
  addEvent,
  addDebateSpeech,
  getMembersForGroupId,
  getGroupAtIdx,
  getGroupForId,
  getGroupsForCurrentEntity,
  getGroupIdsForEntityId,
  getGroupsForEntityId,
  groupIdExists,
  entityIdExists,
  getEventsForCurrentGroup,
  getEventAtIdx,
  TimerButtonMode,
  SectionType,
  SectionList,
  SpeakingTable,
  ListMember,
  Entity,
  Member,
  Group,
  GroupEvent,
  DebateSpeech
}