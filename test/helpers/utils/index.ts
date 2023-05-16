/**
 * Removes the leading zeroes.
 * @param hexString Required "0x" prefix.
 * @returns 
 */
export function removeLeadingZeros(hexString: string): string {
  if (hexString.length < 2) {
    throw new Error(`Invalid hex string length. ${hexString}: ${hexString.length}`);
  }
  // Remove any "0x" prefix if present
  hexString = hexString.replace(/^0x/, "");

  // Remove any leading zeros
  hexString = hexString.replace(/^0+/, "");

  // Add back the "0x" prefix if the string is not empty
  if (hexString.length > 0) {
    hexString = `0x${hexString}`;
  } else {
    hexString = "0x0";
  }

  return hexString;
}
