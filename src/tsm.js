function proxyUrl(url){
    return "https://corsproxy.io/?" + url
}

export async function getAuthToken(apiKey){
    const url = "https://auth.tradeskillmaster.com/oauth2/token"

    const data = {
        "client_id": "c260f00d-1071-409a-992f-dda2e5498536",
        "grant_type": "api_token",
        "scope": "app:realm-api app:pricing-api",
        "token": apiKey
    }

    const resp = await fetch(proxyUrl(url), {
        method: "POST",
        mode: 'cors',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    })

    const result = await resp.json()

    return result
}

async function getRegionId(authToken){
    const url = "https://realm-api.tradeskillmaster.com/regions"

    const resp = await fetch(proxyUrl(url),
        {
            headers: {
                "Authorization": "Bearer " + authToken
            }
        })

    const regions = await resp.json()
    const region = regions.items.find(r => r.gameVersion === "Wrath" && r.regionPrefix === "eu")
    return region.regionId
}

export async function getServers(authToken){
    const regionId = await getRegionId(authToken)
    
    const url = `https://realm-api.tradeskillmaster.com/regions/${regionId}/realms`

    const resp = await fetch(proxyUrl(url),
        {
            headers: {
                "Authorization": "Bearer " + authToken
            }
        })

    const realms = await resp.json()

    return realms.items
}

const cacheKey = "wowcrafting-tsm-pricing-cache";

function getCachedData(ahId){
    const key = `${cacheKey}-${ahId}`
    const item = window.localStorage.getItem(key);

    if(item != null){
        const parsed = JSON.parse(item)

        const thirtyMinutesBeforeNow = (Date.now() - (30 * 60 *1000)) / 1000
        if(parsed.fetchedAt >= thirtyMinutesBeforeNow){
            return parsed.data
        }
    }

    return null
}

function saveCachedData(data, ahId){
    const newValue = {
        "data": data,
        "fetchedAt": (Date.now() / 1000)
    }

    const key = `${cacheKey}-${ahId}`

    window.localStorage.setItem(key, JSON.stringify(newValue))
}

export async function loadData(ahId, authToken) {
    let data = getCachedData(ahId)
    if (!data){ 
        const url = `https://pricing-api.tradeskillmaster.com/ah/${ahId}`

        const resp = await fetch(proxyUrl(url),
            {
                headers: {
                    "Authorization": "Bearer " + authToken
                }
            })
        
        if(!resp.ok){
            console.error(resp.status, resp.statusText)
            return {}
        }

        data = await resp.json()
        saveCachedData(data, ahId)
    }    

    const mapped = data.map(({itemId, quantity, marketValue}) => [itemId, {quantity, marketValue}])
    const result = Object.fromEntries(mapped)

    return result
}