const table = [];
const poly = 0xEDB88320; // reverse polynomial

// build the table
{
    let c, n, k;

    for (n = 0; n < 256; n += 1) {
        c = n;
        for (k = 0; k < 8; k += 1) {
            if (c & 1) {
                c = poly ^ (c >>> 1);
            } else {
                c = c >>> 1;
            }
        }
        table[n] = c >>> 0;
    }
}

function strToArr(str) {
    // sweet hack to turn string into a 'byte' array
    return Array.prototype.map.call(str, function(c) {
        return c.charCodeAt(0);
    });
}

// Compute CRC with the help of a pre-calculated table
function calculateCRC(arr) {
    if (!arr) {
        return;
    }
    let crc = 0 ^ -1;
    for (let i = 0, l = arr.length; i < l; i += 1) {
        crc = (crc >>> 8) ^ table[(crc ^ arr[i]) & 0xff];
    }
    return crc ^ -1;
}

export function crc32(val) {
    val = typeof val === "string" ? strToArr(val) : val;
    const ret = calculateCRC(val);
    return ret >>> 0;
}

