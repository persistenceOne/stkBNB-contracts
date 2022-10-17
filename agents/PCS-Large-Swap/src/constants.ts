import { BigNumber } from "ethers";

const STKBNB_POOL_ADDRESS = "0xaa2527ff1893e0d40d4a454623d362b79e8bb7f1";
const STKBNB_TOKEN_ADDRESS = "0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16";
const WBNB_TOKEN_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const TOKEN_0 = "WBNB";
const TOKEN_1 = "stkBNB";

const LARGE_THRESHOLD = BigNumber.from("1"); // set to 1 percent to receive alerts for swaps in 70-150 BNB range. Can be set to 0%-99% theoretically, realistically should be set to 1-20%.

const SWAP_EVENT =
  "event Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out,uint amount1Out,address indexed to)";
const ERC20_ABI = ["function balanceOf(address account) public view returns (uint256)"];
const PANCAKE_PAIR_ABI = [
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
];
const PANCAKE_FACTORY_ADDRESS = "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73";
const INIT_CODE_PAIR_HASH = "0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5";

export {
  SWAP_EVENT,
  LARGE_THRESHOLD,
  ERC20_ABI,
  PANCAKE_PAIR_ABI,
  PANCAKE_FACTORY_ADDRESS,
  INIT_CODE_PAIR_HASH,
  STKBNB_POOL_ADDRESS,
  STKBNB_TOKEN_ADDRESS,
  WBNB_TOKEN_ADDRESS,
  TOKEN_0,
  TOKEN_1,
};
