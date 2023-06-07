const appName = 'ROR2 Synergizer',
    appVersion = '1.1.1'

const itemTitle = document.querySelector('#item-title'),
    itemType = document.querySelector('#item-type'),
    itemThumb = document.querySelector('#item-thumbnail img'),
    itemDesc = document.querySelector('#item-description'),
    itemSelect = document.querySelector('#item-select'),
    synergyList = document.querySelector('#synergy-list')

const readFile = async (filepath) => {
    const response = await fetch(filepath)
    return response.json()
}

let itemData

const createButton = (item) => {
    const { name, rarity, type, id, description } = item
    const rarityLowerCase = rarity.toLowerCase()
    const src = `assets/img/items/${id}.png`

    const li = document.createElement('li'),
        button = document.createElement('button'),
        img = document.createElement('img')

    li.className = 'item'

    button.type = 'button'
    button.title = name
    button.setAttribute('data-item-id', id)
    button.setAttribute('rarity', rarityLowerCase)

    img.src = src
    img.alt = name
    img.loading = 'lazy'

    button.appendChild(img)
    li.appendChild(button)
    itemSelect.appendChild(li)

    return button
}

const loadButtons = async () => {
    itemData = await readFile('json/items.json')

    itemData.forEach((item, index) => {
        const button = createButton(item)

        if (index === 0) {
            button.setAttribute('active', 'true')
            updateDisplay(item)
            updateSynergyList(item)
        }
    })
}

const updateDisplay = (item) => {
    const { name, rarity, type, description, id, procCoefficient } = item
    const rarityLowerCase = rarity.toLowerCase()
    const src = `assets/img/items/${id}.png`

    itemTitle.innerHTML = name
    itemType.innerHTML = `${rarity} ${type}`
    itemThumb.parentNode.parentNode.setAttribute('rarity', rarityLowerCase)
    itemThumb.src = src
    itemThumb.title = name

    itemDesc.innerHTML = ''

    const descriptionTitle = document.createElement('p')
    descriptionTitle.innerHTML = `Description:`
    descriptionTitle.classList.add('title')
    itemDesc.appendChild(descriptionTitle)

    for (const entry of description) {
        const entryElement = document.createElement('p')
        entryElement.innerHTML = entry
        itemDesc.appendChild(entryElement)
    }

    const existingProcCoefficientTable = itemDesc.querySelector('.proc-coefficient-table')
    const procTableTitle = itemDesc.querySelector('.proc.title')
    if (existingProcCoefficientTable && procTableTitle) {
        procTableTitle.remove()
        existingProcCoefficientTable.remove()
    }

    if (procCoefficient !== undefined) {
        const procCoefficientTableTitle = document.createElement('p')
        procCoefficientTableTitle.innerHTML = 'Proc Coefficients:'
        procCoefficientTableTitle.classList.add('proc', 'title')
        itemDesc.appendChild(procCoefficientTableTitle)

        const procCoefficientTable = document.createElement('table')
        procCoefficientTable.className = 'proc-coefficient-table'

        const procCoefficientHeaderRow = document.createElement('tr')
        procCoefficientTable.appendChild(procCoefficientHeaderRow)

        for (const [entryName, entryValue] of Object.entries(procCoefficient)) {
            const procCoefficientRow = document.createElement('tr')

            const procCoefficientLabelCell = document.createElement('td')
            procCoefficientLabelCell.innerHTML = entryName

            const procCoefficientValueCell = document.createElement('td')
            procCoefficientValueCell.innerHTML = entryValue

            procCoefficientRow.appendChild(procCoefficientLabelCell)
            procCoefficientRow.appendChild(procCoefficientValueCell)

            procCoefficientTable.appendChild(procCoefficientRow)
        }

        itemDesc.appendChild(procCoefficientTable)
    }
}

const updateSynergyList = (item) => {
    synergyList.innerHTML = ''

    itemData.forEach((dataItem) => {
        const excludeTags = Array.isArray(item.synergies.exclude) ? item.synergies.exclude : []
        const includeTags = Array.isArray(item.synergies.include) ? item.synergies.include : []

        const hasNoneTag = includeTags.includes('none')

        const isIncluded =
            (item.synergies &&
                item.synergies.include &&
                item.synergies.include.includes(dataItem.id)) ||
            (Array.isArray(dataItem.tags) &&
                (dataItem.tags.includes(item.id) ||
                    dataItem.tags.some((tag) => includeTags.includes(tag))))
            || dataItem.id === item.id

        const isExcluded =
            excludeTags.includes(dataItem.id) ||
            (Array.isArray(dataItem.tags) && dataItem.tags.some((tag) => excludeTags.includes(tag)))

        const isSameItem = dataItem.id === item.id
        const isEquipment = dataItem.rarity.toLowerCase() === 'equipment'
        const isAspect = dataItem.type.toLowerCase() === 'aspect'

        if (isIncluded && !isExcluded && !(isSameItem && (isEquipment || isAspect))) {
            if (!(hasNoneTag && isSameItem)) {
                const listItem = document.createElement('li')
                listItem.className = 'item'
                listItem.setAttribute('rarity', dataItem.rarity.toLowerCase())

                const img = document.createElement('img')
                img.src = `assets/img/items/${dataItem.id}.png`
                img.alt = `${dataItem.name}`
                img.title = `${dataItem.name}`
                listItem.appendChild(img)

                synergyList.appendChild(listItem)
            }
        }
    })

    const justifySynergies = () => {
        if (synergyList.clientHeight === 47) {
            synergyList.style.justifyContent = 'start'
        } else {
            synergyList.style.justifyContent = 'space-around'
        }
    }

    justifySynergies()
    window.addEventListener('resize', justifySynergies)
}

const handleButtonClick = (item, button) => {
    const isActive = button.getAttribute('active') === 'true'

    if (!isActive) {
        const activeButton = document.querySelector('#item-select button[active=true]')

        if (activeButton) {
            activeButton.removeAttribute('active')
        }

        button.setAttribute('active', 'true')
        updateDisplay(item)
        updateSynergyList(item)
    }
}

const attachButtonEventListeners = () => {
    const buttons = itemSelect.querySelectorAll('button')
    buttons.forEach((button) => {
        const item = itemData.find((dataItem) => dataItem.id === button.getAttribute('data-item-id'))
        button.addEventListener('click', () => handleButtonClick(item, button))
    })
}

const initializePage = async () => {
    await loadButtons()
    attachButtonEventListeners()

    // let versionTag = document.createElement('p')
    // versionTag.id = 'app-version'
    // versionTag.innerHTML = `<span gray>${appName} v${appVersion}</span>`

    // document.querySelector('#container').appendChild(versionTag)
}

initializePage()