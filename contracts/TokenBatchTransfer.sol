// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
/**
 * @title TokenBatchTransfer
 * Contract to manage batch transfers of ERC20 tokens.
 */
contract TokenBatchTransfer is OwnableUpgradeable {
    IERC20 public token; // Address of token contract
    address public transferOperator; // Address to manage the Transfers
    // Events
    event NewOperator(address indexed newOperator);
    event WithdrawToken(address indexed owner, uint256 stakeAmount);
    event WithdrawNative(address indexed owner, uint256 amount);
    event BatchTransferNative(address indexed operator, uint256 totalAmount);

    ///@custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }
    function initialize(
        address _token
    ) initializer public virtual {
        __Ownable_init(msg.sender);
        token = IERC20(_token);
        transferOperator = msg.sender;
    }

    // Modifiers
    modifier onlyOperator() {
        require(
            msg.sender == transferOperator,
            "Only operator can call this function."
        );
        _;
    }

    receive() external payable {}

    function updateOperator(address newOperator) public onlyOwner {
        require(newOperator != address(0), "Invalid operator address");
        transferOperator = newOperator;
        emit NewOperator(newOperator);
    }

    // To withdraw native tokens from contract
    function withdrawNative(uint256 value) public onlyOperator {
        require(address(this).balance >= value, "Not enough native balance");
        payable(msg.sender).transfer(value);
        emit WithdrawNative(msg.sender, value);
    }


    // To withdraw tokens from contract, to deposit directly transfer to the contract
    function withdrawToken(uint256 value) public onlyOperator {
        require(token.balanceOf(address(this)) >= value, "Not enough balance in the contract");
        require(token.transfer(msg.sender, value), "Unable to transfer token to the owner account");
        emit WithdrawToken(msg.sender, value);
    }

    // To transfer tokens from Contract to the provided list of token holders with respective amount
    function batchTransfer(address[] calldata tokenHolders, uint256[] calldata amounts)
    external
    onlyOperator
    {
        require(tokenHolders.length == amounts.length, "Arguments must have the same length");
        for (uint256 index = 0; index < tokenHolders.length; index++) {
            require(token.transfer(tokenHolders[index], amounts[index]), "Unable to transfer token to the account");
        }
    }

    // To transfer native tokens from Contract to the provided list of addresses with respective amounts
    function batchTransferNative(address[] calldata recipients, uint256[] calldata amounts)
    external
    onlyOperator
    {
        require(recipients.length == amounts.length, "Arrays must have the same length");
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            totalAmount += amounts[i];
        }
        require(address(this).balance >= totalAmount, "Not Enough native balance");
        for (uint256 i = 0; i < recipients.length; i++) {
            payable(recipients[i]).transfer(amounts[i]);
        }
        emit BatchTransferNative(msg.sender, totalAmount);
    }
}