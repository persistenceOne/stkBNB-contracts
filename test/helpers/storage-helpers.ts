import { BigNumber } from 'ethers';
import { ethers, network } from 'hardhat';

export async function setClaimReserve(
    contractAddress: string,
    amount: BigNumber
) {
    // slot of _claimReserve
    const CLAIM_RESERVE_SLOT = 215;
    await network.provider.send("hardhat_setStorageAt", [
        contractAddress,
        ethers.utils.hexlify(CLAIM_RESERVE_SLOT),
        ethers.utils.hexZeroPad(amount.toHexString(), 32)
    ]);
}

export async function setClaimRequest(
    contractAddress: string,
    userAddress: string,
    weiToReturn: BigNumber,
    timestamp: number,
    count: number = 1
) {
    // slot of claimReqs mapping
    const CLAIM_REQS_SLOT = 218;

    // Calculate the slot for the specific address's array
    const arraySlot = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
            ['address', 'uint256'],
            [userAddress, CLAIM_REQS_SLOT]
        )
    );

    // Set array length to count
    await network.provider.send("hardhat_setStorageAt", [
        contractAddress,
        arraySlot,
        ethers.utils.hexZeroPad(ethers.utils.hexlify(count), 32)
    ]);

    // Calculate base slot for array data
    const baseArrayDataSlot = ethers.utils.keccak256(arraySlot);

    // Each struct takes 2 slots (weiToReturn and createdAt)
    // So for index i, the slots are:
    // baseArrayDataSlot + (i * 2) for weiToReturn
    // baseArrayDataSlot + (i * 2) + 1 for createdAt
    const startIndex = 0;
    const endIndex = count;

    for (let i = startIndex; i < endIndex; i++) {
        // Calculate slots for this element
        const weiToReturnSlot = ethers.BigNumber.from(baseArrayDataSlot).add(i * 2).toHexString();
        const createdAtSlot = ethers.BigNumber.from(baseArrayDataSlot).add(i * 2 + 1).toHexString();

        // Set weiToReturn
        await network.provider.send("hardhat_setStorageAt", [
            contractAddress,
            weiToReturnSlot,
            ethers.utils.hexZeroPad(weiToReturn.toHexString(), 32)
        ]);

        // Set createdAt
        await network.provider.send("hardhat_setStorageAt", [
            contractAddress,
            createdAtSlot,
            ethers.utils.hexZeroPad(ethers.BigNumber.from(timestamp).toHexString(), 32)
        ]);
    }
} 