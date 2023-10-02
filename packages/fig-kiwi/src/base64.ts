function base64ToBytes(base64: string): Uint8Array {
    const lookup = new Uint8Array(256).map((_, i) => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.indexOf(String.fromCharCode(i)));
    const padding = (base64.charAt(base64.length - 1) === '=' ? 1 : 0) + (base64.charAt(base64.length - 2) === '=' ? 1 : 0);
    const groupsOfSix = base64.length / 4;
    const numBytes = groupsOfSix * 3 - padding;
    const byteArray = new Uint8Array(numBytes);
  
    for (let i = 0, j = 0; i < numBytes; i += 3, j += 4) {
        let bits = (lookup[base64.charCodeAt(j)] << 18) |
                   (lookup[base64.charCodeAt(j + 1)] << 12) |
                   (lookup[base64.charCodeAt(j + 2)] << 6) |
                   lookup[base64.charCodeAt(j + 3)];
  
        byteArray[i] = (bits >>> 16) & 255;
        if (i + 1 < numBytes) byteArray[i + 1] = (bits >>> 8) & 255;
        if (i + 2 < numBytes) byteArray[i + 2] = bits & 255;
    }
  
    return byteArray;
}
  
// const base64String = 'U29tZSBkYXRh';  // This is "Some data" encoded in Base64
// const bytes = base64ToBytes(base64String);
// console.log(bytes);  // Outputs: Uint8Array(9) [83, 111, 109, 101, 32, 100, 97, 116, 97]

// this is a character that wouldn't work with btoa because it's not in the ASCII range
const base64String = "AA==";  // This is "Some data" encoded in Base64
const bytes = base64ToBytes(base64String);
console.log(bytes);  // Outputs: Uint8Array(11) [83, 111, 109, 101, 32, 100, 97, 116, 97, 240, 159]
console.log("atob", JSON.stringify(atob(base64String))); // Outputs: "\u0000" 