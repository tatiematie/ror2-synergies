const appVersion = '1.1.2.8'

const itemDesc = document.querySelector('#item-description'),
    itemSelect = document.querySelector('#item-select'),
    itemSynergies = document.querySelector('#item-synergies')

const readJSON = async (filepath) => {
    const response = await fetch(filepath)
    return response.json()
}

let itemData

const createButton = (item) => {
    const { name, rarity, type, id, description } = item
    const src = `assets/img/items/${id}.png`

    const li = document.createElement('li'),
        button = document.createElement('button'),
        img = document.createElement('img')

    li.className = 'item'

    button.type = 'button'
    button.title = name
    button.setAttribute('rarity', rarity.toLowerCase())

    img.src = src
    img.alt = name
    img.loading = 'lazy'

    button.appendChild(img)
    li.appendChild(button)
    itemSelect.appendChild(li)

    return button
}

const loadButtons = async () => {
    itemData = await readJSON('json/items.json')

    itemData.forEach((item, index) => {
        const button = createButton(item)

        if (index === 0) {
            button.setAttribute('active', 'true')
            updateDisplay(item)
            updateSynergyList(item)

            button.focus()
        }
    })
}

const updateDisplay = (item) => {
    const displayPane = document.querySelector('#display-pane .heading')
    const { name, rarity, type, description, id, procCoefficient } = item
    const src = `assets/img/items/${id}.png`

    displayPane.innerHTML = ''

    const itemTitle = document.createElement('h2')
    itemTitle.innerHTML = name

    const itemType = document.createElement('p')
    itemType.innerHTML = `${rarity} ${type}`

    const itemThumb = document.createElement('img'),
        thumbWrapper = document.createElement('div'),
        itemThumbnail = document.createElement('div')

    itemThumb.src = src
    itemThumb.title = name
    itemThumb.alt = name

    thumbWrapper.classList.add('wrapper')
    thumbWrapper.appendChild(itemThumb)

    itemThumbnail.id = 'item-thumbnail'
    itemThumbnail.classList.add('content', 'corners')
    itemThumbnail.setAttribute('rarity', rarity.toLowerCase())
    itemThumbnail.appendChild(thumbWrapper)

    displayPane.appendChild(itemTitle)
    displayPane.appendChild(itemType)

    displayPane.appendChild(itemThumbnail)

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
    const { name } = item
    const src = `assets/img/items/${item.id}.png`

    itemSynergies.innerHTML = ''

    const itemSynergiesTitle = document.createElement('p')
    itemSynergiesTitle.classList.add('title')
    itemSynergiesTitle.innerHTML = 'Potential Synergies:'
    itemSynergies.appendChild(itemSynergiesTitle)

    const includeTags = Array.isArray(item.synergies.include) ? item.synergies.include : []
    const excludeTags = Array.isArray(item.synergies.exclude) ? item.synergies.exclude : []

    includeTags.forEach((include) => {
        const tagListTitle = document.createElement('p')
        tagListTitle.innerHTML = include
        itemSynergies.appendChild(tagListTitle)

        const tagList = document.createElement('ul')
        tagList.classList.add('content')
        itemSynergies.appendChild(tagList)

        itemData.forEach((dataItem) => {
            const { name: dataItemName, rarity, id: dataItemID, tags } = dataItem
            const isExcluded =
                excludeTags.includes(dataItemName) ||
                (Array.isArray(tags) && tags.some((tag) => excludeTags.includes(tag))) ||
                dataItemID === item.id

            const isIncluded =
                (Array.isArray(tags) && tags.includes(include)) ||
                dataItemName === include

            if (isIncluded && !isExcluded && include !== 'None') {
                const tagListItem = document.createElement('li')
                tagListItem.classList.add('item')
                tagListItem.setAttribute('rarity', rarity.toLowerCase())

                const img = document.createElement('img')
                img.src = `assets/img/items/${dataItemID}.png`
                img.alt = dataItemName
                img.title = dataItemName
                img.loading = 'lazy'

                tagListItem.appendChild(img)
                tagList.appendChild(tagListItem)
            }
        })
    })

    const justifySynergies = () => {
        const synergyLists = document.querySelectorAll('#item-synergies ul');

        synergyLists.forEach((list) => {
            if (list.clientHeight === 59) {
                list.style.justifyContent = 'start'
            } else {
                list.style.justifyContent = 'space-around'
            }
        });
    };

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

        const displayPane = document.querySelector('#display-pane')

        if (window.innerWidth <= 768) {
            displayPane.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest', offsetTop: 12 });
        }

    }
}

const attachButtonEventListeners = () => {
    const buttons = itemSelect.querySelectorAll('button')
    buttons.forEach((button) => {
        const item = itemData.find((dataItem) => dataItem.name === button.title)
        button.addEventListener('click', () => handleButtonClick(item, button))
    })
}

const initializePage = async () => {
    await loadButtons()
    attachButtonEventListeners()

    let versionTag = document.createElement('p')
    versionTag.id = 'app-version'
    versionTag.innerHTML = `<span gray>v${appVersion}</span>`

    document.querySelector('#app').appendChild(versionTag)
}

initializePage()