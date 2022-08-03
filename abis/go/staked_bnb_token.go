// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package contracts

import (
	"errors"
	"math/big"
	"strings"

	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/event"
)

// Reference imports to suppress errors if they are not otherwise used.
var (
	_ = errors.New
	_ = big.NewInt
	_ = strings.NewReader
	_ = ethereum.NotFound
	_ = bind.Bind
	_ = common.Big1
	_ = types.BloomLookup
	_ = event.NewSubscription
)

// StakedBNBTokenMetaData contains all meta data concerning the StakedBNBToken contract.
var StakedBNBTokenMetaData = &bind.MetaData{
	ABI: "[{\"inputs\":[{\"internalType\":\"contractIAddressStore\",\"name\":\"addressStore_\",\"type\":\"address\"}],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"inputs\":[],\"name\":\"CallerIsNotTheOwner\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"NewOwnerIsTheZeroAddress\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"UnauthorizedSender\",\"type\":\"error\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"spender\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Approval\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"tokenHolder\",\"type\":\"address\"}],\"name\":\"AuthorizedOperator\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"},{\"indexed\":false,\"internalType\":\"bytes\",\"name\":\"operatorData\",\"type\":\"bytes\"}],\"name\":\"Burned\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"},{\"indexed\":false,\"internalType\":\"bytes\",\"name\":\"operatorData\",\"type\":\"bytes\"}],\"name\":\"Minted\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"previousOwner\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"OwnershipTransferred\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"}],\"name\":\"Paused\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"tokenHolder\",\"type\":\"address\"}],\"name\":\"RevokedOperator\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"},{\"indexed\":false,\"internalType\":\"bytes\",\"name\":\"operatorData\",\"type\":\"bytes\"}],\"name\":\"Sent\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Transfer\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"}],\"name\":\"Unpaused\",\"type\":\"event\"},{\"inputs\":[],\"name\":\"addressStore\",\"outputs\":[{\"internalType\":\"contractIAddressStore\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"holder\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"spender\",\"type\":\"address\"}],\"name\":\"allowance\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"spender\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"approve\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"}],\"name\":\"authorizeOperator\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"tokenHolder\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"burn\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"decimals\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"defaultOperators\",\"outputs\":[{\"internalType\":\"address[]\",\"name\":\"\",\"type\":\"address[]\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getOwner\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"granularity\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"tokenHolder\",\"type\":\"address\"}],\"name\":\"isOperatorFor\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"},{\"internalType\":\"bytes\",\"name\":\"userData\",\"type\":\"bytes\"},{\"internalType\":\"bytes\",\"name\":\"operatorData\",\"type\":\"bytes\"}],\"name\":\"mint\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"name\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"},{\"internalType\":\"bytes\",\"name\":\"operatorData\",\"type\":\"bytes\"}],\"name\":\"operatorBurn\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"sender\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"},{\"internalType\":\"bytes\",\"name\":\"operatorData\",\"type\":\"bytes\"}],\"name\":\"operatorSend\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"pause\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"paused\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"}],\"name\":\"revokeOperator\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"selfDestruct\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"send\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"symbol\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"totalSupply\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"transfer\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"holder\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"transferFrom\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"transferOwnership\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"unpause\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"}]",
	Bin: "0x60806040523480156200001157600080fd5b50604051620021a1380380620021a1833981016040819052620000349162000392565b604080518082018252600a81526929ba30b5b2b21021272160b11b602080830191825283518085018552600681526539ba35a1272160d11b81830152845160008152918201909452825133949262000090916002919062000294565b508151620000a690600390602085019062000294565b508051620000bc90600490602084019062000323565b5060005b81518110156200012c57600160056000848481518110620000e557620000e56200042b565b6020908102919091018101516001600160a01b03168252810191909152604001600020805460ff191691151591909117905580620001238162000401565b915050620000c0565b506040516329965a1d60e01b815230600482018190527fac7fbab5f54a3ca8194167523c6753bfeb96a445279294b6125b68cce217705460248301526044820152731820a4b7618bde71dce8cdc73aab6c95905fad24906329965a1d90606401600060405180830381600087803b158015620001a757600080fd5b505af1158015620001bc573d6000803e3d6000fd5b50506040516329965a1d60e01b815230600482018190527faea199e31a596269b42cdafd93407f14436db6e4cad65417994c2eb37381e05a60248301526044820152731820a4b7618bde71dce8cdc73aab6c95905fad2492506329965a1d9150606401600060405180830381600087803b1580156200023a57600080fd5b505af11580156200024f573d6000803e3d6000fd5b5050600980546001600160a01b039788166001600160a81b03199091161790555050600a80546001600160a01b03191695909416949094179092555062000441915050565b828054620002a290620003c4565b90600052602060002090601f016020900481019282620002c6576000855562000311565b82601f10620002e157805160ff191683800117855562000311565b8280016001018555821562000311579182015b8281111562000311578251825591602001919060010190620002f4565b506200031f9291506200037b565b5090565b82805482825590600052602060002090810192821562000311579160200282015b828111156200031157825182546001600160a01b0319166001600160a01b0390911617825560209092019160019091019062000344565b5b808211156200031f57600081556001016200037c565b600060208284031215620003a557600080fd5b81516001600160a01b0381168114620003bd57600080fd5b9392505050565b600181811c90821680620003d957607f821691505b60208210811415620003fb57634e487b7160e01b600052602260045260246000fd5b50919050565b60006000198214156200042457634e487b7160e01b600052601160045260246000fd5b5060010190565b634e487b7160e01b600052603260045260246000fd5b611d5080620004516000396000f3fe608060405234801561001057600080fd5b506004361061018e5760003560e01c8063959b8c3f116100de578063d95b637111610097578063f2fde38b11610071578063f2fde38b14610366578063fad8b32a14610379578063fc673c4f1461038c578063fe9d93031461039f57600080fd5b8063d95b637114610307578063dcdc7dd01461031a578063dd62ed3e1461032d57600080fd5b8063959b8c3f146102ad57806395d89b41146102c05780639bd9bbc6146102c85780639cb8a26a146102db578063a9059cbb146102e3578063c773c8f7146102f657600080fd5b80633f4ba83a1161014b57806362ad1b831161012557806362ad1b831461024457806370a08231146102575780638456cb5914610280578063893d20e81461028857600080fd5b80633f4ba83a14610221578063556f0dc71461022b5780635c975abb1461023257600080fd5b806306e485381461019357806306fdde03146101b1578063095ea7b3146101c657806318160ddd146101e957806323b872dd146101ff578063313ce56714610212575b600080fd5b61019b6103b2565b6040516101a89190611b8e565b60405180910390f35b6101b9610414565b6040516101a89190611bdb565b6101d96101d436600461199b565b61049d565b60405190151581526020016101a8565b6101f16104b5565b6040519081526020016101a8565b6101d961020d3660046118c7565b6104c5565b604051601281526020016101a8565b61022961050b565b005b60016101f1565b600954600160a01b900460ff166101d9565b610229610252366004611908565b61051d565b6101f1610265366004611854565b6001600160a01b031660009081526020819052604090205490565b610229610562565b6009546001600160a01b03165b6040516001600160a01b0390911681526020016101a8565b6102296102bb366004611854565b610572565b6101b9610690565b6102296102d63660046119c7565b61069f565b6102296106c2565b6101d96102f136600461199b565b610767565b600a546001600160a01b0316610295565b6101d961031536600461188e565b61079f565b610229610328366004611a20565b610841565b6101f161033b36600461188e565b6001600160a01b03918216600090815260086020908152604080832093909416825291909152205490565b610229610374366004611854565b6108e4565b610229610387366004611854565b610965565b61022961039a366004611a20565b610a81565b6102296103ad366004611aa0565b610b24565b6060600480548060200260200160405190810160405280929190818152602001828054801561040a57602002820191906000526020600020905b81546001600160a01b031681526001909101906020018083116103ec575b5050505050905090565b60606002805461042390611c9e565b80601f016020809104026020016040519081016040528092919081815260200182805461044f90611c9e565b801561040a5780601f106104715761010080835404028352916020019161040a565b820191906000526020600020905b81548152906001019060200180831161047f57509395945050505050565b6000336104ab818585610bc5565b5060019392505050565b60006104c060015490565b905090565b6000336104d3858285610cec565b61050085858560405180602001604052806000815250604051806020016040528060008152506000610d7e565b506001949350505050565b610513610e7a565b61051b610ea5565b565b610527338661079f565b61054c5760405162461bcd60e51b815260040161054390611bee565b60405180910390fd5b61055b85858585856001610d7e565b5050505050565b61056a610e7a565b61051b610efa565b336001600160a01b03821614156105d75760405162461bcd60e51b8152602060048201526024808201527f4552433737373a20617574686f72697a696e672073656c66206173206f70657260448201526330ba37b960e11b6064820152608401610543565b6001600160a01b03811660009081526005602052604090205460ff1615610628573360009081526007602090815260408083206001600160a01b03851684529091529020805460ff19169055610657565b3360009081526006602090815260408083206001600160a01b03851684529091529020805460ff191660011790555b60405133906001600160a01b038316907ff4caeb2d6ca8932a215a353d0703c326ec2d81fc68170f320eb2ab49e9df61f990600090a350565b60606003805461042390611c9e565b6106bd33848484604051806020016040528060008152506001610d7e565b505050565b600a60009054906101000a90046001600160a01b03166001600160a01b031663365388a26040518163ffffffff1660e01b815260040160206040518083038186803b15801561071057600080fd5b505afa158015610724573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107489190611871565b61075181610f3d565b610759610f69565b6009546001600160a01b0316ff5b600061079633848460405180602001604052806000815250604051806020016040528060008152506000610d7e565b50600192915050565b6000816001600160a01b0316836001600160a01b0316148061080a57506001600160a01b03831660009081526005602052604090205460ff16801561080a57506001600160a01b0380831660009081526007602090815260408083209387168352929052205460ff16155b8061083a57506001600160a01b0380831660009081526006602090815260408083209387168352929052205460ff165b9392505050565b600a60009054906101000a90046001600160a01b03166001600160a01b0316637d5e7c326040518163ffffffff1660e01b815260040160206040518083038186803b15801561088f57600080fd5b505afa1580156108a3573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108c79190611871565b6108d081610f3d565b6108d8610fb9565b61055b85858585611006565b6108ec610e7a565b6001600160a01b0381166109135760405163f82d512f60e01b815260040160405180910390fd5b600980546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b6001600160a01b0381163314156109c85760405162461bcd60e51b815260206004820152602160248201527f4552433737373a207265766f6b696e672073656c66206173206f70657261746f6044820152603960f91b6064820152608401610543565b6001600160a01b03811660009081526005602052604090205460ff1615610a1c573360009081526007602090815260408083206001600160a01b03851684529091529020805460ff19166001179055610a48565b3360009081526006602090815260408083206001600160a01b03851684529091529020805460ff191690555b60405133906001600160a01b038316907f50546e66e5f44d728365dc3908c63bc5cfeeab470722c1677e3073a6ac294aa190600090a350565b600a60009054906101000a90046001600160a01b03166001600160a01b0316637d5e7c326040518163ffffffff1660e01b815260040160206040518083038186803b158015610acf57600080fd5b505afa158015610ae3573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b079190611871565b610b1081610f3d565b610b18610fb9565b61055b85858585611014565b600a60009054906101000a90046001600160a01b03166001600160a01b0316637d5e7c326040518163ffffffff1660e01b815260040160206040518083038186803b158015610b7257600080fd5b505afa158015610b86573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610baa9190611871565b610bb381610f3d565b610bbb610fb9565b6106bd8383611046565b6001600160a01b038316610c295760405162461bcd60e51b815260206004820152602560248201527f4552433737373a20617070726f76652066726f6d20746865207a65726f206164604482015264647265737360d81b6064820152608401610543565b6001600160a01b038216610c8b5760405162461bcd60e51b815260206004820152602360248201527f4552433737373a20617070726f766520746f20746865207a65726f206164647260448201526265737360e81b6064820152608401610543565b6001600160a01b0383811660008181526008602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b6001600160a01b038381166000908152600860209081526040808320938616835292905220546000198114610d785781811015610d6b5760405162461bcd60e51b815260206004820152601e60248201527f4552433737373a20696e73756666696369656e7420616c6c6f77616e636500006044820152606401610543565b610d788484848403610bc5565b50505050565b6001600160a01b038616610de35760405162461bcd60e51b815260206004820152602660248201527f4552433737373a207472616e736665722066726f6d20746865207a65726f206160448201526564647265737360d01b6064820152608401610543565b6001600160a01b038516610e455760405162461bcd60e51b8152602060048201526024808201527f4552433737373a207472616e7366657220746f20746865207a65726f206164646044820152637265737360e01b6064820152608401610543565b33610e54818888888888611065565b610e6281888888888861119b565b610e7181888888888888611301565b50505050505050565b6009546001600160a01b0316331461051b57604051633e8be92f60e01b815260040160405180910390fd5b610ead610f69565b6009805460ff60a01b191690557f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa335b6040516001600160a01b03909116815260200160405180910390a1565b610f02610fb9565b6009805460ff60a01b1916600160a01b1790557f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258610edd3390565b336001600160a01b03821614610f6657604051630101292160e31b815260040160405180910390fd5b50565b600954600160a01b900460ff1661051b5760405162461bcd60e51b815260206004820152601460248201527314185d5cd8589b194e881b9bdd081c185d5cd95960621b6044820152606401610543565b600954600160a01b900460ff161561051b5760405162461bcd60e51b815260206004820152601060248201526f14185d5cd8589b194e881c185d5cd95960821b6044820152606401610543565b610d788484848460016114d5565b61101e338561079f565b61103a5760405162461bcd60e51b815260040161054390611bee565b610d788484848461161e565b6110613383836040518060200160405280600081525061161e565b5050565b60405163555ddc6560e11b81526001600160a01b03861660048201527f29ddb589b1fb5fc7cf394961c1adf5f8c6454761adf795e67fe149f658abe8956024820152600090731820a4b7618bde71dce8cdc73aab6c95905fad249063aabbb8ca9060440160206040518083038186803b1580156110e157600080fd5b505afa1580156110f5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906111199190611871565b90506001600160a01b03811615610e7157604051633ad5cbc160e11b81526001600160a01b038216906375ab978290611160908a908a908a908a908a908a90600401611b34565b600060405180830381600087803b15801561117a57600080fd5b505af115801561118e573d6000803e3d6000fd5b5050505050505050505050565b6001600160a01b038516600090815260208190526040902054838110156112145760405162461bcd60e51b815260206004820152602760248201527f4552433737373a207472616e7366657220616d6f756e7420657863656564732060448201526662616c616e636560c81b6064820152608401610543565b6001600160a01b0380871660009081526020819052604080822087850390559187168152908120805486929061124b908490611c6f565b92505081905550846001600160a01b0316866001600160a01b0316886001600160a01b03167f06b541ddaa720db2b10a4d0cdac39b8d360425fc073085fac19bc826146779878787876040516112a393929190611c3a565b60405180910390a4846001600160a01b0316866001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef866040516112f091815260200190565b60405180910390a350505050505050565b60405163555ddc6560e11b81526001600160a01b03861660048201527fb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b6024820152600090731820a4b7618bde71dce8cdc73aab6c95905fad249063aabbb8ca9060440160206040518083038186803b15801561137d57600080fd5b505afa158015611391573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906113b59190611871565b90506001600160a01b03811615611431576040516223de2960e01b81526001600160a01b038216906223de29906113fa908b908b908b908b908b908b90600401611b34565b600060405180830381600087803b15801561141457600080fd5b505af1158015611428573d6000803e3d6000fd5b505050506114cb565b81156114cb576001600160a01b0386163b156114cb5760405162461bcd60e51b815260206004820152604d60248201527f4552433737373a20746f6b656e20726563697069656e7420636f6e747261637460448201527f20686173206e6f20696d706c656d656e74657220666f7220455243373737546f60648201526c1ad95b9cd49958da5c1a595b9d609a1b608482015260a401610543565b5050505050505050565b6001600160a01b03851661152b5760405162461bcd60e51b815260206004820181905260248201527f4552433737373a206d696e7420746f20746865207a65726f20616464726573736044820152606401610543565b600033905084600160008282546115429190611c6f565b90915550506001600160a01b0386166000908152602081905260408120805487929061156f908490611c6f565b9091555061158590508160008888888888611301565b856001600160a01b0316816001600160a01b03167f2fe5be0146f74c5bce36c0b80911af6c7d86ff27e89d5cfa61fc681327954e5d8787876040516115cc93929190611c3a565b60405180910390a36040518581526001600160a01b038716906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef906020015b60405180910390a3505050505050565b6001600160a01b03841661167f5760405162461bcd60e51b815260206004820152602260248201527f4552433737373a206275726e2066726f6d20746865207a65726f206164647265604482015261737360f01b6064820152608401610543565b3361168f81866000878787611065565b6001600160a01b038516600090815260208190526040902054848110156117045760405162461bcd60e51b815260206004820152602360248201527f4552433737373a206275726e20616d6f756e7420657863656564732062616c616044820152626e636560e81b6064820152608401610543565b6001600160a01b0386166000908152602081905260408120868303905560018054879290611733908490611c87565b92505081905550856001600160a01b0316826001600160a01b03167fa78a9be3a7b862d26933ad85fb11d80ef66b8f972d7cbba06621d583943a409887878760405161178193929190611c3a565b60405180910390a36040518581526000906001600160a01b038816907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200161160e565b600082601f8301126117d857600080fd5b813567ffffffffffffffff808211156117f3576117f3611cef565b604051601f8301601f19908116603f0116810190828211818310171561181b5761181b611cef565b8160405283815286602085880101111561183457600080fd5b836020870160208301376000602085830101528094505050505092915050565b60006020828403121561186657600080fd5b813561083a81611d05565b60006020828403121561188357600080fd5b815161083a81611d05565b600080604083850312156118a157600080fd5b82356118ac81611d05565b915060208301356118bc81611d05565b809150509250929050565b6000806000606084860312156118dc57600080fd5b83356118e781611d05565b925060208401356118f781611d05565b929592945050506040919091013590565b600080600080600060a0868803121561192057600080fd5b853561192b81611d05565b9450602086013561193b81611d05565b935060408601359250606086013567ffffffffffffffff8082111561195f57600080fd5b61196b89838a016117c7565b9350608088013591508082111561198157600080fd5b5061198e888289016117c7565b9150509295509295909350565b600080604083850312156119ae57600080fd5b82356119b981611d05565b946020939093013593505050565b6000806000606084860312156119dc57600080fd5b83356119e781611d05565b925060208401359150604084013567ffffffffffffffff811115611a0a57600080fd5b611a16868287016117c7565b9150509250925092565b60008060008060808587031215611a3657600080fd5b8435611a4181611d05565b935060208501359250604085013567ffffffffffffffff80821115611a6557600080fd5b611a71888389016117c7565b93506060870135915080821115611a8757600080fd5b50611a94878288016117c7565b91505092959194509250565b60008060408385031215611ab357600080fd5b82359150602083013567ffffffffffffffff811115611ad157600080fd5b611add858286016117c7565b9150509250929050565b6000815180845260005b81811015611b0d57602081850181015186830182015201611af1565b81811115611b1f576000602083870101525b50601f01601f19169290920160200192915050565b6001600160a01b0387811682528681166020830152851660408201526060810184905260c060808201819052600090611b6f90830185611ae7565b82810360a0840152611b818185611ae7565b9998505050505050505050565b6020808252825182820181905260009190848201906040850190845b81811015611bcf5783516001600160a01b031683529284019291840191600101611baa565b50909695505050505050565b60208152600061083a6020830184611ae7565b6020808252602c908201527f4552433737373a2063616c6c6572206973206e6f7420616e206f70657261746f60408201526b39103337b9103437b63232b960a11b606082015260800190565b838152606060208201526000611c536060830185611ae7565b8281036040840152611c658185611ae7565b9695505050505050565b60008219821115611c8257611c82611cd9565b500190565b600082821015611c9957611c99611cd9565b500390565b600181811c90821680611cb257607f821691505b60208210811415611cd357634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052604160045260246000fd5b6001600160a01b0381168114610f6657600080fdfea2646970667358221220e7ae1d0832b6af32896774b1679b8a9f478e1d8dad278cc4201628b4f618227164736f6c63430008070033",
}

