import React from 'react';

import { usePersistentState } from './util'
import { getAuthToken } from './tsm';

export default function Auth({setToken}){
    const [apiKey, setApiKey] = usePersistentState("wowcrafting-tsm-apikey", null);

    const apiInputId = React.useId()

    const authTokenInputId = React.useId()

    const onSaveApiClick = () => {
        const newValue = document.getElementById(apiInputId).value
        setApiKey(newValue)
    }

    const onAuthClick = async () => {
        const token = await getAuthToken(apiKey)
        setToken(token)
    }

    const onSaveAuthClick = () => {
        const token = document.getElementById(authTokenInputId).value

        const newValue = {
            "access_token": token,
            "expires_at": Date.now() + (24 * 60 * 60 * 1000) 
        }

        setToken(newValue)
    }
    
    return (<>
    <div className="col-sm-4">
        <div className="form-group row">
        <label htmlFor={apiInputId} className="col-sm-3 col-form-label">TSM API Key</label>
        <div className="col-sm-6">
            <input id={apiInputId} className="form-control" placeholder="Key" defaultValue={apiKey}/>
        </div>
            <button className="col-sm-3" onClick={onSaveApiClick}>Save</button>
        </div>
    </div>
    {(apiKey) &&
        (<>
        <div>
            <button onClick={onAuthClick}>Auth</button>
        </div>
        {/* <div className="col-sm-4">
            <div className="form-group row">
            <label htmlFor={authTokenInputId} className="col-sm-3 col-form-label">TSM Auth Token</label>
            <div className="col-sm-6">
                <input id={authTokenInputId} className="form-control" placeholder="Token"/>
            </div>
                <button className="col-sm-3" onClick={onSaveAuthClick}>Save</button>
            </div>
        </div> */}
        </>)
    }
    </>)
}