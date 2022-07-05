import Cocoa

let type = NSPasteboard.PasteboardType.html

if (CommandLine.arguments.count != 2) {
    print("provide one argement")
    exit(1);
}

let filename = CommandLine.arguments[1]
print("reading input from", filename)
let fileURL = URL(fileURLWithPath: filename)
let data = try! Data(contentsOf: fileURL)

let pb = NSPasteboard.general
print("have pb", pb)
pb.clearContents()
pb.setData(data, forType: .html)

print("Wrote data")
exit(0)
