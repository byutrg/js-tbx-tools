import * as xml2js from 'xml2js'
import jsonpath from 'jsonpath'

export type TBXInformation = {
    dialect: string,
    style: string,
    languages: string[],
    terms: Map<string, Array<any>> 
} | null

export default class Information {
    static stringify = (info: TBXInformation) => 
        JSON.stringify(info, (_, v) => {
            let ret;
            if (v instanceof Map) 
                ret = Array.from(v.entries())
                    .reduce((reduced: any, [_k, _v]) => { 
                        reduced[_k] = _v
                        return reduced
                    }, {})
            else if (v instanceof Set) 
                ret = Array.from(v.entries()).map(([_k, _]) => _k)
            else ret = v
            return ret
    })
    static getBasicInformation = (tbxString: string) : TBXInformation | Error => {
        let ret: TBXInformation | Error = null;
        xml2js.parseString(tbxString, 
            {
                attrkey: "attrs",
                charkey: "value",
                xmlns: true
            },
            (err, res) => {
                if (err) {
                    ret = err
                    return
                }
                ret = {
                dialect: res.tbx.attrs.type.value,
                style: res.tbx.attrs.style.value,
                languages: jsonpath.query(res.tbx, '$..langSec')
                            .flat()
                            .map((langSec: any) => langSec.attrs['xml:lang'].value)
                            .reduce((langs, lang: string) => langs.add(lang), new Set<string>()),
                terms: jsonpath.query(res.tbx, '$..langSec')
                        .flat()
                        .map(langSec => [langSec.attrs['xml:lang'].value, 
                                        jsonpath.query(langSec, '$..term')
                                        .flat()
                                        .map(t => t.value)])
                        .reduce((groupMap, [langKey, terms]) => {
                            let val = groupMap.get(langKey) ?? [] 
                            val.push(terms)
                            groupMap.set(langKey, val.flat())
                            return groupMap;
                        }, new Map<string, any[]>())
            }});
        return ret;
    }
}
