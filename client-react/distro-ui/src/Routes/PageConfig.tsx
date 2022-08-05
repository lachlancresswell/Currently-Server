import React, { ChangeEvent, FormEvent, useState, useEffect } from 'react'
import '../Styles/PageConfig.css'
import Neighbour from '../Neighbour';
import * as Config from '../Config';


export default function PageConfig({ device, times }: { device?: Neighbour, times: { dbTime: Date, server: Date } }) {

    let config: {
        [index: string]: any;
    } = {
        "blank": {
            "blank": " "
        }
    }

    useEffect(() => {
        console.log(conf)
    });


    const [conf, setValue] = useState(config);
    if (device) {
        Config.getConfig(device.urlFromIp()).then((res) => setValue(res));
    }
    const handleChange = (e: ChangeEvent<HTMLInputElement>, pluginTitle: string, valueTitle: string) => {
        let val: string | boolean = e.target.value;

        if (typeof conf[pluginTitle][valueTitle].value == 'boolean' && typeof e.target.value != 'boolean') {
            val = e.target.checked;
        }
        conf[pluginTitle][valueTitle].value = val;
        setValue((prevState) => ({ ...prevState, ...conf }));
    }

    const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
        if (e.preventDefault) e.preventDefault();

        var xmlHttp = new XMLHttpRequest();
        const target = window.location.protocol + '//' + window.location.host + "/config"
        console.log('POST - ' + target)
        xmlHttp.open("POST", target, true); // false for synchronous request
        xmlHttp.onload = function () {
            if (!(this.status >= 200 && this.status < 300)) {
                throw new Error(`Posting to ${target} returned ${xmlHttp.status} with ${xmlHttp.statusText}`)
            }
        };

        xmlHttp.setRequestHeader('Content-type', 'application/json');
        xmlHttp.send(JSON.stringify(conf));


        return false;
    }

    return (
        <form onSubmit={(e) => handleFormSubmit(e)}>
            {
                Object.keys(conf).map((pluginTitle) => {

                    let y = false;
                    const contents = Object.keys(conf[pluginTitle]).map((valueTitle) => {
                        const curValue = conf[pluginTitle][valueTitle];
                        if (!(typeof curValue == 'object')) {
                            return null;
                        } else {
                            y = true;
                            const readableName = curValue.readableName + ': ';
                            const value = curValue.value;
                            let type = '';
                            let component;
                            switch (typeof (curValue.value)) {
                                case 'boolean':
                                    type = 'checkbox';
                                    component = <input onChange={(e) => handleChange(e, pluginTitle, valueTitle)} key={curValue.readableName} type={type} defaultChecked={value} ></input>;
                                    break;
                                case 'number':
                                    type = '';
                                    component = <input onChange={(e) => handleChange(e, pluginTitle, valueTitle)} key={curValue.readableName} value={value}></input>;
                                    break;
                                case 'string':
                                    type = '';
                                    component = <input onChange={(e) => handleChange(e, pluginTitle, valueTitle)} key={curValue.readableName} value={value}></input>;
                                    break;
                                default:
                                    component = <button key={curValue.readableName} >{curValue.readableName}</button>;
                                    break
                            }

                            return (
                                <div key={'div' + component.key}>
                                    <label key={'label' + component.key}>{readableName}</label>
                                    {component}
                                </div>
                            )
                        }
                    })

                    return (<div key={pluginTitle + 'adsas'}>
                        {(y) && <h4 key={pluginTitle} >{conf[pluginTitle].readableName || pluginTitle}</h4>}
                        {contents.map((c) => c || null)}
                    </div>)
                })
            }
            <div>
                <input type="submit" />
            </div>
            <div>
                <div>Browser: {(new Date()).toLocaleString()}</div>
                <div>Database: {times.dbTime.toLocaleString()}</div>
                <div>Server: {times.server.toLocaleString()}</div>
            </div>
        </form>
    )
}