// StakedBNBTokenABI is the input ABI used to generate the binding from.
// Deprecated: Use StakedBNBTokenMetaData.ABI instead.
var StakedBNBTokenABI = StakedBNBTokenMetaData.ABI

// StakedBNBTokenBin is the compiled bytecode used for deploying new contracts.
// Deprecated: Use StakedBNBTokenMetaData.Bin instead.
var StakedBNBTokenBin = StakedBNBTokenMetaData.Bin

// DeployStakedBNBToken deploys a new Ethereum contract, binding an instance of StakedBNBToken to it.
func DeployStakedBNBToken(auth *bind.TransactOpts, backend bind.ContractBackend, addressStore_ common.Address) (common.Address, *types.Transaction, *StakedBNBToken, error) {
	parsed, err := StakedBNBTokenMetaData.GetAbi()
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	if parsed == nil {
		return common.Address{}, nil, nil, errors.New("GetABI returned nil")
	}

	address, tx, contract, err := bind.DeployContract(auth, *parsed, common.FromHex(StakedBNBTokenBin), backend, addressStore_)
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	return address, tx, &StakedBNBToken{StakedBNBTokenCaller: StakedBNBTokenCaller{contract: contract}, StakedBNBTokenTransactor: StakedBNBTokenTransactor{contract: contract}, StakedBNBTokenFilterer: StakedBNBTokenFilterer{contract: contract}}, nil
}

