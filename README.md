# stkBNB - Binance Liquid Staking Protocol

## Deployments

### Mainnet

#### Contracts
* StakePool: [`0xC228CefDF841dEfDbD5B3a18dFD414cC0dbfa0D8`](https://bscscan.com/address/0xC228CefDF841dEfDbD5B3a18dFD414cC0dbfa0D8) (proxy)
* stkBNB Token: [`0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16`](https://bscscan.com/token/0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16)
* FeeVault: [`0x2FC80E731C40ec6590783bb11Eede9dd43fC69bf`](https://bscscan.com/address/0x2FC80E731C40ec6590783bb11Eede9dd43fC69bf) (proxy)
* UndelegationHolder: [`0x3C0Fc52c7de41363C14a63EA09Ba4202d15Dc298`](https://bscscan.com/address/0x3C0Fc52c7de41363C14a63EA09Ba4202d15Dc298)
* AddressStore: [`0x4a6b3127A1D295878d8790F6ece0776F65FEc121`](https://bscscan.com/address/0x4a6b3127A1D295878d8790F6ece0776F65FEc121)
* TimelockedAdmin: [`0xc1F861FBE4AA730ba19DFA1b1e75ec030E54B607`](https://bscscan.com/address/0xc1F861FBE4AA730ba19DFA1b1e75ec030E54B607)
* ProxyAdmin (admin for proxy contracts): [`0x457CCDA8D92172bB0a692a9167cA82673694D370`](https://bscscan.com/address/0x457CCDA8D92172bB0a692a9167cA82673694D370)

#### Gnosis multi-sig accounts
* Primary: [`0x30dcAB6c01c1Aa2f1DC5648b78a57fD5D0F3BBDB`](https://bscscan.com/address/0x30dcAB6c01c1Aa2f1DC5648b78a57fD5D0F3BBDB)
* Secondary: [`0xA0F880E7AB8B2bBA47d8dEA48843cc43d68065CB`](https://bscscan.com/address/0xA0F880E7AB8B2bBA47d8dEA48843cc43d68065CB)

#### Relevant ownership transfer transactions:
* Transferred stkBNB BEP20 ownership from deployer to primary Gnosis: [`0x00b501ff3abfd6d940d09fb3fd392f3f48dbf34f4590e372ae1a5126b22e1699`](https://bscscan.com/tx/0x00b501ff3abfd6d940d09fb3fd392f3f48dbf34f4590e372ae1a5126b22e1699)
* StakePool:
  * Granted DEFAULT_ADMIN to primary Gnosis: [`0xaeeeeae82d29593b1ab643447294ab19acb704ed49b63a4ef18ddf266211bd98`](https://bscscan.com/tx/0xaeeeeae82d29593b1ab643447294ab19acb704ed49b63a4ef18ddf266211bd98)
  * Granted DEFAULT_ADMIN to secondary Gnosis: [`0x7630b728f86816fdc9174bf1e3f0198dc53ed6059e8216246c59ae0f26923129`](https://bscscan.com/tx/0x7630b728f86816fdc9174bf1e3f0198dc53ed6059e8216246c59ae0f26923129)
  * Revoked DEFAULT_ADMIN from deployer: [`0xafb77f2cf61ce040d93057f1e9cc5f46d9ac010d838811e84e9ba71278bfeada`](https://bscscan.com/tx/0xafb77f2cf61ce040d93057f1e9cc5f46d9ac010d838811e84e9ba71278bfeada)
* Transferred FeeVault ownership from deployer to secondary Gnosis: [`0xf557a374134c5d06025fc0bffc95924c619dabaea5c26981ceaa9f8321895a16`](https://bscscan.com/tx/0xf557a374134c5d06025fc0bffc95924c619dabaea5c26981ceaa9f8321895a16)
* TimelockedAdmin:
  * Granted PROPOSER_ROLE to primary Gnosis: [`0xf503b76c39558a5156c868df4984f02b4a63447d80c1d14ff47d0d3d8300f943`](https://bscscan.com/tx/0xf503b76c39558a5156c868df4984f02b4a63447d80c1d14ff47d0d3d8300f943)
  * Granted PROPOSER_ROLE to secondary Gnosis: [`0xe2e72736eb459f4f97c95e1c313f84ebf14e0824d0c8053e84de6afa9117a5bf`](https://bscscan.com/tx/0xe2e72736eb459f4f97c95e1c313f84ebf14e0824d0c8053e84de6afa9117a5bf)
  * Granted CANCELLER_ROLE to primary Gnosis: [`0x63dfe9b53b5d8220b49891e18116787fc8c83d422aef7c011d0c10ad2d2bff62`](https://bscscan.com/tx/0x63dfe9b53b5d8220b49891e18116787fc8c83d422aef7c011d0c10ad2d2bff62)
  * Granted CANCELLER_ROLE to secondary Gnosis: [`0x5fdb18b35740a252718769056952f7c6deb56759af5d4c7445c81874c9c5c527`](https://bscscan.com/tx/0x5fdb18b35740a252718769056952f7c6deb56759af5d4c7445c81874c9c5c527)
  * Revoked TIMELOCK_ADMIN_ROLE from deployer: [`0x65f644f07f4aee664a2093d6ce4a636ae4c9301f3daef97e255ec1de0222093a`](https://bscscan.com/tx/0x65f644f07f4aee664a2093d6ce4a636ae4c9301f3daef97e255ec1de0222093a)
* Transferred AddressStore ownership from deployer to TimelockedAdmin: [`0x14b29d2fde6ffb5cf48b0339b9f2cfe4c18f49824ab4749fbd8ad6c26413886a`](https://bscscan.com/tx/0x14b29d2fde6ffb5cf48b0339b9f2cfe4c18f49824ab4749fbd8ad6c26413886a)
* Transferred ProxyAdmin ownership from deployer to TimelockedAdmin: [`0x936a06cb1278fd3756cd6faa2ca2f22ab20e003131c615038d2904f739c3902a`](https://bscscan.com/tx/0x936a06cb1278fd3756cd6faa2ca2f22ab20e003131c615038d2904f739c3902a)