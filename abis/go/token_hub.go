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

// TokenHubMetaData contains all meta data concerning the TokenHub contract.
var TokenHubMetaData = &bind.MetaData{
	ABI: "[{\"inputs\":[{\"internalType\":\"address\",\"name\":\"contractAddr\",\"type\":\"address\"}],\"name\":\"getBoundBep2Symbol\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"string\",\"name\":\"bep2Symbol\",\"type\":\"string\"}],\"name\":\"getBoundContract\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getMiniRelayFee\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"contractAddr\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"},{\"internalType\":\"uint64\",\"name\":\"expireTime\",\"type\":\"uint64\"}],\"name\":\"transferOut\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"payable\",\"type\":\"function\"}]",
}

// TokenHubABI is the input ABI used to generate the binding from.
// Deprecated: Use TokenHubMetaData.ABI instead.
var TokenHubABI = TokenHubMetaData.ABI

// TokenHub is an auto generated Go binding around an Ethereum contract.
type TokenHub struct {
	TokenHubCaller     // Read-only binding to the contract
	TokenHubTransactor // Write-only binding to the contract
	TokenHubFilterer   // Log filterer for contract events
}

// TokenHubCaller is an auto generated read-only Go binding around an Ethereum contract.
type TokenHubCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// TokenHubTransactor is an auto generated write-only Go binding around an Ethereum contract.
type TokenHubTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// TokenHubFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type TokenHubFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// TokenHubSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type TokenHubSession struct {
	Contract     *TokenHub         // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// TokenHubCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type TokenHubCallerSession struct {
	Contract *TokenHubCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts   // Call options to use throughout this session
}

// TokenHubTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type TokenHubTransactorSession struct {
	Contract     *TokenHubTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts   // Transaction auth options to use throughout this session
}

// TokenHubRaw is an auto generated low-level Go binding around an Ethereum contract.
type TokenHubRaw struct {
	Contract *TokenHub // Generic contract binding to access the raw methods on
}

// TokenHubCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type TokenHubCallerRaw struct {
	Contract *TokenHubCaller // Generic read-only contract binding to access the raw methods on
}

// TokenHubTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type TokenHubTransactorRaw struct {
	Contract *TokenHubTransactor // Generic write-only contract binding to access the raw methods on
}

