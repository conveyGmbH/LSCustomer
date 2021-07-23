/*
 * JavaScript CRC-32 implementation
 */
(function () {
    "use strict";

	function crc32Generate(reversedPolynomial) {
        var table = new Array();
		for (var i = 0; i < 256; i++) {
			var n = i
			for (var j = 8; j > 0; j--) {
				if ((n & 1) === 1) {
                    n = (n >>> 1) ^ reversedPolynomial;
                } else {
                    n = n >>> 1;
                }
			}
            table[i] = n;
        }
        return table;
    }

	function crc32Initial() {
        return 0xFFFFFFFF;
    }

	function crc32AddByte(table, crc, byte) {
        crc = (crc >>> 8) ^ table[(byte) ^ (crc & 0x000000FF)];
        return crc;
    }

	function crc32Final(crc) {
        crc = ~crc;
        crc = (crc < 0) ? (0xFFFFFFFF + crc + 1) : crc;
        return crc;
    }

	function crc32ComputeString(reversedPolynomial, str) {
        var table = crc32Generate(reversedPolynomial);
        var crc = 0;
        crc = crc32Initial();
		for (var i = 0; i < str.length; i++) {
            crc = crc32AddByte(table, crc, str.charCodeAt(i));
        }
        crc = crc32Final(crc);
        return crc;
    }

	function crc32ComputeBuffer(reversedPolynomial, data) {
        var dataView = new DataView(data);
        var table = crc32Generate(reversedPolynomial);
        var crc = 0;
        crc = crc32Initial();
		for (var i = 0; i < dataView.byteLength; i++) {
            crc = crc32AddByte(table, crc, dataView.getUint8(i));
        }
        crc = crc32Final(crc);
        return crc;
    }

	function crc32Reverse(polynomial) {
        var reversedPolynomial = 0;
		for (var i = 0; i < 32; i++) {
            reversedPolynomial = reversedPolynomial << 1;
            reversedPolynomial = reversedPolynomial | ((polynomial >>> i) & 1);
        }
        return reversedPolynomial;
    }

	var polynomialCrc32 = 0x04C11DB7;
	var reverseCrc32 = crc32Reverse(polynomialCrc32);

	var globalObject =
        typeof window !== 'undefined' ? window :
        typeof self !== 'undefined' ? self :
        typeof global !== 'undefined' ? global :
        {};

    if (!globalObject.crc32) {
		globalObject.crc32 = {
			compute: function(data) {
                if (typeof data === "string") {
                    return crc32ComputeString(reverseCrc32, data);
                } else {
                    return crc32ComputeBuffer(reverseCrc32, data);
                }
			}
		}
	}
})();
