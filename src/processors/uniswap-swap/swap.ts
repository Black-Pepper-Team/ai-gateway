import { ethers } from 'ethers';
import { FeeAmount, Pool } from '@uniswap/v3-sdk';
import { Token } from '@uniswap/sdk-core';
import { abi as IUniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import { abi as SwapRouterABI } from '@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json';

// Function to perform Uniswap V3 swap
export async function performUniswapV3Swap(
    provider: ethers.Provider,
    poolAddress: string,
    tokenIn: Token,
    tokenOut: Token,
    amountIn: string,
    recipient: string
): Promise<string> {
    const poolContract = new ethers.Contract(poolAddress, IUniswapV3PoolABI, provider);
    const [fee, liquidity, slot0] = await Promise.all([
        poolContract.fee(),
        poolContract.liquidity(),
        poolContract.slot0(),
    ]);

    const pool = new Pool(
        tokenIn,
        tokenOut,
        fee,
        slot0[0].toString(),
        liquidity.toString(),
        slot0[1]
    );

    const swapRouterAddress = '0xE592427A0AEce92De3Edee1F18E0157C05861564';
    const swapRouter = new ethers.Contract(swapRouterAddress, SwapRouterABI, provider);

    const params = {
        tokenIn: tokenIn.address,
        tokenOut: tokenOut.address,
        fee: fee,
        recipient: recipient,
        deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from now
        amountIn: amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
    };

    const transaction = await swapRouter.exactInputSingle(params);
    const receipt = await transaction.wait();

    return receipt.transactionHash;
}

// Function to get all pairs with price from Uniswap V3
export async function getAllPairsWithPrice(
    provider: ethers.Provider,
    factoryAddress: string
): Promise<Array<{ pairAddress: string; token0: Token; token1: Token; price: string }>> {
    const factoryABI = ['event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)'];
    const factoryContract = new ethers.Contract(factoryAddress, factoryABI, provider);

    const filter = factoryContract.filters.PoolCreated();
    const events = await factoryContract.queryFilter(filter);
    const pairs = await Promise.all(events.map(async (event) => {
        if (!('args' in event)) {
            return undefined;
        }

        const poolAddress = event.args.pool;
        const token0Address = event.args.token0;
        const token1Address = event.args.token1;
        const fee = event.args.fee;

        const poolContract = new ethers.Contract(poolAddress, IUniswapV3PoolABI, provider);
        const liquidity = await poolContract.liquidity();
        const slot0 = await poolContract.slot0();

        const chainId = await provider.getNetwork().then(n => Number(n.chainId));
        const token0Instance = await createTokenInstance(token0Address, chainId, provider);
        const token1Instance = await createTokenInstance(token1Address, chainId, provider);

        const pool = new Pool(
            token0Instance,
            token1Instance,
            Number(fee),
            slot0[0].toString(), // Convert BigNumber to string
            liquidity.toString(), // Convert BigNumber to string
            Number(slot0[1]),
        );

        const price = pool.token0Price.toSignificant(6);

        return {
            pairAddress: poolAddress,
            token0: token0Instance,
            token1: token1Instance,
            price,
        };
    }));

    return pairs.filter((pair): pair is { pairAddress: string; token0: Token; token1: Token; price: string } => pair !== undefined);
}
async function createTokenInstance(tokenAddress: string, chainId: number, provider: ethers.Provider): Promise<Token> {
    const { decimals } = await getTokenData(tokenAddress, provider);
    return new Token(chainId, tokenAddress, decimals);
}

async function getTokenData(tokenAddress: string, provider: ethers.Provider): Promise<{decimals: number}> {
    const tokenContract = new ethers.Contract(tokenAddress, ['function decimals() view returns (uint8)'], provider);
    const decimals = await tokenContract.decimals();
    return { decimals: Number(decimals) };
}
