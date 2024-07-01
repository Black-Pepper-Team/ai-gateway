import { ethers } from 'ethers';
import { sendClaudeRequest } from '../../utils/claude';
import { getTokenBalances } from '../get-balances/balances';
import { vanyaResponsePrompt } from '../../utils/gpt';
import { AppDataSource } from '../../db/config';
import { TokenEntity } from '../../entities/token.entity';
import { getRpcDependingOnNetwork } from '../../utils/network';
import { RequestEntity } from '../../entities/request.entity';

export async function transferTokenByPrivateKey(
    privateKey: string,
    requestText: string,
    network: string,   
    request: RequestEntity,
): Promise<{text: string, textToSay?: string}> {
    // Initialize provider for Ethereum network connection
    const provider = new ethers.JsonRpcProvider(getRpcDependingOnNetwork(network));
    
    // Create wallet instance from private key
    const wallet = new ethers.Wallet(privateKey, provider);

    // Find how much tokens you should transfer
    const transferAmountAndToken = `Parse the text and extract token transfers. Output should be in JSON format without any additional info:
    {
    "isValid": "[true/false]",
    "token": "[token name]",
    "amount": "[transfer amount]"
    }. Text is: ${requestText}. If request is not valid, return isValid false.`;
    const amounts = JSON.parse(await sendClaudeRequest(transferAmountAndToken));
    if (!amounts.isValid) {
        return { text: await vanyaResponsePrompt("Invalid request") }
    }

    const tokens = await AppDataSource.getRepository(TokenEntity).find({ where: { network: network } });
    // Find the balance of the sender and is it enough to transfer
    const balances = await getTokenBalances(wallet.address, tokens, provider);

    const isEnoughAndPossibleToTransferFromBalances = `Parse the amounts that you need to transfer and balances that you currently have.
    For response you should return this json:
    {
    "isEnough": "[true/false]",
    "token": "[token address from balances]",
    "amount": "[transfer amount]",
    "isNative": "[true/false]"
    }.
    Balances: ${JSON.stringify(balances)}, 
    Amounts: ${JSON.stringify(amounts)}
    Output should be in JSON format without any additional info, if it's native - return true and zero address, otherwise - false.
    `;

    const isItPossibleAndEnoughReponse = JSON.parse(await sendClaudeRequest(isEnoughAndPossibleToTransferFromBalances));
    if (!isItPossibleAndEnoughReponse.isEnough) {
        return { text: await vanyaResponsePrompt("Not enough tokens") }
    }

    const contacts = JSON.parse(request.contacts);
    const selectRecipientFromContacts = `Select recipient from contacts by name. Prompt to select recipient: ${request.prompt}. Contacts: ${JSON.stringify(contacts)}. Return just recepient address in string format. If no recipeint, return "No recipient". Output should be in without any additional info`;
    const recipientAddress = await sendClaudeRequest(selectRecipientFromContacts);

    if (recipientAddress === "No recipient") {
        return { text: await vanyaResponsePrompt("No recipient for this transfer") }
    }

    try {
        let tx;
        if (isItPossibleAndEnoughReponse.isNative) {
            // Send native token
            const amountInWei = ethers.parseEther(isItPossibleAndEnoughReponse.amount);
            tx = await wallet.sendTransaction({
                to: recipientAddress,
                value: amountInWei
            });
        } else {
            // ERC20 Token ABI for the transfer function
            const abi = [
                "function transfer(address to, uint256 amount) returns (bool)",
                "function decimals() view returns (uint8)"
            ];

            // Create a contract instance
            const contract = new ethers.Contract(isItPossibleAndEnoughReponse.token, abi, wallet);

            // Get token decimals
            const decimals = await contract.decimals();
            
            // Calculate the amount with decimals
            const amountWithDecimals = ethers.parseUnits(isItPossibleAndEnoughReponse.amount.toString(), decimals);
            
            // Send the transaction
            tx = await contract.transfer(recipientAddress, amountWithDecimals);
        }
        
        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        
        // Return the transaction hash
        return { text: await vanyaResponsePrompt(`Your transaction is successful. Transaction hash: ${receipt.hash}`), textToSay: 'Your transaction is successful.' }
    } catch (error) {
        console.error("Error transferring tokens:", error);
        return { text: await vanyaResponsePrompt("Failed to transfer tokens. Please check the amount and try again."), textToSay: 'Failed to transfer tokens.' }
    }
}
