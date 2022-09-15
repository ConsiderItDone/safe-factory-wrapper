import {
  ContractNetworksConfig,
  Ethereum_Connection,
  Ethereum_Module,
  Logger_Module,
  SafeAccountConfig,
  SafeDeploymentConfig,
  Safe_Module,
} from "../wrap";
import { BigInt } from "@polywrap/wasm-as";
import versionMap from "./contractAddresses";
import { JSON } from "@polywrap/wasm-as";

export const ZERO_ADDRESS = `0x${"0".repeat(40)}`;
export const EMPTY_DATA = "0x";

export const validateSafeAccountConfig = (config: SafeAccountConfig): void => {
  if (config.owners.length <= 0)
    throw new Error("Owner list must have at least one owner");

  const threshold = config.threshold;

  if (threshold) {
    if (threshold <= 0)
      throw new Error("Threshold must be greater than or equal to 1");
    if (threshold > <u32>config.owners.length)
      throw new Error("Threshold must be lower than or equal to owners length");
  }
};

export const validateSafeDeploymentConfig = (
  config: SafeDeploymentConfig
): void => {
  if (BigInt.from(config.saltNonce).lt(0))
    throw new Error("saltNonce must be greater than or equal to 0");
};

export function encodeSetupCallData(accountConfig: SafeAccountConfig): string {
  const args: string[] = [];

  args.push(JSON.from(accountConfig.owners).stringify());

  const threshold = accountConfig.threshold.toString();

  args.push(<string>threshold);

  if (accountConfig.to != null) {
    args.push(accountConfig.to!);
  } else {
    args.push(ZERO_ADDRESS);
  }
  if (accountConfig.data != null) {
    args.push(accountConfig.data!);
  } else {
    args.push(EMPTY_DATA);
  }
  if (accountConfig.fallbackHandler != null) {
    args.push(accountConfig.fallbackHandler!);
  } else {
    args.push(ZERO_ADDRESS);
  }
  if (accountConfig.paymentToken != null) {
    args.push(accountConfig.paymentToken!);
  } else {
    args.push(ZERO_ADDRESS);
  }
  if (accountConfig.payment) {
    args.push(accountConfig.payment!.toString());
  } else {
    args.push("0");
  }
  if (accountConfig.paymentReceiver != null) {
    args.push(accountConfig.paymentReceiver!);
  } else {
    args.push(ZERO_ADDRESS);
  }

  return Safe_Module.encode({
    method:
      "function setup(address[] calldata _owners, uint256 _threshold, address to, bytes calldata data, address fallbackHandler, address paymentToken, uint256 payment, address payable paymentReceiver)",
    args: args,
  }).unwrap();
}

export function getSafeContractAddress(
  safeVersion: string,
  chainId: string
): string {
  return "0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552";
  const versionSupported = versionMap.has(safeVersion);

  if (!versionSupported) {
    throw new Error("Version isn't supported");
  } else {
    const version = versionMap.get(safeVersion)!;
    const hasContractAddress = version.has(chainId);
    if (hasContractAddress) {
      const contractAddress = version.get(chainId);
      return contractAddress!;
    } else {
      return "0x3E5c63644E683549055b9Be8653de26E0B4CD36E";
      throw new Error("No contract for provided chainId");
    }
  }
}
export function getSafeFactoryContractAddress(
  safeVersion: string,
  chainId: string
): string {
  return "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2";
}

export function isContractDeployed(
  address: string,
  connection: Ethereum_Connection | null
  //defaultBlock?: string
): boolean {
  //https://github.com/ethers-io/ethers.js/blob/44cbc7fa4e199c1d6113ceec3c5162f53def5bb8/packages/providers/src.ts/etherscan-provider.ts#L286
  //const contractCode = this.getContractCode(address, defaultBlock)
  //return contractCode !== '0x'
  const code = Ethereum_Module.sendRPC({
    method: "eth_getCode",
    connection: connection,
    params: [address, "pending"],
  }).unwrap();

  if (code != null) {
    return code != "0x";
  }
  return false;
}

export function getContractNetworks(
  safeVersion: string,
  chainId: string
): ContractNetworksConfig {
  //https://github.com/safe-global/safe-core-sdk/blob/a0fefbf2f8aed39b17de2cad27f86b46e732d1c3/packages/safe-core-sdk/tests/utils/setupContractNetworks.ts#L4

  const version = versionMap.get(safeVersion);

  if (!version) {
    throw new Error("Version isn't supported");
  } else {
    const contractAddress = version.get(chainId);
    if (!contractAddress) {
      throw new Error("No contract network config for provided chainId");
    } else {
      return {
        //TODO mapping for contract adressess
        multiSendAddress: "",
        multiSendCallOnlyAddress: "",
        safeMasterCopyAddress: contractAddress,
        safeProxyFactoryAddress: "",
      };
    }
  }
}
