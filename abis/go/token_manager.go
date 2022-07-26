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

// TokenManagerMetaData contains all meta data concerning the TokenManager contract.
var TokenManagerMetaData = &bind.MetaData{
	ABI: "[{\"inputs\":[{\"internalType\":\"address\",\"name\":\"bep20Addr\",\"type\":\"address\"},{\"internalType\":\"uint64\",\"name\":\"expireTime\",\"type\":\"uint64\"}],\"name\":\"mirror\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"mirrorFee\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"bep20Addr\",\"type\":\"address\"},{\"internalType\":\"uint64\",\"name\":\"expireTime\",\"type\":\"uint64\"}],\"name\":\"sync\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"syncFee\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"}]",
}

// TokenManagerABI is the input ABI used to generate the binding from.
// Deprecated: Use TokenManagerMetaData.ABI instead.
var TokenManagerABI = TokenManagerMetaData.ABI

// TokenManager is an auto generated Go binding around an Ethereum contract.
type TokenManager struct {
	TokenManagerCaller     // Read-only binding to the contract
	TokenManagerTransactor // Write-only binding to the contract
	TokenManagerFilterer   // Log filterer for contract events
}

// TokenManagerCaller is an auto generated read-only Go binding around an Ethereum contract.
type TokenManagerCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// TokenManagerTransactor is an auto generated write-only Go binding around an Ethereum contract.
type TokenManagerTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// TokenManagerFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type TokenManagerFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// TokenManagerSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type TokenManagerSession struct {
	Contract     *TokenManager     // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// TokenManagerCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type TokenManagerCallerSession struct {
	Contract *TokenManagerCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts       // Call options to use throughout this session
}

// TokenManagerTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type TokenManagerTransactorSession struct {
	Contract     *TokenManagerTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts       // Transaction auth options to use throughout this session
}

// TokenManagerRaw is an auto generated low-level Go binding around an Ethereum contract.
type TokenManagerRaw struct {
	Contract *TokenManager // Generic contract binding to access the raw methods on
}

// TokenManagerCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type TokenManagerCallerRaw struct {
	Contract *TokenManagerCaller // Generic read-only contract binding to access the raw methods on
}

// TokenManagerTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type TokenManagerTransactorRaw struct {
	Contract *TokenManagerTransactor // Generic write-only contract binding to access the raw methods on
}

