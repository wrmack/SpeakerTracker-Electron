import { getGroupAtIdx, getMembersForGroupId, getMemberWithId } from '../../../../02-Models/models.js'
import { setMasterRowIdx } from '../../../../03-State/state.js'

const displaySelectedGroup = `
  <div id='selected-group'>
    <div class='detail-row'>
      <span class='detail-key'>Name:</span><span class='detail-value' id='group-name'></span>
    </div>
    <div class='detail-row'>
      <span class='detail-key'>Members:</span><span class='detail-value' id='group-members'></span>
    </div>
  </div>
`
const setupGroupDetailListeners = function () {
  document.addEventListener('group-selected', handleGroupSelected)
}

async function handleGroupSelected (ev: Event) {
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


export { displaySelectedGroup, setupGroupDetailListeners }
