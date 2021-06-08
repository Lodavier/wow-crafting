const fs = require('fs')
const path = require('path')
const Database = require('wow-classic-items')
const util = require('util')

const items = new Database.Items()

const result = {}

const qualities = {
    "Common": 1,
    "Uncommon": 2,
    "Rare": 3,
    "Epic": 4
}

items.filter(i => i.createdBy).forEach(item => {
    const createdBys = item.createdBy.filter(cb => cb.category != "Enchanting")

    if(createdBys.length == 0)
        return

    createdBys.forEach(createdBy => {    
        let craftName = item.name

        if(createdBy.category == "Alchemy" && createdBy.recipes.length > 0)
        {
            const recipes = createdBy.recipes.map(rId => items.find(item => item.itemId == rId))
            const transmuteRecipe = recipes.find(recipe => recipe.name.includes("Transmute"))
            if(transmuteRecipe != undefined){
                craftName = transmuteRecipe.name.substring(8)
            }
        }

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

        result[craftName] = {
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
})

const enchants = JSON.parse(fs.readFileSync(path.resolve(__dirname, './enchants.json')))

for(const enchant of enchants){
    const reagents = {}
    
    enchant.reagents.forEach(reagent => {
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

    result[enchant.name] = {
        category: "enchanting",
        reagents
    }

    if(enchant.creates){
        result[enchant.name].id = enchant.creates[0]

        if(enchant.creates.length > 1){
            result[enchant.name].craftMin = enchant.creates[1]
            result[enchant.name].craftMax = enchant.creates[2]
        }
    }
}

fs.writeFileSync(path.resolve(__dirname, './crafting.json'), JSON.stringify(result, null, 4), {encoding: "utf-8"});

