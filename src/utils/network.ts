export const getRpcDependingOnNetwork = (network: string) => {
    if (network === 'q') {
        return 'https://rpc.qtestnet.org/';
    }
    return process.env.POLYGON_RPC_URL;
}