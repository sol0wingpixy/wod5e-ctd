import { Arts } from '../../../api/def/arts.js'

export const prepareArts = async function (actor) {
  // Secondary variables
  const artsList = Arts.getList({})
  const actorArts = actor.system?.arts
  const computedArts = {}

  for (const [id, value] of Object.entries(artsList)) {
    let artData = {}

    // If the actor has a discipline with the key, grab its current values
    if (Object.prototype.hasOwnProperty.call(actorArts, id)) {
      artData = Object.assign(
        {
          id,
          value: actorArts[id].value || 0,
          powers: actorArts[id].powers || [],
          description: actorArts[id]?.description || '',
          visible: actorArts[id].visible,
          selected: actorArts[id].selected || false
        },
        value
      )
    } else {
      // Otherwise, add it to the actor and set it as some default data
      artData = Object.assign(
        {
          id,
          value: 0,
          visible: false,
          description: '',
          powers: [],
          selected: false
        },
        value
      )
    }

    // Ensure the art exists
    if (!computedArts[id]) computedArts[id] = {}
    // Apply the art's data
    computedArts[id] = artData

    // Make it forced invisible if it's set to hidden
    if (artData.hidden) {
      computedArts[id].visible = false
    }

    // Assign all matching powers to the art
    computedArts[id].powers = actor.items.filter(
      (item) => item.type === 'power' && item.system.art === id
    )
  }

  return computedArts
}

export const prepareArtPowers = async function (arts) {
  for (const artType in arts) {
    if (Object.prototype.hasOwnProperty.call(arts, artType)) {
      const discipline = arts[artType]

      if (discipline && Array.isArray(discipline.powers)) {
        // Check if the discipline has powers
        if (discipline.powers.length > 0) {
          // Ensure visibility is set correctly
          if (!discipline.visible && !discipline.hidden) discipline.visible = true

          // Sort the discipline containers by the level of the power
          discipline.powers = discipline.powers.sort(function (power1, power2) {
            // Ensure power1 and power2 have the necessary properties
            const level1 = power1.system ? power1.system.level : 0
            const level2 = power2.system ? power2.system.level : 0

            // If levels are the same, sort alphabetically instead
            if (level1 === level2) {
              return power1.name.localeCompare(power2.name)
            }

            // Sort by level
            return level1 - level2
          })
        }
      } else {
        console.warn(
          `World of Darkness 5e | Discipline ${artType} is missing or powers is not an array.`
        )
      }
    }
  }

  return arts
}
