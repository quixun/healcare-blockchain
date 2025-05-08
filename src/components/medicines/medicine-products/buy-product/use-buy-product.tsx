import Web3Service from "@/services/web3Service";
import { ABI_BUY_PRODUCT, contractAddress } from "../config";


export const buyProduct = async (id: number, priceInEther: string) => {
  try {
    const web3 = Web3Service.getInstance().getWeb3();
    const accounts = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(ABI_BUY_PRODUCT, contractAddress);

    await contract.methods.buyProduct(id).send({
      from: accounts[0],
      value: web3.utils.toWei(priceInEther, "ether"),
    });

    alert("Purchase successful!");
  } catch (error) {
    console.error("Purchase failed:", error);
    alert("Failed to purchase product");
  }
};