// NewTokenManager creates a new instance of TokenManager, bound to a specific deployed contract.
func NewTokenManager(address common.Address, backend bind.ContractBackend) (*TokenManager, error) {
	contract, err := bindTokenManager(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &TokenManager{TokenManagerCaller: TokenManagerCaller{contract: contract}, TokenManagerTransactor: TokenManagerTransactor{contract: contract}, TokenManagerFilterer: TokenManagerFilterer{contract: contract}}, nil
}

// NewTokenManagerCaller creates a new read-only instance of TokenManager, bound to a specific deployed contract.
func NewTokenManagerCaller(address common.Address, caller bind.ContractCaller) (*TokenManagerCaller, error) {
	contract, err := bindTokenManager(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &TokenManagerCaller{contract: contract}, nil
}

// NewTokenManagerTransactor creates a new write-only instance of TokenManager, bound to a specific deployed contract.
func NewTokenManagerTransactor(address common.Address, transactor bind.ContractTransactor) (*TokenManagerTransactor, error) {
	contract, err := bindTokenManager(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &TokenManagerTransactor{contract: contract}, nil
}

// NewTokenManagerFilterer creates a new log filterer instance of TokenManager, bound to a specific deployed contract.
func NewTokenManagerFilterer(address common.Address, filterer bind.ContractFilterer) (*TokenManagerFilterer, error) {
	contract, err := bindTokenManager(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &TokenManagerFilterer{contract: contract}, nil
}

// bindTokenManager binds a generic wrapper to an already deployed contract.
func bindTokenManager(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(TokenManagerABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_TokenManager *TokenManagerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _TokenManager.Contract.TokenManagerCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_TokenManager *TokenManagerRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _TokenManager.Contract.TokenManagerTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_TokenManager *TokenManagerRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _TokenManager.Contract.TokenManagerTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_TokenManager *TokenManagerCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _TokenManager.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_TokenManager *TokenManagerTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _TokenManager.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_TokenManager *TokenManagerTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _TokenManager.Contract.contract.Transact(opts, method, params...)
}

// MirrorFee is a free data retrieval call binding the contract method 0x7ec816dd.
//
// Solidity: function mirrorFee() view returns(uint256)
func (_TokenManager *TokenManagerCaller) MirrorFee(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _TokenManager.contract.Call(opts, &out, "mirrorFee")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// MirrorFee is a free data retrieval call binding the contract method 0x7ec816dd.
//
// Solidity: function mirrorFee() view returns(uint256)
func (_TokenManager *TokenManagerSession) MirrorFee() (*big.Int, error) {
	return _TokenManager.Contract.MirrorFee(&_TokenManager.CallOpts)
}

// MirrorFee is a free data retrieval call binding the contract method 0x7ec816dd.
//
// Solidity: function mirrorFee() view returns(uint256)
func (_TokenManager *TokenManagerCallerSession) MirrorFee() (*big.Int, error) {
	return _TokenManager.Contract.MirrorFee(&_TokenManager.CallOpts)
}

// SyncFee is a free data retrieval call binding the contract method 0xe605bca0.
//
// Solidity: function syncFee() view returns(uint256)
func (_TokenManager *TokenManagerCaller) SyncFee(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _TokenManager.contract.Call(opts, &out, "syncFee")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// SyncFee is a free data retrieval call binding the contract method 0xe605bca0.
//
// Solidity: function syncFee() view returns(uint256)
func (_TokenManager *TokenManagerSession) SyncFee() (*big.Int, error) {
	return _TokenManager.Contract.SyncFee(&_TokenManager.CallOpts)
}

// SyncFee is a free data retrieval call binding the contract method 0xe605bca0.
//
// Solidity: function syncFee() view returns(uint256)
func (_TokenManager *TokenManagerCallerSession) SyncFee() (*big.Int, error) {
	return _TokenManager.Contract.SyncFee(&_TokenManager.CallOpts)
}

// Mirror is a paid mutator transaction binding the contract method 0x94553a4e.
//
// Solidity: function mirror(address bep20Addr, uint64 expireTime) payable returns(bool)
func (_TokenManager *TokenManagerTransactor) Mirror(opts *bind.TransactOpts, bep20Addr common.Address, expireTime uint64) (*types.Transaction, error) {
	return _TokenManager.contract.Transact(opts, "mirror", bep20Addr, expireTime)
}

// Mirror is a paid mutator transaction binding the contract method 0x94553a4e.
//
// Solidity: function mirror(address bep20Addr, uint64 expireTime) payable returns(bool)
func (_TokenManager *TokenManagerSession) Mirror(bep20Addr common.Address, expireTime uint64) (*types.Transaction, error) {
	return _TokenManager.Contract.Mirror(&_TokenManager.TransactOpts, bep20Addr, expireTime)
}

// Mirror is a paid mutator transaction binding the contract method 0x94553a4e.
//
// Solidity: function mirror(address bep20Addr, uint64 expireTime) payable returns(bool)
func (_TokenManager *TokenManagerTransactorSession) Mirror(bep20Addr common.Address, expireTime uint64) (*types.Transaction, error) {
	return _TokenManager.Contract.Mirror(&_TokenManager.TransactOpts, bep20Addr, expireTime)
}

// Sync is a paid mutator transaction binding the contract method 0x25c751b7.
//
// Solidity: function sync(address bep20Addr, uint64 expireTime) payable returns(bool)
func (_TokenManager *TokenManagerTransactor) Sync(opts *bind.TransactOpts, bep20Addr common.Address, expireTime uint64) (*types.Transaction, error) {
	return _TokenManager.contract.Transact(opts, "sync", bep20Addr, expireTime)
}

// Sync is a paid mutator transaction binding the contract method 0x25c751b7.
//
// Solidity: function sync(address bep20Addr, uint64 expireTime) payable returns(bool)
func (_TokenManager *TokenManagerSession) Sync(bep20Addr common.Address, expireTime uint64) (*types.Transaction, error) {
	return _TokenManager.Contract.Sync(&_TokenManager.TransactOpts, bep20Addr, expireTime)
}

// Sync is a paid mutator transaction binding the contract method 0x25c751b7.
//
// Solidity: function sync(address bep20Addr, uint64 expireTime) payable returns(bool)
func (_TokenManager *TokenManagerTransactorSession) Sync(bep20Addr common.Address, expireTime uint64) (*types.Transaction, error) {
	return _TokenManager.Contract.Sync(&_TokenManager.TransactOpts, bep20Addr, expireTime)
}
