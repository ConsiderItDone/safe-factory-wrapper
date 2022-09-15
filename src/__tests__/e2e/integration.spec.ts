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

describe("ProxyFactory", () => {
  const CONNECTION = { networkNameOrChainId: "ropsten" };

  let client: PolywrapClient;

  const wrapperPath: string = path.join(
    path.resolve(__dirname),
    "..",
    "..",
    ".."
  );
  const wrapperUri = `fs/${wrapperPath}/build`;
  //const ethereumUri = "ens/ethereum.polywrap.eth";

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

  it("deploySafe", async () => {
    const deploySafeResponse = await App.Factory_Module.deploySafe(
      {
        safeAccountConfig: {
          owners: [`0xd405aebF7b60eD2cb2Ac4497Bddd292DEe534E82`],
          threshold: 1,
        },
        connection: CONNECTION,
        options: {},
        txOverrides: { gasLimit: "10000000" },
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
