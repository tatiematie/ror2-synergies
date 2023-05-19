// global variables
const itemList = document.querySelectorAll('#item-select button'),
    itemTitle = document.querySelector('#item-title'),
    itemType = document.querySelector('#item-description'),
    itemThumb = document.querySelector('#item-thumbnail img')

// update display panel on selection
const updateDisplay = (item) => {
    let active = item.getAttribute('active')

    if (active) {
        let node, name, type, id, rarity

<<<<<<< HEAD
        fetch('/json/items.json')
=======
        fetch('json/items.json')
>>>>>>> 1192a294a2e061447d224cb0aa26ca6ab06abdba
            .then(response => response.json())
            .then(data => {
                for (const key in data) {
                    node = data[key]

                    if (node.name == item.getAttribute('title')) {
                        name = node.name,
                            type = node.type,
                            id = node.id,
                            rarity = node.rarity
                    }
                }

                console.log(node.name)

                itemTitle.innerHTML = name
                itemType.innerHTML = rarity + ' ' + type
                itemThumb.setAttribute('src', 'assets/img/items/' + id + '.png')
                itemThumb.parentNode.setAttribute('rarity', rarity.toLowerCase())
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
