// global variables
const itemList = document.querySelectorAll('#item-select button'),
    itemTitle = document.querySelector('#item-title'),
    itemType = document.querySelector('#item-type'),
    itemThumb = document.querySelector('#item-thumbnail img'),
    itemDesc = document.querySelector('#item-desc'),
    itemSelect = document.querySelector('#item-select')

const readFile = async (filepath) => {
    const response = await fetch(filepath)
    return await response.json()
};

let itemData = readFile('json/items.json')

// TODO: exploring button loading vs. written markdown
// issues accessing itemList before it's assigned

// const loadButtons = window.onload = () => {
//     itemData.then(itemData => {
//         itemData.forEach(item => {
//             let li = document.createElement('li'),
//                 button = document.createElement('button'),
//                 img = document.createElement('img')

//             li.classList.add('item')

//             button.setAttribute('type', 'button')
//             button.setAttribute('title', item.name)
//             button.setAttribute('rarity', item.rarity.toLowerCase())

//             img.setAttribute('src', 'assets/img/items/' + item.id + '.png')
//             img.setAttribute('alt', item.name)
//             img.setAttribute('loading', 'lazy')

//             button.append(img)
//             li.append(button)
//             itemSelect.append(li)
//         })

//         itemList = document.querySelectorAll('#item-select button')
//     })
// }

const updateDisplay = (toShow) => {
    itemData.then(itemData => {
        itemData.forEach(item => {
            let active = toShow.getAttribute('active')

            if (active && toShow.getAttribute('title') == item.name) {
                itemTitle.innerHTML = item.name
                itemType.innerHTML = item.rarity + ' ' + item.type
                itemThumb.parentNode.setAttribute('rarity', item.rarity.toLowerCase())
                itemThumb.setAttribute('src', 'assets/img/items/' + item.id + '.png')
                itemDesc.children[1].innerHTML = item.description
            }
        })
    })
}

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
