export default class IO {
    static ReadFromInput = (tbxFile: File, callback: (result: string | ArrayBuffer | null) => any) => {
        let reader = new FileReader()
        reader.onload = () => callback(reader.result)
        reader.readAsText(tbxFile)
    }
}