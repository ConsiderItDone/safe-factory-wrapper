import {
  encodeSetupCallData,
  getSafeContractAddress,
  isContractDeployed,
  validateSafeAccountConfig,
  validateSafeDeploymentConfig,
} from "./utils";
import {
  Args_deploySafe,
  Datetime_Module,
  Ethereum_Module,
  Safe_Ethereum_Connection,
  Safe_Module,
} from "./wrap";

export function deploySafe(args: Args_deploySafe): string {
  validateSafeAccountConfig(args.safeAccountConfig);
  if (args.safeDeploymentConfig != null) {
    validateSafeDeploymentConfig(args.safeDeploymentConfig!);
  }

  const signerAddress = Ethereum_Module.getSignerAddress({
    connection: args.connection,
  }).unwrap();

  const initializer = encodeSetupCallData(args.safeAccountConfig);

  let saltNonce: string = "";
  let safeContractVersion: string = "";

  if (args.safeDeploymentConfig != null) {
    if (args.safeDeploymentConfig!.saltNonce != null) {
      saltNonce = args.safeDeploymentConfig!.saltNonce;
    }
    if (args.safeDeploymentConfig!.version != null) {
      safeContractVersion = args.safeDeploymentConfig!.version!;
    }
  } else {
    const timestamp = Datetime_Module.currentTimestamp({}).unwrap();
    const res = timestamp.mul(1000); //.add(Math.floor(Math.random() * 1000)); // TODO Math.random()

    saltNonce = res.toString();
    safeContractVersion = "1.3.0";
    /* saltNonce = (Date.now() * 1000 + Math.floor(Math.random() * 1000)).toString(); */
  }

  if (args.options != null) {
    if (!args.options!.gas && !args.options!.gasLimit) {
      throw new Error(
        "Cannot specify gas and gasLimit together in transaction options"
      );
    }
  }

  /*   const safeAddress = await this.#safeProxyFactoryContract.createProxy({
    safeMasterCopyAddress: this.#gnosisSafeContract.getAddress(),
    initializer,
    saltNonce,
    options: {
      from: signerAddress,
      ...options,
    },
    callback,
  }); */
  let connection: Safe_Ethereum_Connection | null = null;
  if (args.connection != null) {
    connection = {
      node: args.connection!.node,
      networkNameOrChainId: args.connection!.networkNameOrChainId,
    };
  }

  const chainId = Ethereum_Module.getNetwork({
    connection: args.connection,
  }).unwrap().chainId;

  //https://github.com/safe-global/safe-deployments/tree/main/src/assets - contract adressess
  const safeContractAddress = getSafeContractAddress(
    safeContractVersion,
    chainId.toString()
  );

  const safeAddress = Safe_Module.createProxy({
    safeMasterCopyAddress: safeContractAddress,
    address: safeContractAddress,
    connection: connection,
    initializer: initializer,
    saltNonce: <u32>Number.parseInt(saltNonce),
  });

  // https://github.com/safe-global/safe-core-sdk/blob/a0fefbf2f8aed39b17de2cad27f86b46e732d1c3/packages/safe-ethers-lib/src/EthersAdapter.ts#L149
  /*   const isContractDeployed = await this.#ethAdapter.isContractDeployed(
    safeAddress
  ); */

  const contractDeployed = isContractDeployed("");

  if (!contractDeployed) {
    throw new Error(
      "SafeProxy contract is not deployed on the current network"
    );
  }

  /*   const safe = await Safe.create({
    ethAdapter: this.#ethAdapter,
    safeAddress,
    isL1SafeMasterCopy: this.#isL1SafeMasterCopy,
    contractNetworks: this.#contractNetworks,
  });
  return safe; */

  return "";
}
