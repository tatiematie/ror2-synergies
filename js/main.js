const appVersion = '1.2.6.3'
const itemDesc = document.querySelector('#item-description'),
    itemSelect = document.querySelector('#item-select'),
    itemSynergies = document.querySelector('#item-synergies'),
    itemSearch = document.querySelector('#item-search')

let selectButtons

const readFile = async (type, filepath) => {
    const response = await fetch(filepath)
    return type === 'json' ? response.json() : response.text()
}

const loadComponent = async (filepath) => {
    const htmlContent = await readFile('html', `components/${filepath}.html`)
    const template = document.createElement('template')
    template.innerHTML = htmlContent.trim()
    return template.content
}

let itemData, currentItem, canScroll

const createButton = (item) => {
    const { name, rarity, id, tags } = item
    const src = `assets/img/${id}.png`

    const li = document.createElement('li'),
        button = document.createElement('a'),
        img = document.createElement('img')

    li.className = 'item'

    button.href = `#${id}`
    button.setAttribute('rarity', rarity.toLowerCase())

    img.src = src
    img.alt = name
    img.title = name
    img.loading = 'lazy'

    button.appendChild(img)
    li.appendChild(button)
    itemSelect.appendChild(li)

    return button
}

const updateDisplay = () => {
    const displayPane = document.querySelector('#display-pane .heading')

    let url = window.location,
        hash = url.hash.substring(1)

    currentItem = itemData.find(item => item.id === hash)

    if (!currentItem) {
        selectButtons[0].click()
        selectButtons[0].focus()

    } else {
        const { name, rarity, type, id, description, procCoefficients, modifiers } = currentItem
        const src = `assets/img/${id}.png`

        displayPane.innerHTML = ''

        const itemTitle = document.createElement('h2')
        itemTitle.innerHTML = name

        displayPane.appendChild(itemTitle)

        const itemType = document.createElement('p')
        itemType.innerHTML = `${rarity} ${type}`

        displayPane.appendChild(itemType)

        const itemThumb = document.createElement('img'),
            itemThumbnail = document.createElement('div')

        itemThumb.src = src
        itemThumb.title = name
        itemThumb.alt = name

        itemThumbnail.id = 'item-thumbnail'
        itemThumbnail.classList.add('content', 'corners')
        itemThumbnail.setAttribute('rarity', rarity.toLowerCase())

        itemThumbnail.appendChild(itemThumb)
        displayPane.appendChild(itemThumbnail)

        itemDesc.innerHTML = ''

        const descriptionDetails = document.createElement('details'),
            descriptionTitle = document.createElement('summary'),
            descriptionTitleContent = document.createElement('span')
        descriptionTitleContent.innerHTML = `Description:`
        descriptionTitleContent.classList.add('title')

        descriptionDetails.setAttribute('open', '')

        descriptionTitle.appendChild(descriptionTitleContent)
        descriptionDetails.appendChild(descriptionTitle)

        itemDesc.appendChild(descriptionDetails)

        for (const entry of description) {
            const entryElement = document.createElement('p')
            entryElement.innerHTML = entry
            descriptionDetails.appendChild(entryElement)
        }

        const existingProcCoefficientTable = itemDesc.querySelector('#proc-coefficient-table')
        const procTableTitle = itemDesc.querySelector('.proc.title')

        if (existingProcCoefficientTable && procTableTitle) {
            procTableTitle.remove()
            existingProcCoefficientTable.remove()
        }

        if (procCoefficients !== undefined) {
            const procCoefficientTableTitle = document.createElement('p')
            procCoefficientTableTitle.innerHTML = 'Proc Coefficients:'
            procCoefficientTableTitle.classList.add('proc', 'title')
            descriptionDetails.appendChild(procCoefficientTableTitle)

            const procCoefficientTable = document.createElement('table')
            procCoefficientTable.id = 'proc-coefficient-table'

            for (const [entryName, entryValue] of Object.entries(procCoefficients)) {
                const procCoefficientRow = document.createElement('tr')

                const procCoefficientLabelCell = document.createElement('td')
                procCoefficientLabelCell.innerHTML = entryName

                const procCoefficientValueCell = document.createElement('td')
                procCoefficientValueCell.innerHTML = entryValue

                procCoefficientRow.appendChild(procCoefficientLabelCell)
                procCoefficientRow.appendChild(procCoefficientValueCell)

                procCoefficientTable.appendChild(procCoefficientRow)
            }

            descriptionDetails.appendChild(procCoefficientTable)
        }

        function formatString(str) {
            return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]+/g, '')
        }
        if (modifiers !== undefined && typeof modifiers === 'object') {
            for (const [modifierTitle, modifierValue] of Object.entries(modifiers)) {
                const modifierTable = document.createElement('table')
                const modifierTitleElement = document.createElement('p')
                modifierTitleElement.innerHTML = modifierTitle
                modifierTitleElement.classList.add('modifiers', 'title')

                descriptionDetails.appendChild(modifierTitleElement)
                descriptionDetails.appendChild(modifierTable)

                if (Array.isArray(modifierValue)) {
                    for (const entry of modifierValue) {
                        const modifierRow = document.createElement('tr')
                        const modifierData = document.createElement('td')
                        modifierData.innerHTML = entry

                        const matchingItems = itemData.filter(
                            item => item.name === entry || (item.tags && item.tags.includes(entry))
                        )

                        if (matchingItems.length === 0) {
                            const spanElement = document.createElement('span')
                            const imageElement = document.createElement('img')
                            const formattedEntry = formatString(entry)

                            imageElement.src = `assets/img/${formattedEntry}.png`
                            imageElement.alt = entry
                            imageElement.title = entry
                            imageElement.loading = 'lazy'

                            spanElement.appendChild(imageElement)
                            modifierData.appendChild(spanElement)
                        } else {
                            for (const matchingItem of matchingItems) {
                                const spanElement = document.createElement('span')
                                const imageElement = document.createElement('img')

                                imageElement.src = `assets/img/${matchingItem.id}.png`
                                imageElement.alt = matchingItem.name
                                imageElement.title = matchingItem.name
                                imageElement.loading = 'lazy'

                                modifierData.appendChild(spanElement)
                                spanElement.appendChild(imageElement)
                            }
                        }

                        modifierRow.appendChild(modifierData)
                        modifierTable.appendChild(modifierRow)
                    }
                } else {
                    const modifierRow = document.createElement('tr')
                    const modifierData = document.createElement('td')
                    modifierData.innerHTML = modifierValue

                    const matchingItems = itemData.filter(
                        item => item.name === modifierValue || (item.tags && item.tags.includes(modifierValue))
                    )

                    if (matchingItems.length === 0) {
                        const spanElement = document.createElement('span')
                        const imageElement = document.createElement('img')
                        const formattedValue = formatString(modifierValue)

                        imageElement.src = `assets/img/${formattedValue}.png`
                        imageElement.alt = modifierValue
                        imageElement.title = modifierValue
                        imageElement.loading = 'lazy'

                        spanElement.appendChild(imageElement)
                        modifierData.appendChild(spanElement)
                    } else {
                        for (const matchingItem of matchingItems) {
                            const spanElement = document.createElement('span')
                            const imageElement = document.createElement('img')

                            imageElement.src = `assets/img/${matchingItem.id}.png`
                            imageElement.alt = matchingItem.name
                            imageElement.title = matchingItem.name
                            imageElement.loading = 'lazy'

                            modifierData.appendChild(spanElement)
                            spanElement.appendChild(imageElement)
                        }
                    }

                    modifierRow.appendChild(modifierData)
                    modifierTable.appendChild(modifierRow)
                }
            }
        }

        updateSynergyList(currentItem)
    }
}

