import { 
  entityChanged, 
  loadEntitiesDropdownForGroups, 
  loadGroups, 
  getReportsForGroupAtIdx,
  getReportDetailsForEventId
 } from "./reports-presenter.js"
 
import { jsPDF } from "../../../types/jspdf"

const reportsView = `
<div id='reports-topbar-container'>
  <div id='reports-topbar-heading' class='reports-topbar-item'>Reports</div>
  <div id='reports-topbar-meetinggroups' class='reports-topbar-item'>Meeting groups</div>
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
  
  </div>
</div>
`
const reportCard = `
<div class='report-card'>
  <p>Test card</p>
  <p>Test card</p>
</div>
`
const pdfViewerWindow = `
<html>
<head>
<title>Speaker Tracker Info</title>
</head>
<link href="css/info.css" rel="stylesheet">

<body>
<div id="pdf-viewer"></div>
</body>
<script src="./scripts/pdfobject.min.js"></script>
</html>

`


const setupReports = async () => {
  setupReportsEntitiesDropdownListeners()
  await loadEntitiesDropdownForGroups()
  setupReportDetailListeners()
  await loadGroups()
}


const setupReportsEntitiesDropdownListeners = function () {
  const el = document.getElementById('reports-select-entities') as HTMLSelectElement
  if (el) {
    // el.addEventListener('click', handleDropDownEvent)
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
    jspdf: any,
    PDFObject: any
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

  // Create html for cards
  let cardsHtml = ""
  reports.forEach((report) => {
    const cardStrg = `
    <div class='report-card' id='evtid-${report.EventId.toString()}'>
      <p>${report.GroupName}</p>
      <p>${report.Date}</p>
    </div>
    `
    cardsHtml = cardsHtml + cardStrg
  })

  // Inject the cards
  const detail = document.getElementById('reports-detail')
  if (detail) {
    detail.innerHTML = cardsHtml
  }

  // Add click listeners to each card
  const cards = document.querySelectorAll('.report-card')
    for (let i = 0; i < cards.length; i++) {
      cards[i].addEventListener('click', handleReportCardClick)
    }
}

// Cannot use an arrow function - does not bind to 'this'
const handleReportCardClick = async function (this: HTMLElement, ev: Event)  {
  // Get event id of the event relating to the report that was clicked
  const reportId = this.id
  const eventId = parseInt(reportId.slice(6))
  const rptDetails = await getReportDetailsForEventId(eventId)

  const childWindow = window.open('', 'modal')
  if (childWindow) {
    childWindow.document.write(pdfViewerWindow)
  }

  const jsPDF = window.jspdf.jsPDF
  // Default export is a4 paper, portrait, using millimeters for units
  const doc: jsPDF = new jsPDF()
  if (!rptDetails?.MeetingGroupName) {return}
  doc.text(rptDetails.MeetingGroupName, 10, 10)
  doc.text(rptDetails.Date, 10, 50)
  doc.output("dataurlnewwindow")

  // PDFObject options: need to force iFrame to avoid error message "Not allowed to navigate top frame to data url"
  // omitInlineStyles removes inline styles from PDFObject but jsPDF still uses them so still need content security policy for style-src in index.html
  const options = {
    forceIframe: true,
    omitInlineStyles: true
  }
  if (childWindow)  {
    // childWindow.PDFObject = window.PDFObject
    // childWindow.PDFObject.embed(doc.output("datauristring"), "#pdf-viewer", options)

    const pdfViewer =childWindow.document.getElementById('pdf-viewer')
    if (pdfViewer) {
      pdfViewer.style.visibility = 'visible'
    }
  }
}

export {
    reportsView,
    setupReports
}