// NewTokenHub creates a new instance of TokenHub, bound to a specific deployed contract.
func NewTokenHub(address common.Address, backend bind.ContractBackend) (*TokenHub, error) {
	contract, err := bindTokenHub(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &TokenHub{TokenHubCaller: TokenHubCaller{contract: contract}, TokenHubTransactor: TokenHubTransactor{contract: contract}, TokenHubFilterer: TokenHubFilterer{contract: contract}}, nil
}

// NewTokenHubCaller creates a new read-only instance of TokenHub, bound to a specific deployed contract.
func NewTokenHubCaller(address common.Address, caller bind.ContractCaller) (*TokenHubCaller, error) {
	contract, err := bindTokenHub(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &TokenHubCaller{contract: contract}, nil
}

// NewTokenHubTransactor creates a new write-only instance of TokenHub, bound to a specific deployed contract.
func NewTokenHubTransactor(address common.Address, transactor bind.ContractTransactor) (*TokenHubTransactor, error) {
	contract, err := bindTokenHub(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &TokenHubTransactor{contract: contract}, nil
}

// NewTokenHubFilterer creates a new log filterer instance of TokenHub, bound to a specific deployed contract.
func NewTokenHubFilterer(address common.Address, filterer bind.ContractFilterer) (*TokenHubFilterer, error) {
	contract, err := bindTokenHub(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &TokenHubFilterer{contract: contract}, nil
}

// bindTokenHub binds a generic wrapper to an already deployed contract.
func bindTokenHub(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(TokenHubABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_TokenHub *TokenHubRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _TokenHub.Contract.TokenHubCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_TokenHub *TokenHubRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _TokenHub.Contract.TokenHubTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_TokenHub *TokenHubRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _TokenHub.Contract.TokenHubTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_TokenHub *TokenHubCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _TokenHub.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_TokenHub *TokenHubTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _TokenHub.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_TokenHub *TokenHubTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _TokenHub.Contract.contract.Transact(opts, method, params...)
}

// GetBoundBep2Symbol is a free data retrieval call binding the contract method 0xfc1a598f.
//
// Solidity: function getBoundBep2Symbol(address contractAddr) view returns(string)
func (_TokenHub *TokenHubCaller) GetBoundBep2Symbol(opts *bind.CallOpts, contractAddr common.Address) (string, error) {
	var out []interface{}
	err := _TokenHub.contract.Call(opts, &out, "getBoundBep2Symbol", contractAddr)

	if err != nil {
		return *new(string), err
	}

	out0 := *abi.ConvertType(out[0], new(string)).(*string)

	return out0, err

}

// GetBoundBep2Symbol is a free data retrieval call binding the contract method 0xfc1a598f.
//
// Solidity: function getBoundBep2Symbol(address contractAddr) view returns(string)
func (_TokenHub *TokenHubSession) GetBoundBep2Symbol(contractAddr common.Address) (string, error) {
	return _TokenHub.Contract.GetBoundBep2Symbol(&_TokenHub.CallOpts, contractAddr)
}

// GetBoundBep2Symbol is a free data retrieval call binding the contract method 0xfc1a598f.
//
// Solidity: function getBoundBep2Symbol(address contractAddr) view returns(string)
func (_TokenHub *TokenHubCallerSession) GetBoundBep2Symbol(contractAddr common.Address) (string, error) {
	return _TokenHub.Contract.GetBoundBep2Symbol(&_TokenHub.CallOpts, contractAddr)
}

// GetBoundContract is a free data retrieval call binding the contract method 0x3d713223.
//
// Solidity: function getBoundContract(string bep2Symbol) view returns(address)
func (_TokenHub *TokenHubCaller) GetBoundContract(opts *bind.CallOpts, bep2Symbol string) (common.Address, error) {
	var out []interface{}
	err := _TokenHub.contract.Call(opts, &out, "getBoundContract", bep2Symbol)

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// GetBoundContract is a free data retrieval call binding the contract method 0x3d713223.
//
// Solidity: function getBoundContract(string bep2Symbol) view returns(address)
func (_TokenHub *TokenHubSession) GetBoundContract(bep2Symbol string) (common.Address, error) {
	return _TokenHub.Contract.GetBoundContract(&_TokenHub.CallOpts, bep2Symbol)
}

// GetBoundContract is a free data retrieval call binding the contract method 0x3d713223.
//
// Solidity: function getBoundContract(string bep2Symbol) view returns(address)
func (_TokenHub *TokenHubCallerSession) GetBoundContract(bep2Symbol string) (common.Address, error) {
	return _TokenHub.Contract.GetBoundContract(&_TokenHub.CallOpts, bep2Symbol)
}

// GetMiniRelayFee is a free data retrieval call binding the contract method 0x149d14d9.
//
// Solidity: function getMiniRelayFee() view returns(uint256)
func (_TokenHub *TokenHubCaller) GetMiniRelayFee(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _TokenHub.contract.Call(opts, &out, "getMiniRelayFee")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetMiniRelayFee is a free data retrieval call binding the contract method 0x149d14d9.
//
// Solidity: function getMiniRelayFee() view returns(uint256)
func (_TokenHub *TokenHubSession) GetMiniRelayFee() (*big.Int, error) {
	return _TokenHub.Contract.GetMiniRelayFee(&_TokenHub.CallOpts)
}

// GetMiniRelayFee is a free data retrieval call binding the contract method 0x149d14d9.
//
// Solidity: function getMiniRelayFee() view returns(uint256)
func (_TokenHub *TokenHubCallerSession) GetMiniRelayFee() (*big.Int, error) {
	return _TokenHub.Contract.GetMiniRelayFee(&_TokenHub.CallOpts)
}

// TransferOut is a paid mutator transaction binding the contract method 0xaa7415f5.
//
// Solidity: function transferOut(address contractAddr, address recipient, uint256 amount, uint64 expireTime) payable returns(bool)
func (_TokenHub *TokenHubTransactor) TransferOut(opts *bind.TransactOpts, contractAddr common.Address, recipient common.Address, amount *big.Int, expireTime uint64) (*types.Transaction, error) {
	return _TokenHub.contract.Transact(opts, "transferOut", contractAddr, recipient, amount, expireTime)
}

// TransferOut is a paid mutator transaction binding the contract method 0xaa7415f5.
//
// Solidity: function transferOut(address contractAddr, address recipient, uint256 amount, uint64 expireTime) payable returns(bool)
func (_TokenHub *TokenHubSession) TransferOut(contractAddr common.Address, recipient common.Address, amount *big.Int, expireTime uint64) (*types.Transaction, error) {
	return _TokenHub.Contract.TransferOut(&_TokenHub.TransactOpts, contractAddr, recipient, amount, expireTime)
}

// TransferOut is a paid mutator transaction binding the contract method 0xaa7415f5.
//
// Solidity: function transferOut(address contractAddr, address recipient, uint256 amount, uint64 expireTime) payable returns(bool)
func (_TokenHub *TokenHubTransactorSession) TransferOut(contractAddr common.Address, recipient common.Address, amount *big.Int, expireTime uint64) (*types.Transaction, error) {
	return _TokenHub.Contract.TransferOut(&_TokenHub.TransactOpts, contractAddr, recipient, amount, expireTime)
}