// StakedBNBToken is an auto generated Go binding around an Ethereum contract.
type StakedBNBToken struct {
	StakedBNBTokenCaller     // Read-only binding to the contract
	StakedBNBTokenTransactor // Write-only binding to the contract
	StakedBNBTokenFilterer   // Log filterer for contract events
}

// StakedBNBTokenCaller is an auto generated read-only Go binding around an Ethereum contract.
type StakedBNBTokenCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// StakedBNBTokenTransactor is an auto generated write-only Go binding around an Ethereum contract.
type StakedBNBTokenTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// StakedBNBTokenFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type StakedBNBTokenFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// StakedBNBTokenSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type StakedBNBTokenSession struct {
	Contract     *StakedBNBToken   // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// StakedBNBTokenCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type StakedBNBTokenCallerSession struct {
	Contract *StakedBNBTokenCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts         // Call options to use throughout this session
}

// StakedBNBTokenTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type StakedBNBTokenTransactorSession struct {
	Contract     *StakedBNBTokenTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts         // Transaction auth options to use throughout this session
}

// StakedBNBTokenRaw is an auto generated low-level Go binding around an Ethereum contract.
type StakedBNBTokenRaw struct {
	Contract *StakedBNBToken // Generic contract binding to access the raw methods on
}

// StakedBNBTokenCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type StakedBNBTokenCallerRaw struct {
	Contract *StakedBNBTokenCaller // Generic read-only contract binding to access the raw methods on
}

// StakedBNBTokenTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type StakedBNBTokenTransactorRaw struct {
	Contract *StakedBNBTokenTransactor // Generic write-only contract binding to access the raw methods on
}

