import { 
  entityChanged, 
  loadEntitiesDropdownForGroups, 
  loadGroups, 
  getReportsForGroupAtIdx,
  getReportsForCurrentGroup,
  getReportDetailsForEventId,
  deleteReportsForEventIds
 } from "./reports-presenter.js"
 
import { jsPDF } from "../../../types/jspdf"
import { DebateSectionViewModel, DebateSpeechViewModel, DebateViewModel, ReportEventViewModel } from "../../../types/interfaces.js"
import { formatIsoDate } from "../../04-Utils/utils.js"
import { report } from "process"

const reportsView = `
<div id='reports-topbar-container'>
  <div id='reports-topbar-heading' class='reports-topbar-item'>Reports</div>
  <div id='reports-topbar-items-container'>
    <div id='reports-topbar-meetinggroups' class='reports-topbar-item'>Meeting groups</div>
    <button id='reports-topbar-edit' class='reports-topbar-item'>Edit</button>
    <div id='reports-topbar-trash-cancel'>
      <button id='reports-topbar-trash' class='reports-topbar-item'></button>
      <button id='reports-topbar-cancel' class='reports-topbar-item'>Cancel</button>
    </div>
  </div>
</div>
<div id="reports-content-container">
  <div id="reports-master">
    <div class='dropdown-container'>
      <label for="reports-select-entities">Choose an entity:</label>
      <select name="reports-select-entities" class="select-entities" id="reports-select-entities"></select>
    </div>
    <div class="master-div-table">
      <table id="master-report-groups" class="master-table">
        <tbody id="master-report-groups-content">
        </tbody>
      </table>
    </div>
  </div>
  <div id="reports-detail">
    <div id="loader"></div>
    <div id="reports-cards"></div>
  </div>
</div>
`


const setupReports = async () => {
  setupReportsEntitiesDropdownListeners()
  await loadEntitiesDropdownForGroups()
  setupReportDetailListeners()
  await loadGroups()
  const edit = document.getElementById('reports-topbar-edit')
  edit?.addEventListener('click', handleEditClicked)
  const trash = document.getElementById('reports-topbar-trash')
  trash?.addEventListener('click', handleTrashClicked)
  const cancel = document.getElementById('reports-topbar-cancel')
  cancel?.addEventListener('click', handleCancelClicked)
}


const setupReportsEntitiesDropdownListeners = function () {
  const el = document.getElementById('reports-select-entities') as HTMLSelectElement
  if (el) {
    el.addEventListener('change', handleDropDownEvent)
  }
}

function handleDropDownEvent(this: HTMLElement) {
  const el = this as HTMLSelectElement
  entityChanged(el.selectedIndex)
}

/** ---------------  Detail  ------------------- */

declare global {
  interface Window {
    jspdf: any
  }
}

const setupReportDetailListeners = function () {
  document.addEventListener('report-group-selected', handleReportGroupSelected )
  const pdfviewer = document.getElementById('pdf-viewer')
  if (pdfviewer) {
    pdfviewer.addEventListener('blur', () => {
      pdfviewer.style.visibility = 'hidden'
    })
  }
}

const handleReportGroupSelected = async (event: Event) => {
  if (!(event instanceof CustomEvent)) { return }
 
  // Get reports for selected group using row index
  const rowStrg = event.detail.id.slice(4)
  const rowNumber = parseInt(rowStrg)
  const reports = await getReportsForGroupAtIdx(rowNumber)
  createCardsFromReportsViewModel(reports)
}

// Cannot use an arrow function - does not bind to 'this'
const handleReportCardClick = async function (this: HTMLElement, ev: Event)  {
  // Start spinner
  const spinner = document.getElementById('loader') as HTMLDivElement
  spinner.style.display = 'block'
  // Get event id of the event relating to the report that was clicked
  const reportId = this.id
  const eventId = parseInt(reportId.slice(6))
  const rptDetails = await getReportDetailsForEventId(eventId)

  const jsPDF = window.jspdf.jsPDF
  // Default export is a4 paper, portrait, using millimeters for units (210 x 297 mm)
  const doc: jsPDF = new jsPDF()
  doc.setDisplayMode("50%")
  
  let y = 0
  // Meeting group name
  y = 20
  doc.setFont('helvetica','bold')
  doc.setFontSize(14)
  
  if (!rptDetails?.MeetingGroupName) {return}
  doc.text(rptDetails.MeetingGroupName, 105, y, {"align":"center"})
  
  // Meeting date
  y += 15
  doc.setFontSize(12)
  const fullDate = formatIsoDate(rptDetails.Date)
  doc.text(`${fullDate}`, 105, y, {"align":"center"})

  // Heading - debates
  y += 15
  doc.text("Debates", 10, y)

  // Debates
  doc.setFont('helvetica','normal')
  doc.setFontSize(10)

  let debateNum = 0

  rptDetails.Debates.forEach((item) => {
    y += 10
    debateNum += 1
    doc.text(('Debate ' + debateNum.toString()),10,y)
    const debate = item as DebateViewModel
    doc.text(debate.DebateNote,40,y)
    //Sections
    const sections = debate.DebateSections
    sections.forEach((item) => {
      const section = item as DebateSectionViewModel
      y += 10
      doc.text(section.SectionName,20,y)
      // Speeches
      const speeches = section.DebateSpeeches
      speeches.forEach((item) => {
        if (y > 270) { doc.addPage("a4", "portrait"); y = 20;}
        y += 5
        const speech = item as DebateSpeechViewModel
        const fullDate = formatIsoDate(speech.StartTime)
        const start = fullDate.split(" ")[0]
        doc.text(speech.MemberName,30,y)
        doc.text(start,80,y)
        doc.text(speech.SpeakingTime, 100, y)
      })
    })
  })
  doc.setProperties({
    title: "Meeting report"
  });
  doc.output("dataurlnewwindow",{'filename':'Report.pdf'})
  spinner.style.display = 'none'
}

