// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "hardhat/console.sol";

contract MyToken is ERC20Permit {
    bytes32 private constant PERMIT_TYPEHASH =
        keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
    constructor() ERC20("MyToken", "MTK") ERC20Permit("MyToken") {
        console.log("MyToken deployed to:", address(this));
    }


    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s) override public {
        console.log("permit called");
        // super.permit(owner, spender, value, deadline, v, r, s);
        console.log("deadline timestampa");
        console.logUint(block.timestamp);
        console.logUint(deadline);
        if (block.timestamp > deadline) {
            revert ERC2612ExpiredSignature(deadline);
        }

        console.log("deadline ok");

        bytes32 structHash = keccak256(abi.encode(PERMIT_TYPEHASH, owner, spender, value, _useNonce(owner), deadline));
        console.log("structHash ok");

        bytes32 hash = _hashTypedDataV4(structHash);
        console.log("hash ok");

        address signer = ECDSA.recover(hash, v, r, s);
        console.log("signer ok");
        console.log("signer:", signer);
        console.log("owner:", owner);
        if (signer != owner) {
            revert ERC2612InvalidSigner(signer, owner);
        }
        console.log("signer == owner ok");

        _approve(owner, spender, value);
    }
}
