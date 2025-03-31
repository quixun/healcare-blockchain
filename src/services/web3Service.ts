import Web3 from "web3";

class Web3Service {
  private static instance: Web3Service;
  private web3: Web3;

  private constructor(providerUrl: string) {
    this.web3 = new Web3(providerUrl);
  }

  // Hàm khởi tạo Singleton, nếu đã tồn tại instance thì trả về instance cũ
  public static getInstance(
    providerUrl = import.meta.env.VITE_PUBLIC_GARNACHO_RPC_URL
  ): Web3Service {
    if (!Web3Service.instance) {
      Web3Service.instance = new Web3Service(providerUrl);
    }
    return Web3Service.instance;
  }

  public getWeb3(): Web3 {
    return this.web3;
  }
}

export default Web3Service;
