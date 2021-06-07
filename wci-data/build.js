const fs = require('fs')
const Database = require('wow-classic-items')

const items = new Database.Items()

const result = {}

const qualities = {
    "Common": 1,
    "Uncommon": 2,
    "Rare": 3,
    "Epic": 4
}

items.filter(i => i.createdBy).forEach(item => {
    let createdBy = item.createdBy

    if(createdBy.length > 1){
        createdBy = createdBy.filter(cb => cb.category != "Alchemy")
        if(createdBy.length != 1)
            return
    }

    createdBy = createdBy[0]

    const reagents = {}
    createdBy.reagents.forEach(reagent => {
        let item = items.find(item => item.itemId == reagent.itemId)
        if(item == undefined){
            if(reagent.itemId == 13503){
                item = {name: "Alchemist's Stone"}
            }
            else{
                throw reagent.itemId
            }
        }
        reagents[item.name] = reagent.amount

        if(result[item.name] == undefined){
            result[item.name] = {
                id: reagent.itemId,
                quality: qualities[item.quality]
            }

            if(item.vendorPrice){
                result[item.name].vendor = item.vendorPrice
            }

            if(item.tooltip && item.tooltip.some(tt => tt.label.includes("Binds when picked up"))){
                result[item.name].bindOnPickup = true
            }
        }
    })

    result[item.name] = {
        id: item.itemId,
        quality: qualities[item.quality],
        category: createdBy.category.toLowerCase(),
        reagents
    }

    if(createdBy.amount[1] > 1){
        result[item.name].craftMin = createdBy.amount[0],
        result[item.name].craftMax = createdBy.amount[1]
    }
})

fs.writeFileSync('crafting.json', JSON.stringify(result, null, 4), {encoding: "utf-8"});

