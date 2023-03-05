/**
 * Converts an iso date string into hh:mm am/pm dd month yyyy
 * @param {string} iso the date in iso form
 * @returns {string} formatted into hh:mm am/pm dd month yyyy
 */
const formatIsoDate = (iso: string): string => {
    let ampm = "AM"
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const isoDate = new Date(iso)
    let isoHoursNum = isoDate.getHours()
    if (isoHoursNum > 11) {
      ampm = "PM"
      isoHoursNum -= 12
    }
    const hours = isoHoursNum.toString()
    const minutes = isoDate.getMinutes().toString().padStart(2,'0')
    const day = days[isoDate.getDay()]
    const date = isoDate.getDate().toString()
    const month = months[isoDate.getMonth()]
    const year = isoDate.getFullYear().toString()
    const fullString = hours + ':' + minutes + " " + ampm + " " + day + " " + date +" " + month + " " + year
    return fullString
}

/**
 * Converts seconds into minutes and seconds and returns a string "minutes:seconds"
 * @param seconds total seconds
 * @returns a string formatted as "minutes:seconds"
 */
function getTimeStringFromSeconds(seconds: number) {
  let minuteStrg = ''
  let secondStrg = ''
  const minute = Math.floor((seconds) / 60)
  const secondsRemg = seconds - (minute * 60)
  if (minute < 10) { minuteStrg = '0' + minute.toString() } else { minuteStrg = minute.toString()}
  if (secondsRemg < 10) { secondStrg = '0' + secondsRemg.toString() } else { secondStrg = secondsRemg.toString()}
  return `${minuteStrg}:${secondStrg}`
}

export { formatIsoDate, getTimeStringFromSeconds }