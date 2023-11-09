import { CATEGORY } from './constants'

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

// Function to check if a value is empty (empty string, null, or array length 0)
export const isValueEmpty = (value, key = '', obj = {}) => {
  if (key === 'dietaryRestrictions') {
    return false
  } else if (key === 'tags') {
    return false
  } else if (key === 'locationCoords') {
    return false
  } else if (key === 'quantityNum' && obj['category'] !== CATEGORY.Food) {
    return false
  } else if (key === 'foodAllergens') {
    return false
  }

  if (value === null || value === undefined) {
    return true // Value is null or undefined
  }
  if (typeof value === 'string' && value.trim() === '') {
    return true // Value is an empty string
  }
  if (Array.isArray(value) && value.length === 0) {
    return true // Value is an empty array
  }
  return false // Value is not empty
}

export const checkEmptyFormInputs = (obj) => {
  console.log(
    'aaa',
    Object.keys(obj).filter((key) => isValueEmpty(obj[key]))
  )
  const emptyKeyValues = Object.keys(obj).filter((key) => {
    console.log('aaa keys ', key === 'dietaryRestrictions')

    if (key === 'dietaryRestrictions') {
      return false
    } else if (key === 'tags') {
      return false
    } else if (key === 'locationCoords') {
      return false
    } else if (key === 'foodAllergens') {
      return false
    } else if (key === 'quantityNum' && obj['category'] !== CATEGORY.Food) {
      return false
    }

    return isValueEmpty(obj[key])
  })

  return emptyKeyValues.length > 1
}
