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
  const CONNECTION = { networkNameOrChainId: "rinkeby" };

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
      ensAddresses.ensAddress
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
          owners: [`0x${'0'.repeat(40)}`, `0x${'0'.repeat(40)}`],
          threshold: 1,
        },
         safeDeploymentConfig: {
          saltNonce: "20",
          version: "1.3.0",
        }, 
        connection: CONNECTION,
        options: {},
      },
      client,
      wrapperUri

      //sethereumUri
    );
    console.log("response", deploySafeResponse);

    expect(deploySafeResponse).toBeTruthy();
    expect(deploySafeResponse.error).toBeFalsy();
    expect(deploySafeResponse.data).toBeTruthy();

    const contractAddress = deploySafeResponse.data;

    expect(contractAddress).toBeTruthy();
  });
});
