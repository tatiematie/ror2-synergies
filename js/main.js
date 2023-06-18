const appVersion = '1.1.7.4'
const itemDesc = document.querySelector('#item-description')
const itemSelect = document.querySelector('#item-select')
const itemSynergies = document.querySelector('#item-synergies')

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

let itemData

const createButton = (item) => {
    const { name, rarity, id } = item
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

    const itemSynergiesDetails = document.createElement('details'),
        itemSynergiesTitle = document.createElement('summary'),
        itemSynergiesTitleContent = document.createElement('span')
    itemSynergiesTitleContent.classList.add('title')
    itemSynergiesTitleContent.innerHTML = 'Synergies:'

    itemSynergiesDetails.setAttribute('open', '')

    itemSynergiesTitle.appendChild(itemSynergiesTitleContent)
    itemSynergiesDetails.appendChild(itemSynergiesTitle)
    itemSynergies.appendChild(itemSynergiesDetails)

    const includeTags = Array.isArray(item.synergies.include) ? item.synergies.include : []
    const excludeTags = Array.isArray(item.synergies.exclude) ? item.synergies.exclude : []

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
                img.title = name
                img.loading = 'lazy'

                tagListItem.appendChild(img)
                tagList.appendChild(tagListItem)
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

        if (window.innerWidth <= 750) {
            displayPane.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

const loadButtons = async () => {
    itemData = await readFile('json', 'json/items.json')

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

const initializePage = async () => {
    await loadButtons()
    attachButtonEventListeners()

    const footer = document.querySelector('#footer')

    let versionTag = document.createElement('p'),
        copyrightTag = document.createElement('p')
    const copyrightYear = new Date().getFullYear()

    versionTag.id = 'app-version'
    versionTag.innerHTML = `made by tatiematie, v${appVersion}`

    copyrightTag.innerHTML = `not affiliated with Hopoo Games, Risk of Rain 2 &copy; ${copyrightYear} Hopoo Games`

    footer.appendChild(versionTag)
    footer.appendChild(copyrightTag)

    console.log(`Verison ${appVersion}`)
}

initializePage()