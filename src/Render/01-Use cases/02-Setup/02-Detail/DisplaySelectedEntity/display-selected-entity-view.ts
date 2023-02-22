
import {  
  getEntityAtIdx, 
  getMembersForEntityId, 
  getGroupsForEntityId 
} from '../../../../02-Models/models.js'
import { setMasterRowIdx } from '../../../../03-State/state.js'

export const displaySelectedEntity = `
  <div id='selected-ent'>
    <div class='detail-row'>
      <span class='detail-key'>Name:</span><span class='detail-value' id='ent-name'></span>
    </div>
    <div class='detail-row'>
      <span class='detail-key'>Members:</span><span class='detail-value' id='ent-members'></span>
    </div>
    <div class='detail-row'>
      <span class='detail-key'>Meeting groups:</span><span class='detail-value' id='ent-groups'></span>
    </div
  </div>
`
export const setupEntityDetailListeners = function () {
  document.addEventListener('entity-selected', async (event) => {
    // console.log('entity-selected received')
    if (event instanceof CustomEvent) {
      // Get entity using row index
      const rowStrg = event.detail.id.slice(4)
      const rowNumber = parseInt(rowStrg)
      const entity = await getEntityAtIdx(rowNumber)
      const enam = document.getElementById('ent-name')
      if (!enam) {return}
      enam.innerHTML = entity.EntName
      // Get members
      const members = await getMembersForEntityId(entity.Id) 
      let mbrsStrg = ''
      members.forEach((mbr, idx) => {
        mbrsStrg += `${mbr.FirstName} ${mbr.LastName}`
        if (idx < members.length - 1) {
          mbrsStrg += ', '
        }
      })
      const emem = document.getElementById('ent-members');
      if (!emem) {return}
      emem.innerHTML = mbrsStrg
      // Get meeting groups
      const grps = await getGroupsForEntityId(entity.Id) 
      let grpsStrg = ''
      grps.forEach((grp, idx) => {
        grpsStrg += `${grp.GrpName}`
        if (idx < grps.length -1) {
          grpsStrg += ', '
        }
      })
      const grpEl = document.getElementById('ent-groups')
      if (!grpEl) {return}
      grpEl.innerHTML = grpsStrg
      // Set the master row index
      setMasterRowIdx(rowNumber)
    }
  })
}
