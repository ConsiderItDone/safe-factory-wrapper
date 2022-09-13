import {
  encodeSetupCallData,
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
  if (args.safeDeploymentConfig != null) {
    if (args.safeDeploymentConfig!.saltNonce != null) {
      saltNonce = args.safeDeploymentConfig!.saltNonce;
    }
  } else {
    const timestamp = Datetime_Module.currentTimestamp({}).unwrap();
    const res = timestamp.mul(1000); //.add(Math.floor(Math.random() * 1000)); // TODO Math.random()

    saltNonce = res.toString();
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

  const safeAddress = Safe_Module.createProxy({
    safeMasterCopyAddress: signerAddress,
    address: "",
    connection: connection,
    initializer: initializer,
    saltNonce: <u32>Number.parseInt(saltNonce),
  });

  /*   const isContractDeployed = await this.#ethAdapter.isContractDeployed(
    safeAddress
  ); */

  // const isContractDeployed =

  /*   if (!isContractDeployed) {
    throw new Error(
      "SafeProxy contract is not deployed on the current network"
    );
  } */
  /*   const safe = await Safe.create({
    ethAdapter: this.#ethAdapter,
    safeAddress,
    isL1SafeMasterCopy: this.#isL1SafeMasterCopy,
    contractNetworks: this.#contractNetworks,
  });
  return safe; */

  return "";
}
