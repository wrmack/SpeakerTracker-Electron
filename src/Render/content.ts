import  { resetTablesWithSavedData, populateTables } from './01-Use cases/01-Track speakers/speakers-presenter.js'
import { 
  speaker_tracker, 
  setupArrowButtonListeners, 
  setupTimerControlListeners, 
  setupMeetingSetupListeners, 
  setupResetListener,
  setupInfoListener,
  setupSpeakingTableSectionChangeListener,
  setupWaitingTableMenuListener, 
  setupClockExpandListener,
  setupMeetingEventListeners,
  handleInfoButtonClick
} from './01-Use cases/01-Track speakers/speakers-view.js'
import { loadSetupMeetingSheet } from './01-Use cases/01-Track speakers/meetingsetup-view.js'
import { 
  setupView, 
  setupEditItemListeners, 
  setupSidebarListeners, 
  showEntities 
} from './01-Use cases/02-Setup/setup-view.js'
import {
  reportsView, 
  setupReports
} from './01-Use cases/03-Reports/reports-view.js'


/**
 * Initialise the database and load the speakers view.
 * Called when app is loaded.
 *  */ 
async function initialise() {
  const paths = await window.myapi.getPaths()
  console.log("App paths: ",paths)
  await window.myapi.connect()
  await window.myapi.initDb()
  await resetTablesWithSavedData()
  loadSpeakersView()
}


//
// Event listeners for navigation buttons
//

// Load speakers view when Speakers button is clicked
const speakersbtn = document.getElementById('speakers-btn')
if (speakersbtn) {
  speakersbtn.addEventListener('click', () => {
    removeActiveClasses()
    speakersbtn.classList.add('active')
    loadSpeakersView()
  })
}

// Load setup view when Setup button is clicked
const setupbtn = document.getElementById('setup-btn')
if (setupbtn) {
  setupbtn.addEventListener('click', () => {
    removeActiveClasses()
    setupbtn.classList.add('active')
    loadSetupView()
  })
}

const reportsbtn = document.getElementById('reports-btn')
if (reportsbtn) {
  reportsbtn.addEventListener('click', () => {
    removeActiveClasses()
    reportsbtn.classList.add('active')
    loadReportsView()
  })
}


//
// Handlers for navigation button events
//

// Load the  speakers view and populate the tables with model data
async function loadSpeakersView () {
  const container = document.getElementById('content-container')
  if (container) {
    container.innerHTML = speaker_tracker
  }
  const isFirstTime = await populateTables()
  setupArrowButtonListeners()
  setupTimerControlListeners()
  loadSetupMeetingSheet()
  setupMeetingSetupListeners()
  setupResetListener()
  setupInfoListener()
  setupClockExpandListener()
  setupSpeakingTableSectionChangeListener()
  setupWaitingTableMenuListener()
  setupMeetingEventListeners()
  if (isFirstTime) {
    // Is first time (no entities set up yet) so display info window
    handleInfoButtonClick()
  }
}

// Load template and listeners for setup view
async function loadSetupView () {
  const container = document.getElementById('content-container') 
  if (container) {  container.innerHTML = setupView}
  setupEditItemListeners()
  setupSidebarListeners()
  // Initial view shows entities
  showEntities()
  const sident = document.getElementById('setup-sidebar-ent-btn')
  if (!sident) {return}
  sident.classList.add('setup-sidebar-btn-selected')
}

// Load template and listeners for reports view
async function loadReportsView () {
  const container = document.getElementById('content-container') 
  if (container) {  container.innerHTML = reportsView}
  setupReports()
}

// Helpers
function removeActiveClasses() {
  const speakersbtn = document.getElementById('speakers-btn')
  const setupbtn = document.getElementById('setup-btn')
  const reportsbtn = document.getElementById('reports-btn')
  speakersbtn?.classList.remove('active')
  setupbtn?.classList.remove('active')
  reportsbtn?.classList.remove('active')
}

// Start by calling initialise
initialise()
