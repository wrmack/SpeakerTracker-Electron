import { report } from 'process'
import { Group, Debate, ReportDetailsViewModel, ReportEventViewModel, DebateViewModel, DebateSection, DebateSectionViewModel, DebateSpeechViewModel, DebateSpeech } from '../../../types/interfaces.js'
import { setCurrentEntityId,  currentEntityId, setCurrentGroupId } from '../../03-State/state.js'
import { 
  getEntities, 
  getEntityWithId, 
  getClosedEventsForCurrentGroup, 
  getEventWithId,
  getMemberWithId,
  getGroupAtIdx, 
  getGroupsForCurrentEntity,
  getDebatesForEventId,
  getDebateSections,
  getDebateSectionSpeeches,  
  getGroupForId
} from '../../02-Models/models.js'




async function loadEntitiesDropdownForGroups () {
  const entities = await getEntities()
  if (currentEntityId == 0 || currentEntityId == undefined) {
    await setCurrentEntityId(entities[0].Id)
  }
  let options = ''
  entities.forEach( (entity) => {
    if (entity.Id == currentEntityId) {
      options += `<option selected>${entity.EntName}</option>`
    }
    else {
      options += `<option>${entity.EntName}</option>`
    }
  })
  const ent = document.getElementById('reports-select-entities')
  if (!ent) {return}
  ent.innerHTML = options
}

async function loadGroups () {
  const groups = await getGroupsForCurrentEntity()
  let tableRows = ''
  for (const i in groups) {
    const myId = 'gp-r' + i
    tableRows += '<tr>'
    tableRows += "<td><button class='group-cell-text master-cell-btn' id=" + myId + ' >' + groups[i].GrpName + '</button> </td>'
    tableRows += '</tr>'
  }
  const cont = document.getElementById('master-report-groups-content')
  if (!cont) { return}
  cont.innerHTML = tableRows

  // Create custom event whenever a cell is clicked so that the detail view
  // can know which member to display.  Bubble up and add event listener to document
  // in display-selected-member-view.  Pass the id of the element clicked.
  const cells = document.querySelectorAll('.group-cell-text')
  cells.forEach(el => { el.addEventListener('click', handleSelection )})

  // When entities are loaded, select the first cell
  if (cells.length > 0) {
    cells[0].classList.add('master-cell-btn-selected')
    cells[0].dispatchEvent(new CustomEvent('report-group-selected', {
      bubbles: true,
      cancelable: false,
      detail: { id: cells[0].id }
    }))
  }
}

function handleSelection(this: HTMLElement)  {
  this.dispatchEvent(new CustomEvent('report-group-selected', {
    bubbles: true,
    cancelable: false,
    detail: { id: this.id }
  }))
  const cells = document.getElementsByClassName('master-cell-btn')
  if (cells.length > 0) {
    for (let i = 0; i < cells.length; ++i) {
      cells[i].classList.remove('master-cell-btn-selected')
    }
    this.classList.add('master-cell-btn-selected')
  }
}

async function entityChanged(idx: number) {
  const ents = await getEntities()
  const ent = ents[idx]
  setCurrentEntityId(ent.Id)
  loadGroups()
}

/** ---------------  Detail  ------------------- */

const getReportsForGroupAtIdx = async (idx: number) => {
  // Get the group
  const group = await getGroupAtIdx(idx) 
  setCurrentGroupId(group.Id)

  // Get the events for the group
  // Each Event has Event.ID, GroupID, EventDate
  const events = await getClosedEventsForCurrentGroup()

  // Build the view model
  let reportEvents: ReportEventViewModel[] = []

  events.forEach((event) => {
    const reportEvent: ReportEventViewModel = {
      EventId: event.Id,
      GroupName: group.GrpName,
      Date: event.EventDate
    }
    reportEvents.push(reportEvent)
  })
  
  // Return the view model
  return reportEvents
}

// Refer to interfaces.d.ts for view models
const getReportDetailsForEventId = async (eventId: number) => {
  // Get the debates
  let debatesForReport: DebateViewModel[] = []
  const debates = await getDebatesForEventId(eventId) as Debate[]

  // Get the sections in each debate
  for (const debate of debates) {
    const debateSections = await getDebateSections(debate.EventId, debate.DebateNumber) 
    let sectionsForDebate: DebateSectionViewModel[] = []

    for (const section of debateSections) {
      const sectionName = section.SectionName
      const speeches = await getDebateSectionSpeeches(debate.EventId, debate.DebateNumber, section.SectionNumber) as DebateSpeech[]
      let speechesArray: DebateSpeechViewModel[] = []

      for (const speech of speeches) {
        const member = await getMemberWithId(speech.MemberId)
        const memberName = member.FirstName + " " + member.LastName
        const speechViewModel = { MemberName: memberName, StartTime: speech.StartTime, SpeakingTime: speech.Seconds.toString() } as DebateSpeechViewModel
        speechesArray.push(speechViewModel)        
      }
      const sectionViewModel = { SectionName: sectionName, DebateSpeeches: speechesArray } as DebateSectionViewModel
      sectionsForDebate.push(sectionViewModel)
    }
    const debateViewModel = {DebateNote: debate.Note, DebateSections: sectionsForDebate} as DebateViewModel
    debatesForReport.push(debateViewModel)
  }



  // debates.forEach( async (debate) => {
  //   const debateSections = await getDebateSections(debate.EventId, debate.DebateNumber) 
  //   let sectionsForDebate: DebateSectionViewModel[] = []

  //   // Get the speeches in each section
  //   debateSections.forEach(async (section) => {
  //     const sectionName = section.SectionName
  //     const speeches = await getDebateSectionSpeeches(debate.EventId, debate.DebateNumber, section.SectionNumber) as DebateSpeech[]
  //     let speechesArray: DebateSpeechViewModel[] = []
  //     speeches.forEach(async (speech) => {
  //       const member = await getMemberWithId(speech.MemberId)
  //       const memberName = member.FirstName + " " + member.LastName
  //       const speechViewModel = { MemberName: memberName, StartTime: speech.StartTime, SpeakingTime: speech.Seconds.toString() } as DebateSpeechViewModel
  //       speechesArray.push(speechViewModel)
  //     })

  //     const sectionViewModel = { SectionName: sectionName, DebateSpeeches: speechesArray } as DebateSectionViewModel
  //     sectionsForDebate.push(sectionViewModel)
  //   })

  //   const debateViewModel = {DebateNote: debate.Note, DebateSections: sectionsForDebate} as DebateViewModel
  //   debatesForReport.push(debateViewModel)
  // })

  // Build the final ReportDetailsViewModel
  const evt = await getEventWithId(eventId)
  const grp = await getGroupForId(evt.GroupId)
  if (!grp?.GrpName) {return}
  const reportDetails = {MeetingGroupName: grp.GrpName, Date: evt.EventDate, Debates: debatesForReport}
  return reportDetails
} 

export{
    entityChanged,
    loadEntitiesDropdownForGroups,
    loadGroups,
    getReportsForGroupAtIdx,
    getReportDetailsForEventId
}