const setActive = () => {
    let url = window.location,
        hash = url.hash.substring(1)

    const activeButton = itemSelect.querySelector(`.item a[href="#${hash}"]`)

    const previouslyActiveButton = itemSelect.querySelector('.item a[active]')
    if (previouslyActiveButton) {
        previouslyActiveButton.removeAttribute('active')
        previouslyActiveButton.blur()
    }

    activeButton.setAttribute('active', '')
}

const updateSynergyList = (currentItem) => {
    let { name, id, synergies } = currentItem
    const src = `assets/img/${currentItem.id}.png`

    itemSynergies.innerHTML = ''

    const itemSynergiesDetails = document.createElement('details'),
        itemSynergiesTitle = document.createElement('summary'),
        itemSynergiesTitleContent = document.createElement('span')
    itemSynergiesTitleContent.classList.add('title')
    itemSynergiesTitleContent.innerHTML = 'Synergies:'

    itemSynergiesDetails.setAttribute('open', '')

    itemSynergiesTitle.appendChild(itemSynergiesTitleContent)
    itemSynergiesDetails.appendChild(itemSynergiesTitle)
    itemSynergies.appendChild(itemSynergiesDetails)

    const includeTags = Array.isArray(currentItem.synergies.include) ? currentItem.synergies.include : []
    const excludeTags = Array.isArray(currentItem.synergies.exclude) ? currentItem.synergies.exclude : []

    if (includeTags.length === 0) {
        itemSynergies.style.display = 'none'
        return
    } else {
        itemSynergies.style.display = 'block'
    }

    includeTags.forEach((include) => {
        const tagListTitle = document.createElement('p')
        tagListTitle.innerHTML = include
        itemSynergiesDetails.appendChild(tagListTitle)

        const tagList = document.createElement('ul')
        tagList.classList.add('content')
        itemSynergiesDetails.appendChild(tagList)

        itemData.forEach((dataItem) => {
            const { name, rarity, id, tags } = dataItem
            const isExcluded = excludeTags.includes(name) || (Array.isArray(tags) && tags.some((tag) => excludeTags.includes(tag)))

            const isIncluded =
                (Array.isArray(tags) && tags.includes(include)) ||
                name === include

            if (isIncluded && !isExcluded && include !== 'None' && id !== currentItem.id) { // Exclude current item
                const synergyListItem = document.createElement('li'),
                    synergyListButton = document.createElement('a'),
                    synergyListImg = document.createElement('img')

                synergyListImg.src = `assets/img/${id}.png`
                synergyListImg.alt = name
                synergyListImg.title = name
                synergyListImg.loading = 'lazy'

                synergyListButton.href = `#${id}`
                synergyListButton.setAttribute('rarity', rarity.toLowerCase())
                synergyListButton.appendChild(synergyListImg)

                synergyListItem.classList.add('item')
                synergyListItem.appendChild(synergyListButton)

                tagList.appendChild(synergyListItem)
            }
        })
    })

    const justifySynergies = () => {
        const synergyLists = document.querySelectorAll('#item-synergies ul')

        synergyLists.forEach((list) => {
            if (list.clientHeight === 59) {
                list.style.justifyContent = 'start'
            } else {
                list.style.justifyContent = 'space-around'
            }
        })
    }

    const openCollapsedDetails = () => {
        const detailsList = document.querySelectorAll('details')

        detailsList.forEach((details) => {
            if (window.innerWidth > 750 && !details.hasAttribute('open')) {
                details.setAttribute('open', '')
            }
        })
    }

    justifySynergies()

    window.addEventListener('resize', justifySynergies)
    window.addEventListener('resize', openCollapsedDetails)
}

