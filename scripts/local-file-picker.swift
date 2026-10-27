import AppKit

final class PickerDelegate: NSObject, NSApplicationDelegate {
    private var panel: NSOpenPanel?

    func applicationDidFinishLaunching(_ notification: Notification) {
        let picker = NSOpenPanel()
        panel = picker
        picker.title = "选择文件和文件夹"
        picker.message = "选择文件夹可直接添加；双击文件夹可进入并选择文件。"
        picker.prompt = "添加"
        picker.canChooseFiles = true
        picker.canChooseDirectories = true
        picker.allowsMultipleSelection = true
        picker.canCreateDirectories = false
        NSApplication.shared.activate(ignoringOtherApps: true)
        picker.begin { response in
            let paths = response == .OK ? picker.urls.map { $0.path } : []
            if let data = try? JSONSerialization.data(withJSONObject: paths) {
                if CommandLine.arguments.count > 1 {
                    try? data.write(to: URL(fileURLWithPath: CommandLine.arguments[1]), options: .atomic)
                } else {
                    FileHandle.standardOutput.write(data)
                }
            }
            NSApplication.shared.terminate(nil)
        }
    }
}

let app = NSApplication.shared
let delegate = PickerDelegate()
app.delegate = delegate
app.setActivationPolicy(.regular)
app.run()
