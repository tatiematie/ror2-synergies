const itemTitle = document.querySelector('#item-title'),
    itemType = document.querySelector('#item-type'),
    itemThumb = document.querySelector('#item-thumbnail img'),
    itemDesc = document.querySelector('#item-description'),
    itemSelect = document.querySelector('#item-select')

const readFile = async (filepath) => {
    const response = await fetch(filepath)
    return response.json()
}

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
    button.setAttribute('rarity', rarityLowerCase)

    img.src = src
    img.alt = name
    img.loading = 'lazy'

    button.appendChild(img)
    li.appendChild(button)
    itemSelect.appendChild(li)

    button.addEventListener('click', () => {
        const isActive = button.getAttribute('active') === 'true'

        if (!isActive) {
            const activeButton = document.querySelector('#item-select button[active=true]')

            if (activeButton) {
                activeButton.removeAttribute('active')
            }

            button.setAttribute('active', 'true')
            updateDisplay(item)
        }
    })

    return button
}

const loadButtons = async () => {
    const itemData = await readFile('json/items.json')

    itemData.forEach((item, index) => {
        const button = createButton(item)

        if (index === 0) {
            button.setAttribute('active', 'true')
            updateDisplay(item)
        }
    })
}

const updateDisplay = (item) => {
    const { name, rarity, type, description, id } = item
    const rarityLowerCase = rarity.toLowerCase()
    const src = `assets/img/items/${id}.png`

    itemTitle.innerHTML = name
    itemType.innerHTML = `${rarity} ${type}`
    itemThumb.parentNode.setAttribute('rarity', rarityLowerCase)
    itemThumb.src = src
    itemDesc.children[1].innerHTML = description
}

loadButtons()