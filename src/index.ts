import { BigInt } from "@polywrap/wasm-as";
import {
  encodeSetupCallData,
  getMultiSendCallOnlyContractAddress,
  getMultiSendContractAddress,
  getSafeContractAddress,
  getSafeFactoryContractAddress,
  isContractDeployed,
  validateSafeAccountConfig,
  validateSafeDeploymentConfig,
} from "./utils";
import {
  Args_deploySafe,
  Args_getChainId,
  Args_predictSafeAddress,
  Datetime_Module,
  Ethereum_Module,
  Logger_Module,
  SafePayload,
  SafeContracts_Ethereum_Connection,
  SafeContracts_Ethereum_TxOverrides,
  SafeContracts_Module,
} from "./wrap";

export function getChainId(args:Args_getChainId): String {
  return Ethereum_Module.getNetwork({
    connection: args.connection,
  }).unwrap().chainId.toString();
}

export function deploySafe(args: Args_deploySafe): SafePayload | null {
  validateSafeAccountConfig(args.safeAccountConfig);

  if (args.safeDeploymentConfig != null) {
    validateSafeDeploymentConfig(args.safeDeploymentConfig!);
  }

  const initializer = encodeSetupCallData(args.safeAccountConfig);

  Logger_Module.log({ level: 0, message: "initializer" + initializer });

  let saltNonce: string = "";
  let safeContractVersion: string = "1.3.0";
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

    /* saltNonce = (Date.now() * 1000 + Math.floor(Math.random() * 1000)).toString(); */
    saltNonce = res.toString();

    Logger_Module.log({ level: 0, message: "saltNonce" + saltNonce });
    safeContractVersion = "1.3.0";
  }

  let connection: SafeContracts_Ethereum_Connection | null = null;
  if (args.connection != null) {
    connection = {
      node: args.connection!.node,
      networkNameOrChainId: args.connection!.networkNameOrChainId,
    };
  }

  let txOverrides: SafeContracts_Ethereum_TxOverrides | null = null;

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
  const chainId = getChainId({connection: args.connection})

  Logger_Module.log({ level: 0, message: "chainId: " + chainId.toString() });

  const safeContractAddress = getSafeContractAddress(
    safeContractVersion,
    chainId.toString(),
    !isL1Safe
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

  const safeAddress = SafeContracts_Module.createProxy({
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
        contractNetworks: {
          multiSendAddress: getMultiSendContractAddress(
            safeContractVersion,
            chainId.toString()
          ),
          multiSendCallOnlyAddress: getMultiSendCallOnlyContractAddress(
            safeContractVersion,
            chainId.toString()
          ),
          safeMasterCopyAddress: safeContractAddress,
          safeProxyFactoryAddress: safeFactoryContractAddress,
        },
      };
    }
  }

  return null;
}

export function predictSafeAddress(args: Args_predictSafeAddress): bool {
  validateSafeAccountConfig(args.safeAccountConfig);
  if (args.safeDeploymentConfig !== null) {
    validateSafeDeploymentConfig(args.safeDeploymentConfig);
  }

  const chainId = getChainId({connection: args.connection});
  let safeContractVersion = "1.3.0";
  let isL1Safe = false;
  if (args.safeDeploymentConfig != null) {
    if (args.safeDeploymentConfig?.version != null) {
      safeContractVersion = args.safeDeploymentConfig?.version;
    }
    if (args.safeDeploymentConfig!.isL1Safe) {
      isL1Safe = true;
    }
  }

  const safeContractAddress = getSafeContractAddress(
    safeContractVersion,
    chainId.toString(),
    isL1Safe
  );
  const safeFactoryContractAddress = getSafeFactoryContractAddress(
    safeContractVersion,
    chainId.toString()
  );

  const from = safeFactoryContractAddress;
  const initializer = encodeSetupCallData(args.safeAccountConfig);
  const saltNonce = args.safeDeploymentConfig!.saltNonce;
  const salt = Ethereum_Module.solidityKeccak256({
    types: ["bytes", "uint256"],
    values: [
      Ethereum_Module.solidityKeccak256({
        types: ["bytes"],
        values: [initializer],
      }).unwrap(),
      saltNonce
    ]
  }).unwrap()

  const proxyCreationCode = Safe_Module.proxyCreationCode({
    address: safeFactoryContractAddress,
    connection: null
  }).unwrap();
  const constructorData = Ethereum_Module.encodeParams({
    types: ["address"],
    values: [safeContractAddress]
  })

  const initCodeHash = Ethereum_Module.solidityKeccak256({
    types: ["bytes"],
    values: [proxyCreationCode + constructorData],
  });
  const addrHash = Ethereum_Module.solidityKeccak256({
    types: ["bytes", "address", "bytes32", "bytes32"],
    values: ["0xff", from, salt, initCodeHash.unwrap()],
  })
  const address = addrHash.unwrap().slice(-20);
  
  return Ethereum_Module.checkAddress({ address }).unwrap()
}