export const convertConstantsToDropdownOptions = (constants) => {
  const options = Object.keys(constants).map((key) => {
    // if (key === 'None') return null
    return { label: key, value: constants[key] }
  })

  return options
}

export const renderAMPMTime = (timestampStr) => {
  // Initialize Date Object from ISO 8601 Timestamp
  const dateObj = new Date(timestampStr)

  // Convert to Singapore Time
  const sgtTimeStr = dateObj.toLocaleString('en-SG', {
    timeZone: 'Asia/Singapore',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })

  console.log(sgtTimeStr) // Output will be in Singapore Time
  return sgtTimeStr
}
