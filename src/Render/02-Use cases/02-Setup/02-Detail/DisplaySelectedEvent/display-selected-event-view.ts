import { getGroupAtIdx, setMasterRowIdx, getMembersForGroupId, getMemberWithId } from '../../../../01-Models/models.js'

const displaySelectedEvent = `
  <div id='selected-event'>
    <div class='detail-row'>
      <span class='detail-key'>Name:</span><span class='detail-value' id='event-name'></span>
    </div>
    <div class='detail-row'>
      <span class='detail-key'>Date:</span><span class='detail-value' id='event-date'></span>
    </div>
  </div>
`
const setupEventDetailListeners = function () {
  document.addEventListener('event-selected', handleEventSelected)
}

async function handleEventSelected (ev: Event) {
  if (ev instanceof CustomEvent) {
    const rowStrg = ev.detail.id.slice(4)
    const rowNumber = parseInt(rowStrg)
    const group = await getGroupAtIdx(rowNumber)
    const groupMemberIds = await getMembersForGroupId(group.Id)
    let mbrStrg = ""
    for (let i = 0; i < groupMemberIds.length; ++i) {
      const member = await getMemberWithId(groupMemberIds[i].MemberId)
      mbrStrg += `${member.FirstName} ${member.LastName}`
      if (i < groupMemberIds.length - 1) {
        mbrStrg += ", "
      }
    }
    const gnam = document.getElementById('group-name');
    if (!gnam) {return}
    gnam.innerHTML = group.GrpName
    const gmem = document.getElementById('group-members');
    if (!gmem) {return}
    gmem.innerHTML = mbrStrg
    setMasterRowIdx(rowNumber)
  }
}


export { displaySelectedEvent, setupEventDetailListeners }
