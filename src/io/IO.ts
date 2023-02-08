export default class IO {
    static readAsync = (tbxFile: File) : Promise<string> => {
        let reader = new FileReader()
        reader.readAsText(tbxFile)
        return new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result?.toString() ?? "")
        })
    }
}