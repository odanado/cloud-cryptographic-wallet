import { it, expect, describe } from "vitest";
import Web3 from "web3";
import { ethers } from "ethers";
import {
  recoverTypedSignature,
  SignTypedDataVersion,
} from "@metamask/eth-sig-util";
import omit from "lodash.omit";

import { KmsProvider } from "../../../aws-kms-packages/aws-kms-provider";
import { getConfig } from "../../config";

const { region, keyId, rpcUrl } = getConfig();

it("web3.js", async () => {
  const provider = new KmsProvider(rpcUrl, { region, keyIds: [keyId] });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const web3 = new Web3(provider as any);

  const accounts = await web3.eth.getAccounts();

  const message = "poyo";
  const signature = await web3.eth.sign(message, accounts[0]);

  await expect(web3.eth.personal.ecRecover(message, signature)).resolves.toBe(
    accounts[0].toLowerCase()
  );
  expect(web3.eth.accounts.recover(message, signature)).toBe(accounts[0]);
});

describe.only("EIP-712", () => {
  const fixture = {
    v1: {
      msgParams: [
        {
          type: "string",
          name: "Message",
          value: "Hi, Alice!",
        },
        {
          type: "uint32",
          name: "A number",
          value: "1337",
        },
      ],
    },
    v4: {
      domain: {
        name: "Ether Mail",
        version: "1",
        chainId: 1,
        verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
      },
      types: {
        Person: [
          { name: "name", type: "string" },
          { name: "wallet", type: "address" },
        ],
        Mail: [
          { name: "from", type: "Person" },
          { name: "to", type: "Person" },
          { name: "contents", type: "string" },
        ],
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
      },
      value: {
        from: {
          name: "Cow",
          wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
        },
        to: {
          name: "Bob",
          wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
        },
        contents: "Hello, Bob!",
      },
    },
  };

  it("eth_signTypedData", async () => {
    const provider = new KmsProvider(rpcUrl, { region, keyIds: [keyId] });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const web3 = new Web3(provider as any);

    const accounts = await web3.eth.getAccounts();
    const from = accounts[0];
    const msgParams = fixture.v1.msgParams;

    const signature = await new Promise<string>((resolve, reject) => {
      provider.sendAsync(
        {
          id: 42,
          jsonrpc: "2.0",
          method: "eth_signTypedData",
          params: [from, JSON.stringify(msgParams)],
        },
        (err, response) => {
          if (err) return reject(err);
          if (!response) return reject();
          resolve(response.result);
        }
      );
    });

    const recovered = recoverTypedSignature({
      data: msgParams,
      signature,
      version: SignTypedDataVersion.V1,
    });

    expect(recovered).toBe(from.toLowerCase());
  });

  it("eth_signTypedData_v4", async () => {
    const domain = fixture.v4.domain;
    const types = fixture.v4.types;
    const value = fixture.v4.value;

    const provider = new KmsProvider(rpcUrl, { region, keyIds: [keyId] });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const web3 = new Web3(provider as any);

    const accounts = await web3.eth.getAccounts();
    const from = accounts[0];

    const signature = await new Promise<string>((resolve, reject) => {
      provider.sendAsync(
        {
          id: 42,
          jsonrpc: "2.0",
          method: "eth_signTypedData_v4",
          params: [
            from,
            JSON.stringify({
              types,
              domain,
              primaryType: "Mail",
              message: value,
            }),
          ],
        },
        (err, response) => {
          if (err) return reject(err);
          if (!response) return reject();
          resolve(response.result);
        }
      );
    });

    const recovered = recoverTypedSignature({
      data: {
        domain,
        types,
        primaryType: "Mail",
        message: value,
      },
      signature,
      version: SignTypedDataVersion.V4,
    });

    expect(recovered).toBe(from.toLowerCase());
  });

  describe("ethers.js", () => {
    it("signTypedData", async () => {
      const domain = fixture.v4.domain;
      const types = fixture.v4.types;
      const omitedTypes = omit(fixture.v4.types, "EIP712Domain");
      const value = fixture.v4.value;

      const baseProvider = new KmsProvider(rpcUrl, { region, keyIds: [keyId] });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const provider = new ethers.providers.Web3Provider(baseProvider as any);
      const signer = provider.getSigner();
      const signature = await signer._signTypedData(domain, omitedTypes, value);

      const address = await signer.getAddress();

      const recovered = recoverTypedSignature({
        data: {
          domain,
          types,
          primaryType: "Mail",
          message: value,
        },
        signature,
        version: SignTypedDataVersion.V4,
      });

      expect(recovered).toBe(address.toLowerCase());
    });
  });
});