const handleButtonClick = (item, button) => {
    const activeButton = itemSelect.querySelector('.item a[active]')
    if (activeButton) {
        activeButton.removeAttribute('active')
    }

    button.setAttribute('active', '')

    currentItem = item
    updateSynergyList(currentItem)
}

const handleSearchInput = (event) => {
    if (document.activeElement === itemSearch) {
        const input = itemSearch.value

        if (input.trim() !== '') {
            const searchTerm = input.toLowerCase()
            let resultCount = 0

            for (const item of itemData) {
                const button = itemSelect.querySelector(`.item a[href="#${item.id}"]`)
                const shouldDisplay = item.name.toLowerCase().includes(searchTerm) ||
                    (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
                    (item.rarity && item.rarity.toLowerCase().includes(searchTerm))
                button.parentNode.style.display = shouldDisplay ? 'block' : 'none'

                if (shouldDisplay) {
                    resultCount++
                }
            }

            const resultCountElement = document.querySelector('#result-count')
            resultCountElement.textContent = resultCount > 0 ? `${resultCount} result${resultCount === 1 ? '' : 's'}` : ''

            const noResultsElement = document.querySelector('#no-results')
            noResultsElement.style.display = resultCount > 0 ? 'none' : 'block'
        } else {
            const buttons = itemSelect.querySelectorAll('.item a')
            buttons.forEach((button) => {
                button.parentNode.style.display = 'block'
            })

            const resultCountElement = document.querySelector('#result-count')
            resultCountElement.textContent = ''

            const noResultsElement = document.querySelector('#no-results')
            noResultsElement.style.display = 'none'
        }
    }

    const itemSelectList = document.querySelector('#item-select')

    if (itemSelectList.clientHeight === 59) {
        itemSelectList.style.justifyContent = 'start'
        itemSelectList.style.overflow = 'visible'
    } else {
        itemSelectList.style.justifyContent = 'space-around'
        itemSelectList.style.overflow = 'scroll'
    }
}

const loadButtons = async () => {
    itemData = await readFile('json', 'json/items.json')

    itemData.forEach((item, index) => {
        const button = createButton(item)
    })
}

const initializePage = async () => {
    const displayPane = document.querySelector('#display-pane .heading')

    await loadButtons()

    selectButtons = itemSelect.querySelectorAll('.item a')

    setTimeout(() => {
        updateDisplay()

        canScroll = true
    }, 25)

    window.addEventListener('popstate', updateDisplay)

    window.addEventListener('popstate', setActive)

    itemSearch.value = ''

    itemSearch.addEventListener('input', handleSearchInput)

    const footer = document.querySelector('#footer'),
        versionTag = footer.querySelector('#version'),
        copyrightTag = footer.querySelector('#copyrightYear')

    versionTag.innerHTML = `${appVersion}`
    copyrightTag.innerHTML = new Date().getFullYear()

    console.log(`Verison ${appVersion}`)

    setActive()
}

document.addEventListener('click', (event) => {
    const displayPane = document.querySelector('#display-pane .heading'),
        buttons = itemSelect.querySelectorAll('.item'),
        resultCount = document.querySelector('#result-count')

    if (event.target.closest('.item')) {
        if (canScroll) {
            setTimeout(() => {
                displayPane.parentNode.parentNode.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 25)
        }

        itemSearch.value = ''
        resultCount.innerHTML = ''
        itemSelect.removeAttribute('style')
        buttons.forEach((button) => {
            button.removeAttribute('style')
        })
    }
})

initializePage()
