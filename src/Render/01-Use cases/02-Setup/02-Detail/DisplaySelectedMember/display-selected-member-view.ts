import { getMemberAtIdx } from '../../../../02-Models/models.js'
import { setMasterRowIdx } from '../../../../03-State/state.js'

const displaySelectedMember = `
  <div id='selected-mbr'>
    <div class='detail-row'>
      <span class='detail-key'>Title:</span><span class='detail-value' id='mbr-title'></span>
    </div>
    <div class='detail-row'>
      <span class='detail-key'>First name:</span><span class='detail-value' id='mbr-first-name'></span>
    </div>
    <div class='detail-row'>
      <span class='detail-key'>Last name:</span><span class='detail-value' id='mbr-last-name'></span>
    </div
  </div>
`
const setupMemberDetailListeners = function () {
  document.addEventListener('member-selected', handleMemberSelected )
}

// Handlers

async function handleMemberSelected (ev:Event) {
  if (ev instanceof CustomEvent) {
    const rowStrg = ev.detail.id.slice(4)
    const rowNumber = parseInt(rowStrg)
    const member = await getMemberAtIdx(rowNumber)
    const mt = document.getElementById('mbr-title')
    const mfn = document.getElementById('mbr-first-name')
    const mln = document.getElementById('mbr-last-name')
    if (!mt || !mfn || !mln) {return}
    mt.innerHTML = member.Title
    mfn.innerHTML = member.FirstName
    mln.innerHTML = member.LastName
    setMasterRowIdx(rowNumber)
  }
}
export { displaySelectedMember, setupMemberDetailListeners }
