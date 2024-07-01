import { ethers } from "ethers";
import { TokenEntity } from "../../entities/token.entity";

export interface TokenBalance {
    address: string;
    balance: string;
    token: TokenEntity;
}

export async function getTokenBalances(
    walletAddress: string,
    tokens: TokenEntity[],
    provider: ethers.JsonRpcProvider
): Promise<TokenBalance[]> {
    const erc20Abi = [
        "function balanceOf(address account) view returns (uint256)",
        "function decimals() view returns (uint8)"
    ];

    const balances: TokenBalance[] = [];

    for (const token of tokens) {
        try {
            let balance;
            let decimals: number;

            if (token.isNative) {
                balance = await provider.getBalance(walletAddress);
                decimals = 18;
            } else {
                const contract = new ethers.Contract(token.address, erc20Abi, provider);
                [balance, decimals] = await Promise.all([
                    contract.balanceOf(walletAddress),
                    contract.decimals()
                ]);
            }

            const adjustedBalance = ethers.formatUnits(balance, decimals);
            console.log('balance', adjustedBalance);
            balances.push({
                address: token.address,
                balance: adjustedBalance,
                token: token,
            });
        } catch (error) {
            console.error(`Error fetching balance for token ${token.address}:`, error);
        }
    }

    const result = balances.filter(balance => Number(balance.balance) > 0).map((balance) => {
        return { ...balance, balance: Number(balance.balance).toFixed(6) }
    });
    return result;
}