function handleEditClicked(this: HTMLButtonElement) {
  // Replace Edit with Trash and Cancel
  this.style.display = 'none';
  (document.getElementById('reports-topbar-trash-cancel') as HTMLButtonElement).style.display = 'block';

  // Make report card checkboxes visible
  const boxes = document.getElementsByClassName('input-container') as HTMLCollectionOf<HTMLInputElement>
  for (const box of boxes) {
    box.style.visibility = 'visible'
  }

  // Remove listeners from cards
  const cards = document.getElementsByClassName('report-card')
  for (const card of cards) {
    card.removeEventListener('click', handleReportCardClick)
  }
}

async function handleTrashClicked() {
  // Get event ids of selected cards
  const selectedBoxes = document.querySelectorAll('input[type="checkbox"].report-card-input:checked')
  let evtIds:number[] = []
  for (const box of selectedBoxes) {
    const id = box.parentElement?.parentElement?.id as string
    const evtId = parseInt(id.slice(6))
    evtIds.push(evtId)
  }
  
  // Delete event from model
  if (evtIds.length > 0) {
    await deleteReportsForEventIds(evtIds)
  }
  
  // Replace Trash and Cancel with Edit by removing inline styles
  (document.getElementById('reports-topbar-trash-cancel') as HTMLDivElement).style.display = '';
  (document.getElementById('reports-topbar-edit') as HTMLButtonElement).style.display = '';

  // Re-display remaining report cards
  const reports = await getReportsForCurrentGroup()
  if (!reports) {return}
  createCardsFromReportsViewModel(reports)

  // Make report card checkboxes hidden
  const boxes = document.getElementsByClassName('input-container') as HTMLCollectionOf<HTMLInputElement>
  for (const box of boxes) {
    box.style.visibility = 'hidden'
  }
}

function handleCancelClicked() {
  // Replace Trash and Cancel with Edit by removing inline styles
  (document.getElementById('reports-topbar-trash-cancel') as HTMLDivElement).style.display = '';
  (document.getElementById('reports-topbar-edit') as HTMLButtonElement).style.display = '';

  // Make report card checkboxes hidden
  const boxes = document.getElementsByClassName('input-container') as HTMLCollectionOf<HTMLInputElement>
  for (const box of boxes) {
    box.style.visibility = 'hidden'
  }

  // Add card listeners
  const cards = document.getElementsByClassName('report-card')
  for (const card of cards) {
    card.addEventListener('click', handleReportCardClick)
  }
}

// Helpers

const createCardsFromReportsViewModel = (reports: ReportEventViewModel[]) => {

  // Create html for cards
  let cardsHtml = ""
  reports.forEach((report) => {
    const fulldate = formatIsoDate(report.Date)
    const split = fulldate.split(" ")
    const time = split[0]
    const ampm = split[1]
    const weekday = split[2]
    const date = split[3]
    const month = split[4]
    const year = split[5]
    const cardStrg = `
    <div class='report-card' id='evtid-${report.EventId.toString()}'>
      <label class='input-container'>
        <input class='report-card-input' type='checkbox'>
        <span class='input-checkmark'></span>
      </label>
      <p>&nbsp;</p>
      <p>${report.GroupName}</p>
      <p>${time} ${ampm}</p>
      <p>${weekday}</p>
      <p>${date} ${month} ${year}</p>
    </div>
    `
    cardsHtml = cardsHtml + cardStrg
  })

  // Inject the cards
  const reportsCards = document.getElementById('reports-cards') as HTMLDivElement
  reportsCards.innerHTML = cardsHtml

  // Add click listeners to each card
  const cards = document.querySelectorAll('.report-card')
    for (let i = 0; i < cards.length; i++) {
      cards[i].addEventListener('click', handleReportCardClick)
    }
}

export {
  reportsView,
  setupReports
}