import  { populateTables } from './02-Use cases/01-Track speakers/speakers-presenter.js'
import { 
  speaker_tracker, 
  loadSetupMeetingSheet, 
  setupArrowButtonListeners, 
  setupTimerControlListeners, 
  setupMeetingSetupListeners, 
  setupResetListener,
  setupInfoListener,
  setupSpeakingTableSectionChangeListener,
  setupWaitingTableMenuListener, 
  setupClockExpandListener
} from './02-Use cases/01-Track speakers/speakers-view.js'
import { 
  setupView, 
  setupEditItemListeners, 
  setupSidebarListeners, 
  showEntities 
} from './02-Use cases/02-Setup/setup-view.js'


// Initialise database
async function initialise() {
  await window.myapi.connect()
  await window.myapi.initDb()
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

//
// Handlers for navigation button events
//

// Load the  speakers view and populate the tables with model data
async function loadSpeakersView () {
  const container = document.getElementById('content-container')
  if (container) {
    container.innerHTML = speaker_tracker
  }
  await populateTables()
  setupArrowButtonListeners()
  setupTimerControlListeners()
  loadSetupMeetingSheet()
  setupMeetingSetupListeners()
  setupResetListener()
  setupInfoListener()
  setupClockExpandListener()
  setupSpeakingTableSectionChangeListener()
  setupWaitingTableMenuListener()
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

// Helpers
function removeActiveClasses() {
  const speakersbtn = document.getElementById('speakers-btn')
  const setupbtn = document.getElementById('setup-btn')
  speakersbtn?.classList.remove('active')
  setupbtn?.classList.remove('active')
}

// Start by calling initialise
initialise()
