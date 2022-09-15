import { PolywrapClient } from "@polywrap/client-js";
import {
  initTestEnvironment,
  stopTestEnvironment,
  providers,
  ensAddresses,
} from "@polywrap/test-env-js";
import * as App from "../types/wrap";
import path from "path";

import { getPlugins } from "../utils";

jest.setTimeout(500000);

//export const itif = (condition: boolean) => (condition ? it : it.skip)

export const SAFE_LAST_VERSION = "1.3.0";
export const SAFE_BASE_VERSION = "1.1.1";

describe("SafeProxyFactory", () => {
  const CONNECTION = { networkNameOrChainId: "ropsten" };

  let client: PolywrapClient;

  const wrapperPath: string = path.join(
    path.resolve(__dirname),
    "..",
    "..",
    ".."
  );
  const wrapperUri = `fs/${wrapperPath}/build`;

  beforeAll(async () => {
    await initTestEnvironment();

    const config = getPlugins(
      providers.ethereum,
      providers.ipfs,
      ensAddresses.ensAddress,
      CONNECTION.networkNameOrChainId
    );
    client = new PolywrapClient(config);
  });

  afterAll(async () => {
    await stopTestEnvironment();
  });

  describe("create", async () => {
    it("should fail if the current network is not a default network and no contractNetworks is provided", () => {});
    it("should fail if the contractNetworks provided are not deployed", async () => {});
    it("should instantiate the SafeProxyFactory", async () => {});
  });
  describe("getEthAdapter", async () => {
    it("should return the connected EthAdapter", async () => {});
  });
  describe("getChainId", async () => {
    it("should return the chainId of the current network", async () => {});
  });
  describe("predictSafeAddress", async () => {
    it("should fail if there are no owners", async () => {});
    it("should fail if the threshold is lower than 0", async () => {});
    it("should fail if the threshold is higher than the threshold", async () => {});
    it("should fail if the saltNonce is lower than 0", async () => {});
    it("should predict a new Safe with saltNonce", async () => {});
  });
  describe("deploySafe", async () => {
    it("should fail if there are no owners", async () => {});
    it("should fail if the threshold is lower than 0", async () => {});
    it("should fail if the threshold is higher than the threshold", async () => {});
    it("should fail if the saltNonce is lower than 0", async () => {});
    it("should deploy a new Safe without saltNonce", async () => {});
    it("should deploy a new Safe with saltNonce", async () => {});
    it("should deploy a new Safe with callback", async () => {});
    /*     itif(safeVersionDeployed === SAFE_LAST_VERSION)(
      "should deploy last Safe version by default",
      async () => {}
    ); */
    it("should deploy a specific Safe version", async () => {});
  });
  it("deploySafe", async () => {
    const deploySafeResponse = await App.Factory_Module.deploySafe(
      {
        safeAccountConfig: {
          owners: [`0xd405aebF7b60eD2cb2Ac4497Bddd292DEe534E82`],
          threshold: 1,
        },
        connection: CONNECTION,
        //options: {},
        txOverrides: { gasLimit: "1000000", gasPrice: "20" },
      },
      client,
      wrapperUri
    );
    console.log("response", deploySafeResponse);

    expect(deploySafeResponse).toBeTruthy();
    expect(deploySafeResponse.error).toBeFalsy();
    expect(deploySafeResponse.data).toBeTruthy();

    const contractAddress = deploySafeResponse.data;

    expect(contractAddress).toBeTruthy();
  });
});
