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
    itemDesc.children[1].innerHTML = description

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
        const excludeTag = Array.isArray(item.exclude) ? item.exclude : []
        if (
            (item.synergies && item.synergies.includes(dataItem.id)) ||
            (Array.isArray(dataItem.tags) && dataItem.tags.some((tag) => item.synergies && item.synergies.includes(tag))) &&
            !excludeTag.includes(dataItem.id)
        ) {
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
    })
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

    const changeFavicon = (item) => {
        const favicon = document.querySelector('link[rel="icon"]')
        const src = `assets/img/items/${item.id}.png`

        favicon.href = src
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
}

initializePage()