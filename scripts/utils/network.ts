export function getNetwork(): string {
    // On running script e.g., deploy, It runs compile first which removes --network <network> parameters.
    // In order to preserve the network, we save it in a new environment variable: NETWORK_PATH.
    if (process.env.NETWORK_PATH === undefined) {
        for (let i = 0; i < process.argv.length; i++) {
            if (process.argv[i] === '--network') {
                process.env.NETWORK_PATH = process.argv[i + 1];
                break;
            }
        }
    }

    return process.env.NETWORK_PATH || ''; // return empty string, if no network was given
}

export function isLocalNetwork(network: string): boolean {
    return network === '' || network.startsWith('local') || network === 'hardhat';
}
