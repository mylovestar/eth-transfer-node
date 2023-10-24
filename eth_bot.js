const ethers = require("ethers")
const Web3 = require("web3")
// const ethers = require("ethers");
// const provider = new ethers.JsonRpcProvider("https://eth.drpc.org");
// const provider = new ethers.JsonRpcProvider("https://bsc-testnet.publicnode.com");
// const provider = new ethers.JsonRpcProvider("https://data-seed-prebsc-1-s2.bnbchain.org:8545");
const provider = new ethers.JsonRpcProvider("https://binance.llamarpc.com");

const addressReceiver = "0xeD8881e05d9365A24312D1aA39C42431C85C80De";

// const privateKeys =
//     ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
//         "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
//         "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
//         "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a",
//         "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba",
//         "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e",
//         "0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356",
//         "0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97",
//         "0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6",
//         "0xf214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897",
//         "0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82",
//         "0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1",
//         "0x47c99abed3324a2707c28affff1267e45918ec8c3f20b8aa892e8b065d2942dd",
//         "0xc526ee95bf44d8fc405a158bb884d9d1238d99f0612e9f33d006bb0789009aaa",
//         "0x8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61",
//         "0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0",
//         "0x689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd",
//         "0xde9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0",
//         "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e"
//     ];

const privateKey = "0x07755e99f3d1c52c1ed0cb2483d58609fdecda78534446df889f59dd0dd16058";
// const web3 = new Web3.providers.htt("https://eth.drpc.org");

const bot = async () => {
    provider.on("block", async () => {
        console.log("Listening new block, waiting..)");
        // for (let i = 0; i < privateKeys.length; i++) {
        //     const _target = new ethers.Wallet(privateKeys[i]);
        const _target = new ethers.Wallet(privateKey);
        const target = _target.connect(provider);
        const balance = await provider.getBalance(target.address);
        // const txBuffer = web3.eth.getGasPrice().then(console.log)
        const feeData = await provider.getFeeData();
        const gasLimit = 25000n;
        const txBuffer = feeData.gasPrice * gasLimit;
        // console.log("txBuffer", feeData, txBuffer)
        // const txBuffer = ethers.parseEther(".005");
        // console.log('debug bal::', balance > txBuffer)
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
                // const realTx = {
                //     to: addressReceiver,
                //     value: balance - gasFee,
                //     gasLimit: gasLimit,
                //     gasPrice: feeData.gasPrice,
                // };
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


        // if ((balance - txBuffer) > 0) {
        //     console.log("NEW ACCOUNT WITH ETH!");
        //     const amount = balance - txBuffer;
        //     try {
        //         await target.sendTransaction({
        //             to: addressReceiver,
        //             value: amount
        //         });
        //         console.log(`Success! transfered --> ${ethers.formatEther(balance)}`);
        //     }
        //     catch (e) {
        //         console.log(`error: ${e}`);
        //     }
        // }
    });
}

bot();