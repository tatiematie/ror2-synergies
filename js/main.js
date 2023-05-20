// global variables
const itemList = document.querySelectorAll('#item-select button'),
    itemTitle = document.querySelector('#item-title'),
    itemType = document.querySelector('#item-type'),
    itemThumb = document.querySelector('#item-thumbnail img'),
    itemDesc = document.querySelector('#item-desc')

// update display panel on selection
const updateDisplay = (item) => {
    let active = item.getAttribute('active')

    if (active) {
        let node, name, rarity, type, id, desc

        fetch('json/items.json')
            .then(response => response.json())
            .then(data => {
                for (const key in data) {
                    node = data[key]

                    if (node.name == item.getAttribute('title')) {
                        name = node.name,
                            rarity = node.rarity,
                            type = node.type,
                            id = node.id,
                            desc = node.description
                    }
                }

                itemTitle.innerHTML = name
                itemType.innerHTML = rarity + ' ' + type
                itemThumb.parentNode.setAttribute('rarity', rarity.toLowerCase())
                itemThumb.setAttribute('src', 'assets/img/items/' + id + '.png')
                itemThumb.setAttribute('title', name)
                itemDesc.children[1].innerHTML = desc
            })
    }
}

// item selection listener
for (const i of itemList) {
    i.addEventListener('mouseup', (event) => {
        if (!i.getAttribute('active') === true) {
            for (const ix of itemList) {
                ix.setAttribute('active', '')
            }

            i.setAttribute('active', true)

            updateDisplay(i)
        }
    })

    updateDisplay(i)
}
