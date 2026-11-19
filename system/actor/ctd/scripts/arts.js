/** Handle adding a new art to the sheet */
export const _onAddArt = async function (event) {
  event.preventDefault()

  // Top-level variables
  const actor = this.actor

  // Secondary variables
  const artList = WOD5E.Arts.getList({})

  // Build the options for the select dropdown
  const content = new foundry.data.fields.StringField({
    choices: artList,
    label: game.i18n.localize('WOD5E.CTD.SelectArt'),
    required: true
  }).toFormGroup(
    {},
    {
      name: 'art'
    }
  ).outerHTML

  // Prompt a dialog to determine which art we're adding
  const artSelected = await foundry.applications.api.DialogV2.prompt({
    window: {
      title: game.i18n.localize('WOD5E.CTD.AddArt')
    },
      classes: ['wod5e-ctd', 'dialog', 'changeling', 'dialog'],
    content,
    ok: {
      callback: (event, button) =>
        new foundry.applications.ux.FormDataExtended(button.form).object.art
    },
    modal: true
  })

  if (artSelected) {
    // Make the art visible
    actor.update({ [`system.arts.${artSelected}.visible`]: true })

    // Update the currently selected art and power
    _updateSelectedArt(actor, artSelected)
    _updateSelectedArtCantrip(actor, '')
  }
}

/** Handle removing a art from an actor */
export const _onRemoveArt = async function (event, target) {
  event.preventDefault()

  // Top-level variables
  const actor = this.actor
  const art = target.getAttribute('data-art')

  actor.update({
    [`system.arts.${art}.visible`]: false
  })
}

/** Post Art description to the chat */
export const _onArtToChat = async function (event, target) {
  event.preventDefault()

  // Top-level variables
  const actor = this.actor
  const art = actor.system.arts[target.getAttribute('data-art')]

  foundry.documents.ChatMessage.implementation.create({
    flags: {
      wod5e: {
        name: art.displayName,
        img: 'icons/svg/dice-target.svg',
        description: art?.description
      }
    }
  })
}

/** Select a art to display */
export const _onSelectArt = async function (event, target) {
  event.preventDefault()

  // Top-level variables
  const actor = this.actor
  const art = target.getAttribute('data-art')

  _updateSelectedArt(actor, art)
}

/** Select a power to display */
export const _onSelectArtCantrip = async function (event, target) {
  event.preventDefault()

  // Top-level variables
  const actor = this.actor
  const cantrip = target.getAttribute('data-cantrip')

  _updateSelectedArtCantrip(actor, cantrip)
}

export const _updateSelectedArtCantrip = async function (actor, cantrip) {
  // Variables yet to be defined
  const updatedData = {}

  // Make sure we actually have a valid power defined
  if (cantrip && actor.items.get(cantrip)) {
    const cantripItem = actor.items.get(cantrip)
    const art = cantripItem.system.art

    // Update the selected power
    updatedData.selectedArtCantrip = cantrip
    cantripItem.update({
      system: {
        selected: true
      }
    })

    // Update the selected arts
    _updateSelectedArt(actor, art)
  } else {
    // Revert to an empty string
      updatedData.selectedArtCantrip = ''
  }

  // Unselect the previously selected power
    const previouslySelectedCantrip = actor.system?.selectedArtCantrip
  if (
    previouslySelectedCantrip &&
    actor.items.get(previouslySelectedCantrip) &&
    previouslySelectedCantrip !== cantrip
  ) {
    actor.items.get(previouslySelectedCantrip).update({
      system: {
        selected: false
      }
    })
  }

  // Update the actor data
  actor.update({
    system: updatedData
  })
}

export const _updateSelectedArt = async function (actor, art) {
  // Variables yet to be defined
  const updatedData = {}

  // Make sure we actually have a art defined
  if (art && actor.system.arts[art]) {
      updatedData.arts ??= {}
      updatedData.arts[art] ??= {}

    // Update the selected arts
    updatedData.selectedArt = art
    updatedData.arts[art].selected = true
  } else {
    // Revert to an empty string
    updatedData.selectedArt = ''
  }

  // Unselect the previously selected art

  const previouslySelectedArt = actor.system?.selectedArt
  if (previouslySelectedArt && previouslySelectedArt !== art) {
    updatedData.arts[previouslySelectedArt] ??= {}
    updatedData.arts[previouslySelectedArt].selected = false
  }

  // Update the actor data
  actor.update({
    system: updatedData
  })
}