// NewStakedBNBToken creates a new instance of StakedBNBToken, bound to a specific deployed contract.
func NewStakedBNBToken(address common.Address, backend bind.ContractBackend) (*StakedBNBToken, error) {
	contract, err := bindStakedBNBToken(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &StakedBNBToken{StakedBNBTokenCaller: StakedBNBTokenCaller{contract: contract}, StakedBNBTokenTransactor: StakedBNBTokenTransactor{contract: contract}, StakedBNBTokenFilterer: StakedBNBTokenFilterer{contract: contract}}, nil
}

// NewStakedBNBTokenCaller creates a new read-only instance of StakedBNBToken, bound to a specific deployed contract.
func NewStakedBNBTokenCaller(address common.Address, caller bind.ContractCaller) (*StakedBNBTokenCaller, error) {
	contract, err := bindStakedBNBToken(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &StakedBNBTokenCaller{contract: contract}, nil
}

// NewStakedBNBTokenTransactor creates a new write-only instance of StakedBNBToken, bound to a specific deployed contract.
func NewStakedBNBTokenTransactor(address common.Address, transactor bind.ContractTransactor) (*StakedBNBTokenTransactor, error) {
	contract, err := bindStakedBNBToken(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &StakedBNBTokenTransactor{contract: contract}, nil
}

// NewStakedBNBTokenFilterer creates a new log filterer instance of StakedBNBToken, bound to a specific deployed contract.
func NewStakedBNBTokenFilterer(address common.Address, filterer bind.ContractFilterer) (*StakedBNBTokenFilterer, error) {
	contract, err := bindStakedBNBToken(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &StakedBNBTokenFilterer{contract: contract}, nil
}

// bindStakedBNBToken binds a generic wrapper to an already deployed contract.
func bindStakedBNBToken(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(StakedBNBTokenABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_StakedBNBToken *StakedBNBTokenRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _StakedBNBToken.Contract.StakedBNBTokenCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_StakedBNBToken *StakedBNBTokenRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _StakedBNBToken.Contract.StakedBNBTokenTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_StakedBNBToken *StakedBNBTokenRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _StakedBNBToken.Contract.StakedBNBTokenTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_StakedBNBToken *StakedBNBTokenCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _StakedBNBToken.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_StakedBNBToken *StakedBNBTokenTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _StakedBNBToken.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_StakedBNBToken *StakedBNBTokenTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _StakedBNBToken.Contract.contract.Transact(opts, method, params...)
}

// AddressStore is a free data retrieval call binding the contract method 0xc773c8f7.
//
// Solidity: function addressStore() view returns(address)
func (_StakedBNBToken *StakedBNBTokenCaller) AddressStore(opts *bind.CallOpts) (common.Address, error) {
	var out []interface{}
	err := _StakedBNBToken.contract.Call(opts, &out, "addressStore")

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// AddressStore is a free data retrieval call binding the contract method 0xc773c8f7.
//
// Solidity: function addressStore() view returns(address)
func (_StakedBNBToken *StakedBNBTokenSession) AddressStore() (common.Address, error) {
	return _StakedBNBToken.Contract.AddressStore(&_StakedBNBToken.CallOpts)
}

// AddressStore is a free data retrieval call binding the contract method 0xc773c8f7.
//
// Solidity: function addressStore() view returns(address)
func (_StakedBNBToken *StakedBNBTokenCallerSession) AddressStore() (common.Address, error) {
	return _StakedBNBToken.Contract.AddressStore(&_StakedBNBToken.CallOpts)
}

// Allowance is a free data retrieval call binding the contract method 0xdd62ed3e.
//
// Solidity: function allowance(address holder, address spender) view returns(uint256)
func (_StakedBNBToken *StakedBNBTokenCaller) Allowance(opts *bind.CallOpts, holder common.Address, spender common.Address) (*big.Int, error) {
	var out []interface{}
	err := _StakedBNBToken.contract.Call(opts, &out, "allowance", holder, spender)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// Allowance is a free data retrieval call binding the contract method 0xdd62ed3e.
//
// Solidity: function allowance(address holder, address spender) view returns(uint256)
func (_StakedBNBToken *StakedBNBTokenSession) Allowance(holder common.Address, spender common.Address) (*big.Int, error) {
	return _StakedBNBToken.Contract.Allowance(&_StakedBNBToken.CallOpts, holder, spender)
}

// Allowance is a free data retrieval call binding the contract method 0xdd62ed3e.
//
// Solidity: function allowance(address holder, address spender) view returns(uint256)
func (_StakedBNBToken *StakedBNBTokenCallerSession) Allowance(holder common.Address, spender common.Address) (*big.Int, error) {
	return _StakedBNBToken.Contract.Allowance(&_StakedBNBToken.CallOpts, holder, spender)
}

// BalanceOf is a free data retrieval call binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(address tokenHolder) view returns(uint256)
func (_StakedBNBToken *StakedBNBTokenCaller) BalanceOf(opts *bind.CallOpts, tokenHolder common.Address) (*big.Int, error) {
	var out []interface{}
	err := _StakedBNBToken.contract.Call(opts, &out, "balanceOf", tokenHolder)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// BalanceOf is a free data retrieval call binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(address tokenHolder) view returns(uint256)
func (_StakedBNBToken *StakedBNBTokenSession) BalanceOf(tokenHolder common.Address) (*big.Int, error) {
	return _StakedBNBToken.Contract.BalanceOf(&_StakedBNBToken.CallOpts, tokenHolder)
}

// BalanceOf is a free data retrieval call binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(address tokenHolder) view returns(uint256)
func (_StakedBNBToken *StakedBNBTokenCallerSession) BalanceOf(tokenHolder common.Address) (*big.Int, error) {
	return _StakedBNBToken.Contract.BalanceOf(&_StakedBNBToken.CallOpts, tokenHolder)
}

// Decimals is a free data retrieval call binding the contract method 0x313ce567.
//
// Solidity: function decimals() pure returns(uint8)
func (_StakedBNBToken *StakedBNBTokenCaller) Decimals(opts *bind.CallOpts) (uint8, error) {
	var out []interface{}
	err := _StakedBNBToken.contract.Call(opts, &out, "decimals")

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// Decimals is a free data retrieval call binding the contract method 0x313ce567.
//
// Solidity: function decimals() pure returns(uint8)
func (_StakedBNBToken *StakedBNBTokenSession) Decimals() (uint8, error) {
	return _StakedBNBToken.Contract.Decimals(&_StakedBNBToken.CallOpts)
}

// Decimals is a free data retrieval call binding the contract method 0x313ce567.
//
// Solidity: function decimals() pure returns(uint8)
func (_StakedBNBToken *StakedBNBTokenCallerSession) Decimals() (uint8, error) {
	return _StakedBNBToken.Contract.Decimals(&_StakedBNBToken.CallOpts)
}

// DefaultOperators is a free data retrieval call binding the contract method 0x06e48538.
//
// Solidity: function defaultOperators() view returns(address[])
func (_StakedBNBToken *StakedBNBTokenCaller) DefaultOperators(opts *bind.CallOpts) ([]common.Address, error) {
	var out []interface{}
	err := _StakedBNBToken.contract.Call(opts, &out, "defaultOperators")

	if err != nil {
		return *new([]common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new([]common.Address)).(*[]common.Address)

	return out0, err

}

// DefaultOperators is a free data retrieval call binding the contract method 0x06e48538.
//
// Solidity: function defaultOperators() view returns(address[])
func (_StakedBNBToken *StakedBNBTokenSession) DefaultOperators() ([]common.Address, error) {
	return _StakedBNBToken.Contract.DefaultOperators(&_StakedBNBToken.CallOpts)
}

// DefaultOperators is a free data retrieval call binding the contract method 0x06e48538.
//
// Solidity: function defaultOperators() view returns(address[])
func (_StakedBNBToken *StakedBNBTokenCallerSession) DefaultOperators() ([]common.Address, error) {
	return _StakedBNBToken.Contract.DefaultOperators(&_StakedBNBToken.CallOpts)
}

// GetOwner is a free data retrieval call binding the contract method 0x893d20e8.
//
// Solidity: function getOwner() view returns(address)
func (_StakedBNBToken *StakedBNBTokenCaller) GetOwner(opts *bind.CallOpts) (common.Address, error) {
	var out []interface{}
	err := _StakedBNBToken.contract.Call(opts, &out, "getOwner")

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// GetOwner is a free data retrieval call binding the contract method 0x893d20e8.
//
// Solidity: function getOwner() view returns(address)
func (_StakedBNBToken *StakedBNBTokenSession) GetOwner() (common.Address, error) {
	return _StakedBNBToken.Contract.GetOwner(&_StakedBNBToken.CallOpts)
}

// GetOwner is a free data retrieval call binding the contract method 0x893d20e8.
//
// Solidity: function getOwner() view returns(address)
func (_StakedBNBToken *StakedBNBTokenCallerSession) GetOwner() (common.Address, error) {
	return _StakedBNBToken.Contract.GetOwner(&_StakedBNBToken.CallOpts)
}

// Granularity is a free data retrieval call binding the contract method 0x556f0dc7.
//
// Solidity: function granularity() view returns(uint256)
func (_StakedBNBToken *StakedBNBTokenCaller) Granularity(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _StakedBNBToken.contract.Call(opts, &out, "granularity")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// Granularity is a free data retrieval call binding the contract method 0x556f0dc7.
//
// Solidity: function granularity() view returns(uint256)
func (_StakedBNBToken *StakedBNBTokenSession) Granularity() (*big.Int, error) {
	return _StakedBNBToken.Contract.Granularity(&_StakedBNBToken.CallOpts)
}

// Granularity is a free data retrieval call binding the contract method 0x556f0dc7.
//
// Solidity: function granularity() view returns(uint256)
func (_StakedBNBToken *StakedBNBTokenCallerSession) Granularity() (*big.Int, error) {
	return _StakedBNBToken.Contract.Granularity(&_StakedBNBToken.CallOpts)
}

// IsOperatorFor is a free data retrieval call binding the contract method 0xd95b6371.
//
// Solidity: function isOperatorFor(address operator, address tokenHolder) view returns(bool)
func (_StakedBNBToken *StakedBNBTokenCaller) IsOperatorFor(opts *bind.CallOpts, operator common.Address, tokenHolder common.Address) (bool, error) {
	var out []interface{}
	err := _StakedBNBToken.contract.Call(opts, &out, "isOperatorFor", operator, tokenHolder)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// IsOperatorFor is a free data retrieval call binding the contract method 0xd95b6371.
//
// Solidity: function isOperatorFor(address operator, address tokenHolder) view returns(bool)
func (_StakedBNBToken *StakedBNBTokenSession) IsOperatorFor(operator common.Address, tokenHolder common.Address) (bool, error) {
	return _StakedBNBToken.Contract.IsOperatorFor(&_StakedBNBToken.CallOpts, operator, tokenHolder)
}

// IsOperatorFor is a free data retrieval call binding the contract method 0xd95b6371.
//
// Solidity: function isOperatorFor(address operator, address tokenHolder) view returns(bool)
func (_StakedBNBToken *StakedBNBTokenCallerSession) IsOperatorFor(operator common.Address, tokenHolder common.Address) (bool, error) {
	return _StakedBNBToken.Contract.IsOperatorFor(&_StakedBNBToken.CallOpts, operator, tokenHolder)
}

// Name is a free data retrieval call binding the contract method 0x06fdde03.
//
// Solidity: function name() view returns(string)
func (_StakedBNBToken *StakedBNBTokenCaller) Name(opts *bind.CallOpts) (string, error) {
	var out []interface{}
	err := _StakedBNBToken.contract.Call(opts, &out, "name")

	if err != nil {
		return *new(string), err
	}

	out0 := *abi.ConvertType(out[0], new(string)).(*string)

	return out0, err

}

// Name is a free data retrieval call binding the contract method 0x06fdde03.
//
// Solidity: function name() view returns(string)
func (_StakedBNBToken *StakedBNBTokenSession) Name() (string, error) {
	return _StakedBNBToken.Contract.Name(&_StakedBNBToken.CallOpts)
}

// Name is a free data retrieval call binding the contract method 0x06fdde03.
//
// Solidity: function name() view returns(string)
func (_StakedBNBToken *StakedBNBTokenCallerSession) Name() (string, error) {
	return _StakedBNBToken.Contract.Name(&_StakedBNBToken.CallOpts)
}

// Paused is a free data retrieval call binding the contract method 0x5c975abb.
//
// Solidity: function paused() view returns(bool)
func (_StakedBNBToken *StakedBNBTokenCaller) Paused(opts *bind.CallOpts) (bool, error) {
	var out []interface{}
	err := _StakedBNBToken.contract.Call(opts, &out, "paused")

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// Paused is a free data retrieval call binding the contract method 0x5c975abb.
//
// Solidity: function paused() view returns(bool)
func (_StakedBNBToken *StakedBNBTokenSession) Paused() (bool, error) {
	return _StakedBNBToken.Contract.Paused(&_StakedBNBToken.CallOpts)
}

// Paused is a free data retrieval call binding the contract method 0x5c975abb.
//
// Solidity: function paused() view returns(bool)
func (_StakedBNBToken *StakedBNBTokenCallerSession) Paused() (bool, error) {
	return _StakedBNBToken.Contract.Paused(&_StakedBNBToken.CallOpts)
}

// Symbol is a free data retrieval call binding the contract method 0x95d89b41.
//
// Solidity: function symbol() view returns(string)
func (_StakedBNBToken *StakedBNBTokenCaller) Symbol(opts *bind.CallOpts) (string, error) {
	var out []interface{}
	err := _StakedBNBToken.contract.Call(opts, &out, "symbol")

	if err != nil {
		return *new(string), err
	}

	out0 := *abi.ConvertType(out[0], new(string)).(*string)

	return out0, err

}

// Symbol is a free data retrieval call binding the contract method 0x95d89b41.
//
// Solidity: function symbol() view returns(string)
func (_StakedBNBToken *StakedBNBTokenSession) Symbol() (string, error) {
	return _StakedBNBToken.Contract.Symbol(&_StakedBNBToken.CallOpts)
}

// Symbol is a free data retrieval call binding the contract method 0x95d89b41.
//
// Solidity: function symbol() view returns(string)
func (_StakedBNBToken *StakedBNBTokenCallerSession) Symbol() (string, error) {
	return _StakedBNBToken.Contract.Symbol(&_StakedBNBToken.CallOpts)
}

// TotalSupply is a free data retrieval call binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() view returns(uint256)
func (_StakedBNBToken *StakedBNBTokenCaller) TotalSupply(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _StakedBNBToken.contract.Call(opts, &out, "totalSupply")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// TotalSupply is a free data retrieval call binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() view returns(uint256)
func (_StakedBNBToken *StakedBNBTokenSession) TotalSupply() (*big.Int, error) {
	return _StakedBNBToken.Contract.TotalSupply(&_StakedBNBToken.CallOpts)
}

// TotalSupply is a free data retrieval call binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() view returns(uint256)
func (_StakedBNBToken *StakedBNBTokenCallerSession) TotalSupply() (*big.Int, error) {
	return _StakedBNBToken.Contract.TotalSupply(&_StakedBNBToken.CallOpts)
}

// Approve is a paid mutator transaction binding the contract method 0x095ea7b3.
//
// Solidity: function approve(address spender, uint256 value) returns(bool)
func (_StakedBNBToken *StakedBNBTokenTransactor) Approve(opts *bind.TransactOpts, spender common.Address, value *big.Int) (*types.Transaction, error) {
	return _StakedBNBToken.contract.Transact(opts, "approve", spender, value)
}

// Approve is a paid mutator transaction binding the contract method 0x095ea7b3.
//
// Solidity: function approve(address spender, uint256 value) returns(bool)
func (_StakedBNBToken *StakedBNBTokenSession) Approve(spender common.Address, value *big.Int) (*types.Transaction, error) {
	return _StakedBNBToken.Contract.Approve(&_StakedBNBToken.TransactOpts, spender, value)
}

// Approve is a paid mutator transaction binding the contract method 0x095ea7b3.
//
// Solidity: function approve(address spender, uint256 value) returns(bool)
func (_StakedBNBToken *StakedBNBTokenTransactorSession) Approve(spender common.Address, value *big.Int) (*types.Transaction, error) {
	return _StakedBNBToken.Contract.Approve(&_StakedBNBToken.TransactOpts, spender, value)
}

// AuthorizeOperator is a paid mutator transaction binding the contract method 0x959b8c3f.
//
// Solidity: function authorizeOperator(address operator) returns()
func (_StakedBNBToken *StakedBNBTokenTransactor) AuthorizeOperator(opts *bind.TransactOpts, operator common.Address) (*types.Transaction, error) {
	return _StakedBNBToken.contract.Transact(opts, "authorizeOperator", operator)
}

// AuthorizeOperator is a paid mutator transaction binding the contract method 0x959b8c3f.
//
// Solidity: function authorizeOperator(address operator) returns()
func (_StakedBNBToken *StakedBNBTokenSession) AuthorizeOperator(operator common.Address) (*types.Transaction, error) {
	return _StakedBNBToken.Contract.AuthorizeOperator(&_StakedBNBToken.TransactOpts, operator)
}

// AuthorizeOperator is a paid mutator transaction binding the contract method 0x959b8c3f.
//
// Solidity: function authorizeOperator(address operator) returns()
func (_StakedBNBToken *StakedBNBTokenTransactorSession) AuthorizeOperator(operator common.Address) (*types.Transaction, error) {
	return _StakedBNBToken.Contract.AuthorizeOperator(&_StakedBNBToken.TransactOpts, operator)
}

// Burn is a paid mutator transaction binding the contract method 0xfe9d9303.
//
// Solidity: function burn(uint256 amount, bytes data) returns()
func (_StakedBNBToken *StakedBNBTokenTransactor) Burn(opts *bind.TransactOpts, amount *big.Int, data []byte) (*types.Transaction, error) {
	return _StakedBNBToken.contract.Transact(opts, "burn", amount, data)
}

// Burn is a paid mutator transaction binding the contract method 0xfe9d9303.
//
// Solidity: function burn(uint256 amount, bytes data) returns()
func (_StakedBNBToken *StakedBNBTokenSession) Burn(amount *big.Int, data []byte) (*types.Transaction, error) {
	return _StakedBNBToken.Contract.Burn(&_StakedBNBToken.TransactOpts, amount, data)
}

// Burn is a paid mutator transaction binding the contract method 0xfe9d9303.
//
// Solidity: function burn(uint256 amount, bytes data) returns()
func (_StakedBNBToken *StakedBNBTokenTransactorSession) Burn(amount *big.Int, data []byte) (*types.Transaction, error) {
	return _StakedBNBToken.Contract.Burn(&_StakedBNBToken.TransactOpts, amount, data)
}

// Mint is a paid mutator transaction binding the contract method 0xdcdc7dd0.
//
// Solidity: function mint(address account, uint256 amount, bytes userData, bytes operatorData) returns()
func (_StakedBNBToken *StakedBNBTokenTransactor) Mint(opts *bind.TransactOpts, account common.Address, amount *big.Int, userData []byte, operatorData []byte) (*types.Transaction, error) {
	return _StakedBNBToken.contract.Transact(opts, "mint", account, amount, userData, operatorData)
}

// Mint is a paid mutator transaction binding the contract method 0xdcdc7dd0.
//
// Solidity: function mint(address account, uint256 amount, bytes userData, bytes operatorData) returns()
func (_StakedBNBToken *StakedBNBTokenSession) Mint(account common.Address, amount *big.Int, userData []byte, operatorData []byte) (*types.Transaction, error) {
	return _StakedBNBToken.Contract.Mint(&_StakedBNBToken.TransactOpts, account, amount, userData, operatorData)
}

// Mint is a paid mutator transaction binding the contract method 0xdcdc7dd0.
//
// Solidity: function mint(address account, uint256 amount, bytes userData, bytes operatorData) returns()
func (_StakedBNBToken *StakedBNBTokenTransactorSession) Mint(account common.Address, amount *big.Int, userData []byte, operatorData []byte) (*types.Transaction, error) {
	return _StakedBNBToken.Contract.Mint(&_StakedBNBToken.TransactOpts, account, amount, userData, operatorData)
}

// OperatorBurn is a paid mutator transaction binding the contract method 0xfc673c4f.
//
// Solidity: function operatorBurn(address account, uint256 amount, bytes data, bytes operatorData) returns()
func (_StakedBNBToken *StakedBNBTokenTransactor) OperatorBurn(opts *bind.TransactOpts, account common.Address, amount *big.Int, data []byte, operatorData []byte) (*types.Transaction, error) {
	return _StakedBNBToken.contract.Transact(opts, "operatorBurn", account, amount, data, operatorData)
}

// OperatorBurn is a paid mutator transaction binding the contract method 0xfc673c4f.
//
// Solidity: function operatorBurn(address account, uint256 amount, bytes data, bytes operatorData) returns()
func (_StakedBNBToken *StakedBNBTokenSession) OperatorBurn(account common.Address, amount *big.Int, data []byte, operatorData []byte) (*types.Transaction, error) {
	return _StakedBNBToken.Contract.OperatorBurn(&_StakedBNBToken.TransactOpts, account, amount, data, operatorData)
}

// OperatorBurn is a paid mutator transaction binding the contract method 0xfc673c4f.
//
// Solidity: function operatorBurn(address account, uint256 amount, bytes data, bytes operatorData) returns()
func (_StakedBNBToken *StakedBNBTokenTransactorSession) OperatorBurn(account common.Address, amount *big.Int, data []byte, operatorData []byte) (*types.Transaction, error) {
	return _StakedBNBToken.Contract.OperatorBurn(&_StakedBNBToken.TransactOpts, account, amount, data, operatorData)
}

// OperatorSend is a paid mutator transaction binding the contract method 0x62ad1b83.
//
// Solidity: function operatorSend(address sender, address recipient, uint256 amount, bytes data, bytes operatorData) returns()
func (_StakedBNBToken *StakedBNBTokenTransactor) OperatorSend(opts *bind.TransactOpts, sender common.Address, recipient common.Address, amount *big.Int, data []byte, operatorData []byte) (*types.Transaction, error) {
	return _StakedBNBToken.contract.Transact(opts, "operatorSend", sender, recipient, amount, data, operatorData)
}

// OperatorSend is a paid mutator transaction binding the contract method 0x62ad1b83.
//
// Solidity: function operatorSend(address sender, address recipient, uint256 amount, bytes data, bytes operatorData) returns()
func (_StakedBNBToken *StakedBNBTokenSession) OperatorSend(sender common.Address, recipient common.Address, amount *big.Int, data []byte, operatorData []byte) (*types.Transaction, error) {
	return _StakedBNBToken.Contract.OperatorSend(&_StakedBNBToken.TransactOpts, sender, recipient, amount, data, operatorData)
}

// OperatorSend is a paid mutator transaction binding the contract method 0x62ad1b83.
//
// Solidity: function operatorSend(address sender, address recipient, uint256 amount, bytes data, bytes operatorData) returns()
func (_StakedBNBToken *StakedBNBTokenTransactorSession) OperatorSend(sender common.Address, recipient common.Address, amount *big.Int, data []byte, operatorData []byte) (*types.Transaction, error) {
	return _StakedBNBToken.Contract.OperatorSend(&_StakedBNBToken.TransactOpts, sender, recipient, amount, data, operatorData)
}

// Pause is a paid mutator transaction binding the contract method 0x8456cb59.
//
// Solidity: function pause() returns()
func (_StakedBNBToken *StakedBNBTokenTransactor) Pause(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _StakedBNBToken.contract.Transact(opts, "pause")
}

// Pause is a paid mutator transaction binding the contract method 0x8456cb59.
//
// Solidity: function pause() returns()
func (_StakedBNBToken *StakedBNBTokenSession) Pause() (*types.Transaction, error) {
	return _StakedBNBToken.Contract.Pause(&_StakedBNBToken.TransactOpts)
}

// Pause is a paid mutator transaction binding the contract method 0x8456cb59.
//
// Solidity: function pause() returns()
func (_StakedBNBToken *StakedBNBTokenTransactorSession) Pause() (*types.Transaction, error) {
	return _StakedBNBToken.Contract.Pause(&_StakedBNBToken.TransactOpts)
}

// RevokeOperator is a paid mutator transaction binding the contract method 0xfad8b32a.
//
// Solidity: function revokeOperator(address operator) returns()
func (_StakedBNBToken *StakedBNBTokenTransactor) RevokeOperator(opts *bind.TransactOpts, operator common.Address) (*types.Transaction, error) {
	return _StakedBNBToken.contract.Transact(opts, "revokeOperator", operator)
}

// RevokeOperator is a paid mutator transaction binding the contract method 0xfad8b32a.
//
// Solidity: function revokeOperator(address operator) returns()
func (_StakedBNBToken *StakedBNBTokenSession) RevokeOperator(operator common.Address) (*types.Transaction, error) {
	return _StakedBNBToken.Contract.RevokeOperator(&_StakedBNBToken.TransactOpts, operator)
}

// RevokeOperator is a paid mutator transaction binding the contract method 0xfad8b32a.
//
// Solidity: function revokeOperator(address operator) returns()
func (_StakedBNBToken *StakedBNBTokenTransactorSession) RevokeOperator(operator common.Address) (*types.Transaction, error) {
	return _StakedBNBToken.Contract.RevokeOperator(&_StakedBNBToken.TransactOpts, operator)
}

// SelfDestruct is a paid mutator transaction binding the contract method 0x9cb8a26a.
//
// Solidity: function selfDestruct() returns()
func (_StakedBNBToken *StakedBNBTokenTransactor) SelfDestruct(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _StakedBNBToken.contract.Transact(opts, "selfDestruct")
}

// SelfDestruct is a paid mutator transaction binding the contract method 0x9cb8a26a.
//
// Solidity: function selfDestruct() returns()
func (_StakedBNBToken *StakedBNBTokenSession) SelfDestruct() (*types.Transaction, error) {
	return _StakedBNBToken.Contract.SelfDestruct(&_StakedBNBToken.TransactOpts)
}

// SelfDestruct is a paid mutator transaction binding the contract method 0x9cb8a26a.
//
// Solidity: function selfDestruct() returns()
func (_StakedBNBToken *StakedBNBTokenTransactorSession) SelfDestruct() (*types.Transaction, error) {
	return _StakedBNBToken.Contract.SelfDestruct(&_StakedBNBToken.TransactOpts)
}

// Send is a paid mutator transaction binding the contract method 0x9bd9bbc6.
//
// Solidity: function send(address recipient, uint256 amount, bytes data) returns()
func (_StakedBNBToken *StakedBNBTokenTransactor) Send(opts *bind.TransactOpts, recipient common.Address, amount *big.Int, data []byte) (*types.Transaction, error) {
	return _StakedBNBToken.contract.Transact(opts, "send", recipient, amount, data)
}

// Send is a paid mutator transaction binding the contract method 0x9bd9bbc6.
//
// Solidity: function send(address recipient, uint256 amount, bytes data) returns()
func (_StakedBNBToken *StakedBNBTokenSession) Send(recipient common.Address, amount *big.Int, data []byte) (*types.Transaction, error) {
	return _StakedBNBToken.Contract.Send(&_StakedBNBToken.TransactOpts, recipient, amount, data)
}

// Send is a paid mutator transaction binding the contract method 0x9bd9bbc6.
//
// Solidity: function send(address recipient, uint256 amount, bytes data) returns()
func (_StakedBNBToken *StakedBNBTokenTransactorSession) Send(recipient common.Address, amount *big.Int, data []byte) (*types.Transaction, error) {
	return _StakedBNBToken.Contract.Send(&_StakedBNBToken.TransactOpts, recipient, amount, data)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(address recipient, uint256 amount) returns(bool)
func (_StakedBNBToken *StakedBNBTokenTransactor) Transfer(opts *bind.TransactOpts, recipient common.Address, amount *big.Int) (*types.Transaction, error) {
	return _StakedBNBToken.contract.Transact(opts, "transfer", recipient, amount)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(address recipient, uint256 amount) returns(bool)
func (_StakedBNBToken *StakedBNBTokenSession) Transfer(recipient common.Address, amount *big.Int) (*types.Transaction, error) {
	return _StakedBNBToken.Contract.Transfer(&_StakedBNBToken.TransactOpts, recipient, amount)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(address recipient, uint256 amount) returns(bool)
func (_StakedBNBToken *StakedBNBTokenTransactorSession) Transfer(recipient common.Address, amount *big.Int) (*types.Transaction, error) {
	return _StakedBNBToken.Contract.Transfer(&_StakedBNBToken.TransactOpts, recipient, amount)
}

// TransferFrom is a paid mutator transaction binding the contract method 0x23b872dd.
//
// Solidity: function transferFrom(address holder, address recipient, uint256 amount) returns(bool)
func (_StakedBNBToken *StakedBNBTokenTransactor) TransferFrom(opts *bind.TransactOpts, holder common.Address, recipient common.Address, amount *big.Int) (*types.Transaction, error) {
	return _StakedBNBToken.contract.Transact(opts, "transferFrom", holder, recipient, amount)
}

// TransferFrom is a paid mutator transaction binding the contract method 0x23b872dd.
//
// Solidity: function transferFrom(address holder, address recipient, uint256 amount) returns(bool)
func (_StakedBNBToken *StakedBNBTokenSession) TransferFrom(holder common.Address, recipient common.Address, amount *big.Int) (*types.Transaction, error) {
	return _StakedBNBToken.Contract.TransferFrom(&_StakedBNBToken.TransactOpts, holder, recipient, amount)
}

// TransferFrom is a paid mutator transaction binding the contract method 0x23b872dd.
//
// Solidity: function transferFrom(address holder, address recipient, uint256 amount) returns(bool)
func (_StakedBNBToken *StakedBNBTokenTransactorSession) TransferFrom(holder common.Address, recipient common.Address, amount *big.Int) (*types.Transaction, error) {
	return _StakedBNBToken.Contract.TransferFrom(&_StakedBNBToken.TransactOpts, holder, recipient, amount)
}

// TransferOwnership is a paid mutator transaction binding the contract method 0xf2fde38b.
//
// Solidity: function transferOwnership(address newOwner) returns()
func (_StakedBNBToken *StakedBNBTokenTransactor) TransferOwnership(opts *bind.TransactOpts, newOwner common.Address) (*types.Transaction, error) {
	return _StakedBNBToken.contract.Transact(opts, "transferOwnership", newOwner)
}

// TransferOwnership is a paid mutator transaction binding the contract method 0xf2fde38b.
//
// Solidity: function transferOwnership(address newOwner) returns()
func (_StakedBNBToken *StakedBNBTokenSession) TransferOwnership(newOwner common.Address) (*types.Transaction, error) {
	return _StakedBNBToken.Contract.TransferOwnership(&_StakedBNBToken.TransactOpts, newOwner)
}

// TransferOwnership is a paid mutator transaction binding the contract method 0xf2fde38b.
//
// Solidity: function transferOwnership(address newOwner) returns()
func (_StakedBNBToken *StakedBNBTokenTransactorSession) TransferOwnership(newOwner common.Address) (*types.Transaction, error) {
	return _StakedBNBToken.Contract.TransferOwnership(&_StakedBNBToken.TransactOpts, newOwner)
}

// Unpause is a paid mutator transaction binding the contract method 0x3f4ba83a.
//
// Solidity: function unpause() returns()
func (_StakedBNBToken *StakedBNBTokenTransactor) Unpause(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _StakedBNBToken.contract.Transact(opts, "unpause")
}

// Unpause is a paid mutator transaction binding the contract method 0x3f4ba83a.
//
// Solidity: function unpause() returns()
func (_StakedBNBToken *StakedBNBTokenSession) Unpause() (*types.Transaction, error) {
	return _StakedBNBToken.Contract.Unpause(&_StakedBNBToken.TransactOpts)
}

// Unpause is a paid mutator transaction binding the contract method 0x3f4ba83a.
//
// Solidity: function unpause() returns()
func (_StakedBNBToken *StakedBNBTokenTransactorSession) Unpause() (*types.Transaction, error) {
	return _StakedBNBToken.Contract.Unpause(&_StakedBNBToken.TransactOpts)
}

// StakedBNBTokenApprovalIterator is returned from FilterApproval and is used to iterate over the raw logs and unpacked data for Approval events raised by the StakedBNBToken contract.
type StakedBNBTokenApprovalIterator struct {
	Event *StakedBNBTokenApproval // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *StakedBNBTokenApprovalIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakedBNBTokenApproval)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(StakedBNBTokenApproval)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *StakedBNBTokenApprovalIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakedBNBTokenApprovalIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakedBNBTokenApproval represents a Approval event raised by the StakedBNBToken contract.
type StakedBNBTokenApproval struct {
	Owner   common.Address
	Spender common.Address
	Value   *big.Int
	Raw     types.Log // Blockchain specific contextual infos
}

// FilterApproval is a free log retrieval operation binding the contract event 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925.
//
// Solidity: event Approval(address indexed owner, address indexed spender, uint256 value)
func (_StakedBNBToken *StakedBNBTokenFilterer) FilterApproval(opts *bind.FilterOpts, owner []common.Address, spender []common.Address) (*StakedBNBTokenApprovalIterator, error) {

	var ownerRule []interface{}
	for _, ownerItem := range owner {
		ownerRule = append(ownerRule, ownerItem)
	}
	var spenderRule []interface{}
	for _, spenderItem := range spender {
		spenderRule = append(spenderRule, spenderItem)
	}

	logs, sub, err := _StakedBNBToken.contract.FilterLogs(opts, "Approval", ownerRule, spenderRule)
	if err != nil {
		return nil, err
	}
	return &StakedBNBTokenApprovalIterator{contract: _StakedBNBToken.contract, event: "Approval", logs: logs, sub: sub}, nil
}

// WatchApproval is a free log subscription operation binding the contract event 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925.
//
// Solidity: event Approval(address indexed owner, address indexed spender, uint256 value)
func (_StakedBNBToken *StakedBNBTokenFilterer) WatchApproval(opts *bind.WatchOpts, sink chan<- *StakedBNBTokenApproval, owner []common.Address, spender []common.Address) (event.Subscription, error) {

	var ownerRule []interface{}
	for _, ownerItem := range owner {
		ownerRule = append(ownerRule, ownerItem)
	}
	var spenderRule []interface{}
	for _, spenderItem := range spender {
		spenderRule = append(spenderRule, spenderItem)
	}

	logs, sub, err := _StakedBNBToken.contract.WatchLogs(opts, "Approval", ownerRule, spenderRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakedBNBTokenApproval)
				if err := _StakedBNBToken.contract.UnpackLog(event, "Approval", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseApproval is a log parse operation binding the contract event 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925.
//
// Solidity: event Approval(address indexed owner, address indexed spender, uint256 value)
func (_StakedBNBToken *StakedBNBTokenFilterer) ParseApproval(log types.Log) (*StakedBNBTokenApproval, error) {
	event := new(StakedBNBTokenApproval)
	if err := _StakedBNBToken.contract.UnpackLog(event, "Approval", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// StakedBNBTokenAuthorizedOperatorIterator is returned from FilterAuthorizedOperator and is used to iterate over the raw logs and unpacked data for AuthorizedOperator events raised by the StakedBNBToken contract.
type StakedBNBTokenAuthorizedOperatorIterator struct {
	Event *StakedBNBTokenAuthorizedOperator // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *StakedBNBTokenAuthorizedOperatorIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakedBNBTokenAuthorizedOperator)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(StakedBNBTokenAuthorizedOperator)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *StakedBNBTokenAuthorizedOperatorIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakedBNBTokenAuthorizedOperatorIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakedBNBTokenAuthorizedOperator represents a AuthorizedOperator event raised by the StakedBNBToken contract.
type StakedBNBTokenAuthorizedOperator struct {
	Operator    common.Address
	TokenHolder common.Address
	Raw         types.Log // Blockchain specific contextual infos
}

// FilterAuthorizedOperator is a free log retrieval operation binding the contract event 0xf4caeb2d6ca8932a215a353d0703c326ec2d81fc68170f320eb2ab49e9df61f9.
//
// Solidity: event AuthorizedOperator(address indexed operator, address indexed tokenHolder)
func (_StakedBNBToken *StakedBNBTokenFilterer) FilterAuthorizedOperator(opts *bind.FilterOpts, operator []common.Address, tokenHolder []common.Address) (*StakedBNBTokenAuthorizedOperatorIterator, error) {

	var operatorRule []interface{}
	for _, operatorItem := range operator {
		operatorRule = append(operatorRule, operatorItem)
	}
	var tokenHolderRule []interface{}
	for _, tokenHolderItem := range tokenHolder {
		tokenHolderRule = append(tokenHolderRule, tokenHolderItem)
	}

	logs, sub, err := _StakedBNBToken.contract.FilterLogs(opts, "AuthorizedOperator", operatorRule, tokenHolderRule)
	if err != nil {
		return nil, err
	}
	return &StakedBNBTokenAuthorizedOperatorIterator{contract: _StakedBNBToken.contract, event: "AuthorizedOperator", logs: logs, sub: sub}, nil
}

// WatchAuthorizedOperator is a free log subscription operation binding the contract event 0xf4caeb2d6ca8932a215a353d0703c326ec2d81fc68170f320eb2ab49e9df61f9.
//
// Solidity: event AuthorizedOperator(address indexed operator, address indexed tokenHolder)
func (_StakedBNBToken *StakedBNBTokenFilterer) WatchAuthorizedOperator(opts *bind.WatchOpts, sink chan<- *StakedBNBTokenAuthorizedOperator, operator []common.Address, tokenHolder []common.Address) (event.Subscription, error) {

	var operatorRule []interface{}
	for _, operatorItem := range operator {
		operatorRule = append(operatorRule, operatorItem)
	}
	var tokenHolderRule []interface{}
	for _, tokenHolderItem := range tokenHolder {
		tokenHolderRule = append(tokenHolderRule, tokenHolderItem)
	}

	logs, sub, err := _StakedBNBToken.contract.WatchLogs(opts, "AuthorizedOperator", operatorRule, tokenHolderRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakedBNBTokenAuthorizedOperator)
				if err := _StakedBNBToken.contract.UnpackLog(event, "AuthorizedOperator", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseAuthorizedOperator is a log parse operation binding the contract event 0xf4caeb2d6ca8932a215a353d0703c326ec2d81fc68170f320eb2ab49e9df61f9.
//
// Solidity: event AuthorizedOperator(address indexed operator, address indexed tokenHolder)
func (_StakedBNBToken *StakedBNBTokenFilterer) ParseAuthorizedOperator(log types.Log) (*StakedBNBTokenAuthorizedOperator, error) {
	event := new(StakedBNBTokenAuthorizedOperator)
	if err := _StakedBNBToken.contract.UnpackLog(event, "AuthorizedOperator", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// StakedBNBTokenBurnedIterator is returned from FilterBurned and is used to iterate over the raw logs and unpacked data for Burned events raised by the StakedBNBToken contract.
type StakedBNBTokenBurnedIterator struct {
	Event *StakedBNBTokenBurned // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *StakedBNBTokenBurnedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakedBNBTokenBurned)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(StakedBNBTokenBurned)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *StakedBNBTokenBurnedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakedBNBTokenBurnedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakedBNBTokenBurned represents a Burned event raised by the StakedBNBToken contract.
type StakedBNBTokenBurned struct {
	Operator     common.Address
	From         common.Address
	Amount       *big.Int
	Data         []byte
	OperatorData []byte
	Raw          types.Log // Blockchain specific contextual infos
}

// FilterBurned is a free log retrieval operation binding the contract event 0xa78a9be3a7b862d26933ad85fb11d80ef66b8f972d7cbba06621d583943a4098.
//
// Solidity: event Burned(address indexed operator, address indexed from, uint256 amount, bytes data, bytes operatorData)
func (_StakedBNBToken *StakedBNBTokenFilterer) FilterBurned(opts *bind.FilterOpts, operator []common.Address, from []common.Address) (*StakedBNBTokenBurnedIterator, error) {

	var operatorRule []interface{}
	for _, operatorItem := range operator {
		operatorRule = append(operatorRule, operatorItem)
	}
	var fromRule []interface{}
	for _, fromItem := range from {
		fromRule = append(fromRule, fromItem)
	}

	logs, sub, err := _StakedBNBToken.contract.FilterLogs(opts, "Burned", operatorRule, fromRule)
	if err != nil {
		return nil, err
	}
	return &StakedBNBTokenBurnedIterator{contract: _StakedBNBToken.contract, event: "Burned", logs: logs, sub: sub}, nil
}

// WatchBurned is a free log subscription operation binding the contract event 0xa78a9be3a7b862d26933ad85fb11d80ef66b8f972d7cbba06621d583943a4098.
//
// Solidity: event Burned(address indexed operator, address indexed from, uint256 amount, bytes data, bytes operatorData)
func (_StakedBNBToken *StakedBNBTokenFilterer) WatchBurned(opts *bind.WatchOpts, sink chan<- *StakedBNBTokenBurned, operator []common.Address, from []common.Address) (event.Subscription, error) {

	var operatorRule []interface{}
	for _, operatorItem := range operator {
		operatorRule = append(operatorRule, operatorItem)
	}
	var fromRule []interface{}
	for _, fromItem := range from {
		fromRule = append(fromRule, fromItem)
	}

	logs, sub, err := _StakedBNBToken.contract.WatchLogs(opts, "Burned", operatorRule, fromRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakedBNBTokenBurned)
				if err := _StakedBNBToken.contract.UnpackLog(event, "Burned", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseBurned is a log parse operation binding the contract event 0xa78a9be3a7b862d26933ad85fb11d80ef66b8f972d7cbba06621d583943a4098.
//
// Solidity: event Burned(address indexed operator, address indexed from, uint256 amount, bytes data, bytes operatorData)
func (_StakedBNBToken *StakedBNBTokenFilterer) ParseBurned(log types.Log) (*StakedBNBTokenBurned, error) {
	event := new(StakedBNBTokenBurned)
	if err := _StakedBNBToken.contract.UnpackLog(event, "Burned", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// StakedBNBTokenMintedIterator is returned from FilterMinted and is used to iterate over the raw logs and unpacked data for Minted events raised by the StakedBNBToken contract.
type StakedBNBTokenMintedIterator struct {
	Event *StakedBNBTokenMinted // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *StakedBNBTokenMintedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakedBNBTokenMinted)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(StakedBNBTokenMinted)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *StakedBNBTokenMintedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakedBNBTokenMintedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakedBNBTokenMinted represents a Minted event raised by the StakedBNBToken contract.
type StakedBNBTokenMinted struct {
	Operator     common.Address
	To           common.Address
	Amount       *big.Int
	Data         []byte
	OperatorData []byte
	Raw          types.Log // Blockchain specific contextual infos
}

// FilterMinted is a free log retrieval operation binding the contract event 0x2fe5be0146f74c5bce36c0b80911af6c7d86ff27e89d5cfa61fc681327954e5d.
//
// Solidity: event Minted(address indexed operator, address indexed to, uint256 amount, bytes data, bytes operatorData)
func (_StakedBNBToken *StakedBNBTokenFilterer) FilterMinted(opts *bind.FilterOpts, operator []common.Address, to []common.Address) (*StakedBNBTokenMintedIterator, error) {

	var operatorRule []interface{}
	for _, operatorItem := range operator {
		operatorRule = append(operatorRule, operatorItem)
	}
	var toRule []interface{}
	for _, toItem := range to {
		toRule = append(toRule, toItem)
	}

	logs, sub, err := _StakedBNBToken.contract.FilterLogs(opts, "Minted", operatorRule, toRule)
	if err != nil {
		return nil, err
	}
	return &StakedBNBTokenMintedIterator{contract: _StakedBNBToken.contract, event: "Minted", logs: logs, sub: sub}, nil
}

// WatchMinted is a free log subscription operation binding the contract event 0x2fe5be0146f74c5bce36c0b80911af6c7d86ff27e89d5cfa61fc681327954e5d.
//
// Solidity: event Minted(address indexed operator, address indexed to, uint256 amount, bytes data, bytes operatorData)
func (_StakedBNBToken *StakedBNBTokenFilterer) WatchMinted(opts *bind.WatchOpts, sink chan<- *StakedBNBTokenMinted, operator []common.Address, to []common.Address) (event.Subscription, error) {

	var operatorRule []interface{}
	for _, operatorItem := range operator {
		operatorRule = append(operatorRule, operatorItem)
	}
	var toRule []interface{}
	for _, toItem := range to {
		toRule = append(toRule, toItem)
	}

	logs, sub, err := _StakedBNBToken.contract.WatchLogs(opts, "Minted", operatorRule, toRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakedBNBTokenMinted)
				if err := _StakedBNBToken.contract.UnpackLog(event, "Minted", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseMinted is a log parse operation binding the contract event 0x2fe5be0146f74c5bce36c0b80911af6c7d86ff27e89d5cfa61fc681327954e5d.
//
// Solidity: event Minted(address indexed operator, address indexed to, uint256 amount, bytes data, bytes operatorData)
func (_StakedBNBToken *StakedBNBTokenFilterer) ParseMinted(log types.Log) (*StakedBNBTokenMinted, error) {
	event := new(StakedBNBTokenMinted)
	if err := _StakedBNBToken.contract.UnpackLog(event, "Minted", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// StakedBNBTokenOwnershipTransferredIterator is returned from FilterOwnershipTransferred and is used to iterate over the raw logs and unpacked data for OwnershipTransferred events raised by the StakedBNBToken contract.
type StakedBNBTokenOwnershipTransferredIterator struct {
	Event *StakedBNBTokenOwnershipTransferred // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *StakedBNBTokenOwnershipTransferredIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakedBNBTokenOwnershipTransferred)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(StakedBNBTokenOwnershipTransferred)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *StakedBNBTokenOwnershipTransferredIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakedBNBTokenOwnershipTransferredIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakedBNBTokenOwnershipTransferred represents a OwnershipTransferred event raised by the StakedBNBToken contract.
type StakedBNBTokenOwnershipTransferred struct {
	PreviousOwner common.Address
	NewOwner      common.Address
	Raw           types.Log // Blockchain specific contextual infos
}

// FilterOwnershipTransferred is a free log retrieval operation binding the contract event 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0.
//
// Solidity: event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
func (_StakedBNBToken *StakedBNBTokenFilterer) FilterOwnershipTransferred(opts *bind.FilterOpts, previousOwner []common.Address, newOwner []common.Address) (*StakedBNBTokenOwnershipTransferredIterator, error) {

	var previousOwnerRule []interface{}
	for _, previousOwnerItem := range previousOwner {
		previousOwnerRule = append(previousOwnerRule, previousOwnerItem)
	}
	var newOwnerRule []interface{}
	for _, newOwnerItem := range newOwner {
		newOwnerRule = append(newOwnerRule, newOwnerItem)
	}

	logs, sub, err := _StakedBNBToken.contract.FilterLogs(opts, "OwnershipTransferred", previousOwnerRule, newOwnerRule)
	if err != nil {
		return nil, err
	}
	return &StakedBNBTokenOwnershipTransferredIterator{contract: _StakedBNBToken.contract, event: "OwnershipTransferred", logs: logs, sub: sub}, nil
}

// WatchOwnershipTransferred is a free log subscription operation binding the contract event 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0.
//
// Solidity: event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
func (_StakedBNBToken *StakedBNBTokenFilterer) WatchOwnershipTransferred(opts *bind.WatchOpts, sink chan<- *StakedBNBTokenOwnershipTransferred, previousOwner []common.Address, newOwner []common.Address) (event.Subscription, error) {

	var previousOwnerRule []interface{}
	for _, previousOwnerItem := range previousOwner {
		previousOwnerRule = append(previousOwnerRule, previousOwnerItem)
	}
	var newOwnerRule []interface{}
	for _, newOwnerItem := range newOwner {
		newOwnerRule = append(newOwnerRule, newOwnerItem)
	}

	logs, sub, err := _StakedBNBToken.contract.WatchLogs(opts, "OwnershipTransferred", previousOwnerRule, newOwnerRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakedBNBTokenOwnershipTransferred)
				if err := _StakedBNBToken.contract.UnpackLog(event, "OwnershipTransferred", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseOwnershipTransferred is a log parse operation binding the contract event 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0.
//
// Solidity: event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
func (_StakedBNBToken *StakedBNBTokenFilterer) ParseOwnershipTransferred(log types.Log) (*StakedBNBTokenOwnershipTransferred, error) {
	event := new(StakedBNBTokenOwnershipTransferred)
	if err := _StakedBNBToken.contract.UnpackLog(event, "OwnershipTransferred", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// StakedBNBTokenPausedIterator is returned from FilterPaused and is used to iterate over the raw logs and unpacked data for Paused events raised by the StakedBNBToken contract.
type StakedBNBTokenPausedIterator struct {
	Event *StakedBNBTokenPaused // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *StakedBNBTokenPausedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakedBNBTokenPaused)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(StakedBNBTokenPaused)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *StakedBNBTokenPausedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakedBNBTokenPausedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakedBNBTokenPaused represents a Paused event raised by the StakedBNBToken contract.
type StakedBNBTokenPaused struct {
	Account common.Address
	Raw     types.Log // Blockchain specific contextual infos
}

// FilterPaused is a free log retrieval operation binding the contract event 0x62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258.
//
// Solidity: event Paused(address account)
func (_StakedBNBToken *StakedBNBTokenFilterer) FilterPaused(opts *bind.FilterOpts) (*StakedBNBTokenPausedIterator, error) {

	logs, sub, err := _StakedBNBToken.contract.FilterLogs(opts, "Paused")
	if err != nil {
		return nil, err
	}
	return &StakedBNBTokenPausedIterator{contract: _StakedBNBToken.contract, event: "Paused", logs: logs, sub: sub}, nil
}

// WatchPaused is a free log subscription operation binding the contract event 0x62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258.
//
// Solidity: event Paused(address account)
func (_StakedBNBToken *StakedBNBTokenFilterer) WatchPaused(opts *bind.WatchOpts, sink chan<- *StakedBNBTokenPaused) (event.Subscription, error) {

	logs, sub, err := _StakedBNBToken.contract.WatchLogs(opts, "Paused")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakedBNBTokenPaused)
				if err := _StakedBNBToken.contract.UnpackLog(event, "Paused", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParsePaused is a log parse operation binding the contract event 0x62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258.
//
// Solidity: event Paused(address account)
func (_StakedBNBToken *StakedBNBTokenFilterer) ParsePaused(log types.Log) (*StakedBNBTokenPaused, error) {
	event := new(StakedBNBTokenPaused)
	if err := _StakedBNBToken.contract.UnpackLog(event, "Paused", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// StakedBNBTokenRevokedOperatorIterator is returned from FilterRevokedOperator and is used to iterate over the raw logs and unpacked data for RevokedOperator events raised by the StakedBNBToken contract.
type StakedBNBTokenRevokedOperatorIterator struct {
	Event *StakedBNBTokenRevokedOperator // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *StakedBNBTokenRevokedOperatorIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakedBNBTokenRevokedOperator)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(StakedBNBTokenRevokedOperator)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *StakedBNBTokenRevokedOperatorIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakedBNBTokenRevokedOperatorIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakedBNBTokenRevokedOperator represents a RevokedOperator event raised by the StakedBNBToken contract.
type StakedBNBTokenRevokedOperator struct {
	Operator    common.Address
	TokenHolder common.Address
	Raw         types.Log // Blockchain specific contextual infos
}

// FilterRevokedOperator is a free log retrieval operation binding the contract event 0x50546e66e5f44d728365dc3908c63bc5cfeeab470722c1677e3073a6ac294aa1.
//
// Solidity: event RevokedOperator(address indexed operator, address indexed tokenHolder)
func (_StakedBNBToken *StakedBNBTokenFilterer) FilterRevokedOperator(opts *bind.FilterOpts, operator []common.Address, tokenHolder []common.Address) (*StakedBNBTokenRevokedOperatorIterator, error) {

	var operatorRule []interface{}
	for _, operatorItem := range operator {
		operatorRule = append(operatorRule, operatorItem)
	}
	var tokenHolderRule []interface{}
	for _, tokenHolderItem := range tokenHolder {
		tokenHolderRule = append(tokenHolderRule, tokenHolderItem)
	}

	logs, sub, err := _StakedBNBToken.contract.FilterLogs(opts, "RevokedOperator", operatorRule, tokenHolderRule)
	if err != nil {
		return nil, err
	}
	return &StakedBNBTokenRevokedOperatorIterator{contract: _StakedBNBToken.contract, event: "RevokedOperator", logs: logs, sub: sub}, nil
}

// WatchRevokedOperator is a free log subscription operation binding the contract event 0x50546e66e5f44d728365dc3908c63bc5cfeeab470722c1677e3073a6ac294aa1.
//
// Solidity: event RevokedOperator(address indexed operator, address indexed tokenHolder)
func (_StakedBNBToken *StakedBNBTokenFilterer) WatchRevokedOperator(opts *bind.WatchOpts, sink chan<- *StakedBNBTokenRevokedOperator, operator []common.Address, tokenHolder []common.Address) (event.Subscription, error) {

	var operatorRule []interface{}
	for _, operatorItem := range operator {
		operatorRule = append(operatorRule, operatorItem)
	}
	var tokenHolderRule []interface{}
	for _, tokenHolderItem := range tokenHolder {
		tokenHolderRule = append(tokenHolderRule, tokenHolderItem)
	}

	logs, sub, err := _StakedBNBToken.contract.WatchLogs(opts, "RevokedOperator", operatorRule, tokenHolderRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakedBNBTokenRevokedOperator)
				if err := _StakedBNBToken.contract.UnpackLog(event, "RevokedOperator", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseRevokedOperator is a log parse operation binding the contract event 0x50546e66e5f44d728365dc3908c63bc5cfeeab470722c1677e3073a6ac294aa1.
//
// Solidity: event RevokedOperator(address indexed operator, address indexed tokenHolder)
func (_StakedBNBToken *StakedBNBTokenFilterer) ParseRevokedOperator(log types.Log) (*StakedBNBTokenRevokedOperator, error) {
	event := new(StakedBNBTokenRevokedOperator)
	if err := _StakedBNBToken.contract.UnpackLog(event, "RevokedOperator", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// StakedBNBTokenSentIterator is returned from FilterSent and is used to iterate over the raw logs and unpacked data for Sent events raised by the StakedBNBToken contract.
type StakedBNBTokenSentIterator struct {
	Event *StakedBNBTokenSent // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *StakedBNBTokenSentIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakedBNBTokenSent)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(StakedBNBTokenSent)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *StakedBNBTokenSentIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakedBNBTokenSentIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakedBNBTokenSent represents a Sent event raised by the StakedBNBToken contract.
type StakedBNBTokenSent struct {
	Operator     common.Address
	From         common.Address
	To           common.Address
	Amount       *big.Int
	Data         []byte
	OperatorData []byte
	Raw          types.Log // Blockchain specific contextual infos
}

// FilterSent is a free log retrieval operation binding the contract event 0x06b541ddaa720db2b10a4d0cdac39b8d360425fc073085fac19bc82614677987.
//
// Solidity: event Sent(address indexed operator, address indexed from, address indexed to, uint256 amount, bytes data, bytes operatorData)
func (_StakedBNBToken *StakedBNBTokenFilterer) FilterSent(opts *bind.FilterOpts, operator []common.Address, from []common.Address, to []common.Address) (*StakedBNBTokenSentIterator, error) {

	var operatorRule []interface{}
	for _, operatorItem := range operator {
		operatorRule = append(operatorRule, operatorItem)
	}
	var fromRule []interface{}
	for _, fromItem := range from {
		fromRule = append(fromRule, fromItem)
	}
	var toRule []interface{}
	for _, toItem := range to {
		toRule = append(toRule, toItem)
	}

	logs, sub, err := _StakedBNBToken.contract.FilterLogs(opts, "Sent", operatorRule, fromRule, toRule)
	if err != nil {
		return nil, err
	}
	return &StakedBNBTokenSentIterator{contract: _StakedBNBToken.contract, event: "Sent", logs: logs, sub: sub}, nil
}

// WatchSent is a free log subscription operation binding the contract event 0x06b541ddaa720db2b10a4d0cdac39b8d360425fc073085fac19bc82614677987.
//
// Solidity: event Sent(address indexed operator, address indexed from, address indexed to, uint256 amount, bytes data, bytes operatorData)
func (_StakedBNBToken *StakedBNBTokenFilterer) WatchSent(opts *bind.WatchOpts, sink chan<- *StakedBNBTokenSent, operator []common.Address, from []common.Address, to []common.Address) (event.Subscription, error) {

	var operatorRule []interface{}
	for _, operatorItem := range operator {
		operatorRule = append(operatorRule, operatorItem)
	}
	var fromRule []interface{}
	for _, fromItem := range from {
		fromRule = append(fromRule, fromItem)
	}
	var toRule []interface{}
	for _, toItem := range to {
		toRule = append(toRule, toItem)
	}

	logs, sub, err := _StakedBNBToken.contract.WatchLogs(opts, "Sent", operatorRule, fromRule, toRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakedBNBTokenSent)
				if err := _StakedBNBToken.contract.UnpackLog(event, "Sent", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseSent is a log parse operation binding the contract event 0x06b541ddaa720db2b10a4d0cdac39b8d360425fc073085fac19bc82614677987.
//
// Solidity: event Sent(address indexed operator, address indexed from, address indexed to, uint256 amount, bytes data, bytes operatorData)
func (_StakedBNBToken *StakedBNBTokenFilterer) ParseSent(log types.Log) (*StakedBNBTokenSent, error) {
	event := new(StakedBNBTokenSent)
	if err := _StakedBNBToken.contract.UnpackLog(event, "Sent", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// StakedBNBTokenTransferIterator is returned from FilterTransfer and is used to iterate over the raw logs and unpacked data for Transfer events raised by the StakedBNBToken contract.
type StakedBNBTokenTransferIterator struct {
	Event *StakedBNBTokenTransfer // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *StakedBNBTokenTransferIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakedBNBTokenTransfer)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(StakedBNBTokenTransfer)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *StakedBNBTokenTransferIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakedBNBTokenTransferIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakedBNBTokenTransfer represents a Transfer event raised by the StakedBNBToken contract.
type StakedBNBTokenTransfer struct {
	From  common.Address
	To    common.Address
	Value *big.Int
	Raw   types.Log // Blockchain specific contextual infos
}

// FilterTransfer is a free log retrieval operation binding the contract event 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef.
//
// Solidity: event Transfer(address indexed from, address indexed to, uint256 value)
func (_StakedBNBToken *StakedBNBTokenFilterer) FilterTransfer(opts *bind.FilterOpts, from []common.Address, to []common.Address) (*StakedBNBTokenTransferIterator, error) {

	var fromRule []interface{}
	for _, fromItem := range from {
		fromRule = append(fromRule, fromItem)
	}
	var toRule []interface{}
	for _, toItem := range to {
		toRule = append(toRule, toItem)
	}

	logs, sub, err := _StakedBNBToken.contract.FilterLogs(opts, "Transfer", fromRule, toRule)
	if err != nil {
		return nil, err
	}
	return &StakedBNBTokenTransferIterator{contract: _StakedBNBToken.contract, event: "Transfer", logs: logs, sub: sub}, nil
}

// WatchTransfer is a free log subscription operation binding the contract event 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef.
//
// Solidity: event Transfer(address indexed from, address indexed to, uint256 value)
func (_StakedBNBToken *StakedBNBTokenFilterer) WatchTransfer(opts *bind.WatchOpts, sink chan<- *StakedBNBTokenTransfer, from []common.Address, to []common.Address) (event.Subscription, error) {

	var fromRule []interface{}
	for _, fromItem := range from {
		fromRule = append(fromRule, fromItem)
	}
	var toRule []interface{}
	for _, toItem := range to {
		toRule = append(toRule, toItem)
	}

	logs, sub, err := _StakedBNBToken.contract.WatchLogs(opts, "Transfer", fromRule, toRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakedBNBTokenTransfer)
				if err := _StakedBNBToken.contract.UnpackLog(event, "Transfer", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseTransfer is a log parse operation binding the contract event 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef.
//
// Solidity: event Transfer(address indexed from, address indexed to, uint256 value)
func (_StakedBNBToken *StakedBNBTokenFilterer) ParseTransfer(log types.Log) (*StakedBNBTokenTransfer, error) {
	event := new(StakedBNBTokenTransfer)
	if err := _StakedBNBToken.contract.UnpackLog(event, "Transfer", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// StakedBNBTokenUnpausedIterator is returned from FilterUnpaused and is used to iterate over the raw logs and unpacked data for Unpaused events raised by the StakedBNBToken contract.
type StakedBNBTokenUnpausedIterator struct {
	Event *StakedBNBTokenUnpaused // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *StakedBNBTokenUnpausedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakedBNBTokenUnpaused)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(StakedBNBTokenUnpaused)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *StakedBNBTokenUnpausedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakedBNBTokenUnpausedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakedBNBTokenUnpaused represents a Unpaused event raised by the StakedBNBToken contract.
type StakedBNBTokenUnpaused struct {
	Account common.Address
	Raw     types.Log // Blockchain specific contextual infos
}

// FilterUnpaused is a free log retrieval operation binding the contract event 0x5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa.
//
// Solidity: event Unpaused(address account)
func (_StakedBNBToken *StakedBNBTokenFilterer) FilterUnpaused(opts *bind.FilterOpts) (*StakedBNBTokenUnpausedIterator, error) {

	logs, sub, err := _StakedBNBToken.contract.FilterLogs(opts, "Unpaused")
	if err != nil {
		return nil, err
	}
	return &StakedBNBTokenUnpausedIterator{contract: _StakedBNBToken.contract, event: "Unpaused", logs: logs, sub: sub}, nil
}

// WatchUnpaused is a free log subscription operation binding the contract event 0x5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa.
//
// Solidity: event Unpaused(address account)
func (_StakedBNBToken *StakedBNBTokenFilterer) WatchUnpaused(opts *bind.WatchOpts, sink chan<- *StakedBNBTokenUnpaused) (event.Subscription, error) {

	logs, sub, err := _StakedBNBToken.contract.WatchLogs(opts, "Unpaused")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakedBNBTokenUnpaused)
				if err := _StakedBNBToken.contract.UnpackLog(event, "Unpaused", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseUnpaused is a log parse operation binding the contract event 0x5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa.
//
// Solidity: event Unpaused(address account)
func (_StakedBNBToken *StakedBNBTokenFilterer) ParseUnpaused(log types.Log) (*StakedBNBTokenUnpaused, error) {
	event := new(StakedBNBTokenUnpaused)
	if err := _StakedBNBToken.contract.UnpackLog(event, "Unpaused", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}
