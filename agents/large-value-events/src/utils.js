export function normalizeValue(value){
    value=value.div(ethers.constants.WeiPerEther)
    return value
}