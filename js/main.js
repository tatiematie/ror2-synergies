const appVersion = '1.2.4'
const itemDesc = document.querySelector('#item-description')
const itemSelect = document.querySelector('#item-select')
let selectButtons
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

let itemData, currentItem

const createButton = (item) => {
    const { name, rarity, id } = item
    const src = `assets/img/items/${id}.png`

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
        const src = `assets/img/items/${id}.png`

        displayPane.innerHTML = ''

        const itemTitle = document.createElement('h2')
        itemTitle.innerHTML = name

        displayPane.appendChild(itemTitle)

        const itemType = document.createElement('p')
        itemType.innerHTML = `${rarity} ${type}`

        displayPane.appendChild(itemType)

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

        const existingModifiersTable = itemDesc.querySelector('#modifiers-table')
        const modifiersTitle = itemDesc.querySelector('.modifiers.title')
        if (existingModifiersTable && modifiersTitle) {
            modifiersTitle.remove()
            existingModifiersTable.remove()
        }

        if (modifiers !== undefined) {
            const modifiersTableTitle = document.createElement('p');
            modifiersTableTitle.innerHTML = 'Affected by:';
            modifiersTableTitle.classList.add('modifiers', 'title');
            descriptionDetails.appendChild(modifiersTableTitle);

            const modifiersTable = document.createElement('table');
            modifiersTable.id = 'modifiers-table';

            for (const entry of modifiers) {
                const modifierRow = document.createElement('tr');

                const modifierLabelCell = document.createElement('td');

                modifierLabelCell.innerHTML = entry

                const matchingItems = itemData.filter(item => item.name === entry || (item.tags && item.tags.includes(entry)));

                for (const matchingItem of matchingItems) {
                    const modifierSpan = document.createElement('span');
                    const modifierImage = document.createElement('img');

                    modifierImage.src = `assets/img/items/${matchingItem.id}.png`;
                    modifierImage.alt = matchingItem.name;
                    modifierImage.title = matchingItem.name;
                    modifierImage.loading = 'lazy';

                    modifierSpan.appendChild(modifierImage);
                    modifierLabelCell.appendChild(modifierSpan);
                }

                modifierRow.appendChild(modifierLabelCell);
                modifiersTable.appendChild(modifierRow);
            }

            descriptionDetails.appendChild(modifiersTable);
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
    const src = `assets/img/items/${currentItem.id}.png`

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

            if (isIncluded && !isExcluded && include !== 'None') {
                const synergyListItem = document.createElement('li'),
                    synergyListButton = document.createElement('a'),
                    synergyListImg = document.createElement('img')

                synergyListImg.src = `assets/img/items/${id}.png`
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

    let canScroll = false

    setTimeout(() => {
        updateDisplay()

        canScroll = true
    }, 1);

    document.addEventListener('click', (event) => {
        if (event.target.closest('.item') && canScroll) {
            displayPane.parentNode.parentNode.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    })

    window.addEventListener('popstate', updateDisplay)

    window.addEventListener('popstate', setActive)

    const footer = document.querySelector('#footer')

    let versionTag = document.createElement('p'),
        copyrightTag = document.createElement('p')
    const copyrightYear = new Date().getFullYear()

    versionTag.id = 'app-version'
    versionTag.innerHTML = `made by tatiematie, v${appVersion}`

    copyrightTag.innerHTML = `not affiliated with Hopoo Games, Risk of Rain 2 &copy ${copyrightYear} Hopoo Games`

    footer.appendChild(versionTag)
    footer.appendChild(copyrightTag)

    console.log(`Verison ${appVersion}`)

    setActive()
}

initializePage()