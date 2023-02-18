import { XDocument, XElement, XProcessingInstruction, XName, XNamespace, XDeclaration } from '@openxmldev/linq-to-xml'

export default class Convert {
    private static readonly TBXNS = "urn:iso:std:iso:30042:ed-2"

    static V2toV3 = (tbxContent: string) => {
        let dom = new DOMParser().parseFromString(tbxContent, "text/xml")
        dom.doctype?.remove()
        let tbx = XDocument.load(dom)
        Convert._ParseRecursive(tbx.root)

        for (let elt of tbx.descendants()) 
            Convert._AddNamespaceRecursive(elt)
        Convert._AddSchemas(tbx)
        Convert._AddDeclaration(tbx)
        return tbx.toString().replace(/(\?>)/g, "$1\r\n")
    }

    private static _AddNamespaceRecursive = (elt: XElement | null) => {
        if (elt == null) return

        elt.name = new XName(XNamespace.get(Convert.TBXNS), elt.name.localName)
    }

    private static _AddDeclaration = (doc: XDocument) => {
        let declaration = new XDeclaration(
            '1.0',
            'utf-8'
        )
        doc.declaration = declaration
    }

    private static _AddSchemas = (doc: XDocument) => {
        let dialect = doc.root?.attribute(XName.get('type'))?.value
        let rngPi = new XProcessingInstruction(
            'xml-model',
            "href=\"https://raw.githubusercontent.com/LTAC-Global/TBX_Core_RNG/master/TBXcoreStructV03.rng\" type=\"application/xml\" schematypens=\"http://relaxng.org/ns/structure/1.0\""
        )
        let sch = ""
        switch (dialect) {
            case "TBX-Basic":
                sch = "https://raw.githubusercontent.com/LTAC-Global/TBX-Basic_dialect/master/DCA/TBX-Basic_DCA.sch"
                break 
            case "TBX-Min":
                sch = "https://raw.githubusercontent.com/LTAC-Global/TBX-Min_dialect/master/DCA/TBX-Min_DCA.sch"
                break
            default: 
                return
        }
        let schPi = new XProcessingInstruction(
                'xml-model',
                `href="${sch}" type="application/xml" schematypens="http://purl.oclc.org/dsdl/schematron"`
        )
        let root = doc.root
        root?.remove()
        doc.add([rngPi, schPi, root])
    }

    private static _ChangeLocalName = (elt: XElement, name: string) => elt.name = XName.get(name) 

    private static _ParseRecursive(elt: XElement | null) {
        if (elt == null) return

        switch(elt.name.localName.toLowerCase()) {
            case "entry": 
                Convert._ChangeLocalName(elt, 'conceptEntry')
                break
            case "langgroup": 
            case "langset": 
                Convert._ChangeLocalName(elt, 'langSec')
                break
            case "martif": 
                Convert._ChangeLocalName(elt, 'tbx')
                
                if (elt.attribute(XName.get('TBX')))
                    elt.setAttributeValue(XName.get('type'), 'TBX-Basic') 
                elt.setAttributeValue(XName.get('style'), "dca")
                break
            case "martifheader": 
                Convert._ChangeLocalName(elt, 'tbxHeader')
                break
            case "bpt": 
                Convert._ChangeLocalName(elt, 'sc') 
                break
            case "ept":  
                Convert._ChangeLocalName(elt, 'ec') 
                break
            case "termentry": 
                Convert._ChangeLocalName(elt, 'conceptEntry')
                break
            case "termgroup":
            case "tig": 
                Convert._ChangeLocalName(elt, 'termSec')
                break
            case "ntig":  
                let termGrp = elt.element(XName.get('termGrp'))
                if (termGrp == null) {
                    Convert._ChangeLocalName(elt, 'termSec')
                    break
                }    
                elt.add(termGrp.nodes)
                termGrp.remove()
                break
            case "termcomplist":  
                Convert._ChangeLocalName(elt, 'termCompSec')
                break
            case "refobjectlist":  
                Convert._ChangeLocalName(elt, 'refObjectSec')
                break
            case "termcomptlistspec":  
                Convert._ChangeLocalName(elt, 'termCompSecSpec') 
                break
            case "termgrp":
                elt.remove() 
                break
            default:
                break
        }

        if (!elt.hasElements) return

        for (let child of elt.elements()) {
            this._ParseRecursive(child)
        }
    }
}