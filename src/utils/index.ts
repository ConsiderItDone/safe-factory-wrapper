import { SafeAccountConfig, SafeDeploymentConfig, Safe_Module } from "../wrap";
import { BigInt } from "@polywrap/wasm-as";

export const validateSafeAccountConfig = (config: SafeAccountConfig): void => {
  if (config.owners.length <= 0)
    throw new Error("Owner list must have at least one owner");

  const threshold = config.threshold.unwrap();

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
  
  args.push(accountConfig.owners.toString());
  
  const threshold = accountConfig.threshold.unwrap();

  if (threshold) {
    args.push(threshold.toString());
  }
  if (accountConfig.to != null) {
    args.push(accountConfig.to!);
  }
  if (accountConfig.data != null) {
    args.push(accountConfig.data!);
  }
  if (accountConfig.fallbackHandler != null) {
    args.push(accountConfig.fallbackHandler!);
  }
  if (accountConfig.paymentToken != null) {
    args.push(accountConfig.paymentToken!);
  }
  if (accountConfig.payment) {
    args.push(accountConfig.payment!.toString());
  }
  if (accountConfig.paymentReceiver != null) {
    args.push(accountConfig.paymentReceiver!);
  }

  return Safe_Module.encode({
    method: "setup",
    args: args,
  }).unwrap();
}
