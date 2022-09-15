import { BigInt } from "@polywrap/wasm-as";
import {
  encodeSetupCallData,
  getContractNetworks,
  getSafeContractAddress,
  getSafeFactoryContractAddress,
  isContractDeployed,
  validateSafeAccountConfig,
  validateSafeDeploymentConfig,
} from "./utils";
import {
  Args_deploySafe,
  Datetime_Module,
  Ethereum_Module,
  Logger_Module,
  SafePayload,
  Safe_Ethereum_Connection,
  Safe_Ethereum_TxOverrides,
  Safe_Module,
} from "./wrap";

export function deploySafe(args: Args_deploySafe): SafePayload | null {
  validateSafeAccountConfig(args.safeAccountConfig);

  if (args.safeDeploymentConfig != null) {
    validateSafeDeploymentConfig(args.safeDeploymentConfig!);
  }

  const initializer = encodeSetupCallData(args.safeAccountConfig);

  Logger_Module.log({ level: 0, message: "initializer" + initializer });

  let saltNonce: string = "";
  let safeContractVersion: string = "";
  let isL1Safe = false;

  if (args.safeDeploymentConfig != null) {
    if (args.safeDeploymentConfig!.saltNonce != null) {
      saltNonce = args.safeDeploymentConfig!.saltNonce;
    }
    if (args.safeDeploymentConfig!.version != null) {
      safeContractVersion = args.safeDeploymentConfig!.version!;
    }
    if (args.safeDeploymentConfig!.isL1Safe) {
      isL1Safe = true;
    }
  } else {
    const timestamp = Datetime_Module.currentTimestamp({}).unwrap();
    const res = timestamp.mul(1000); //.add(Math.floor(Math.random() * 1000)); // TODO Math.random()

    saltNonce = res.toString();

    Logger_Module.log({ level: 0, message: "saltNonce" + saltNonce });
    safeContractVersion = "1.3.0";
    /* saltNonce = (Date.now() * 1000 + Math.floor(Math.random() * 1000)).toString(); */
  }

  if (args.options != null) {
    if (args.options!.gas && args.options!.gasLimit) {
      throw new Error(
        "Cannot specify gas and gasLimit together in transaction options"
      );
    }
  }

  let connection: Safe_Ethereum_Connection | null = null;
  if (args.connection != null) {
    connection = {
      node: args.connection!.node,
      networkNameOrChainId: args.connection!.networkNameOrChainId,
    };
  }

  let txOverrides: Safe_Ethereum_TxOverrides | null = null;

  if (args.txOverrides != null) {
    txOverrides = { value: null, gasLimit: null, gasPrice: null };
    if (args.txOverrides!.value) {
      txOverrides.value = args.txOverrides!.value;
    }
    if (args.txOverrides!.gasLimit) {
      txOverrides.gasLimit = args.txOverrides!.gasLimit;
    }
    if (args.txOverrides!.gasPrice) {
      txOverrides.gasPrice = args.txOverrides!.gasPrice;
    }
  }

  const chainId = Ethereum_Module.getNetwork({
    connection: args.connection,
  }).unwrap().chainId;

  Logger_Module.log({ level: 0, message: "chainId: " + chainId.toString() });

  //https://github.com/safe-global/safe-deployments/tree/main/src/assets - contract adressess

  const safeContractAddress = getSafeContractAddress(
    safeContractVersion,
    chainId.toString()
  );

  const safeFactoryContractAddress = getSafeFactoryContractAddress(
    safeContractVersion,
    chainId.toString()
  );

  Logger_Module.log({
    level: 0,
    message: "safeFactoryContractAddress" + safeFactoryContractAddress,
  });

  Logger_Module.log({
    level: 0,
    message: "safeContractAddress" + safeContractAddress,
  });

  const safeAddress = Safe_Module.createProxy({
    safeMasterCopyAddress: safeContractAddress,
    address: safeFactoryContractAddress,
    connection: connection,
    initializer: initializer,
    saltNonce: <u32>BigInt.from(saltNonce).toUInt64(),
    txOverrides: txOverrides,
  }).unwrap();

  if (safeAddress != null) {
    Logger_Module.log({
      level: 0,
      message: "safeAddress" + safeAddress!,
    });

    const contractDeployed = isContractDeployed(safeAddress!, args.connection);

    if (!contractDeployed) {
      throw new Error(
        "SafeProxy contract is not deployed on the current network"
      );
    } else {
      return {
        safeAddress: safeAddress!,
        isL1SafeMasterCopy: isL1Safe,
        contractNetworks: getContractNetworks(
          safeContractVersion,
          chainId.toString()
        ),
      };
    }
  }

  return null;
}
