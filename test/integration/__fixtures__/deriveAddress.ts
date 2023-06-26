import type {DeviceOwnedAddress, ErrorBase, Network} from '../../../src/Ada'
import {
  DeviceStatusCodes,
  DeviceStatusMessages,
  DeviceStatusError,
  AddressType,
} from '../../../src/Ada'
import {str_to_path} from '../../../src/utils/address'
import {Networks} from '../../test_utils'

type ByronTestCase = {
  testName: string
  network: Network
  addressParams: DeviceOwnedAddress
  result: string
}

export const byronTestCases: ByronTestCase[] = [
  // Mainnet
  {
    testName: 'mainnet 1',
    network: Networks.Mainnet,
    addressParams: {
      type: AddressType.BYRON,
      params: {
        spendingPath: str_to_path("44'/1815'/1'/0/55'"),
      },
    },
    result: 'Ae2tdPwUPEZELF6oijm8VFmhWpujnNzyG2zCf4RxfhmWqQKHo2drRD5Uhah',
  },
  {
    testName: 'mainnet 2',
    network: Networks.Mainnet,
    addressParams: {
      type: AddressType.BYRON,
      params: {
        spendingPath: str_to_path("44'/1815'/1'/0/12'"),
      },
    },
    result: 'Ae2tdPwUPEYyiPZzoMSN9GJMNZnn3S6ZAErrezee9s1bH6tjaX6m9Cyf3Wy',
  },
  {
    testName: 'mainnet 3',
    network: Networks.Mainnet,
    addressParams: {
      type: AddressType.BYRON,
      params: {
        spendingPath: str_to_path("44'/1815'/101'/0/12'"), // WARN
      },
    },
    result: 'Ae2tdPwUPEZ8DtpNK9twc8YXCoJ39Uwzc2FWqo1KvGsB8Kvhk14buuESy6g',
  },
  {
    testName: 'mainnet 4',
    network: Networks.Mainnet,
    addressParams: {
      type: AddressType.BYRON,
      params: {
        spendingPath: str_to_path("44'/1815'/0'/0/1000001'"), // WARN
      },
    },
    result: 'Ae2tdPwUPEZFxaTJw6iova9Crfc3QuoRJSdudsp5z5a9Ee7gQH7oNKrM6cW',
  },
  // Testnet
  {
    testName: 'testnet 1',
    network: Networks.Testnet,
    addressParams: {
      type: AddressType.BYRON,
      params: {
        spendingPath: str_to_path("44'/1815'/1'/0/12'"),
      },
    },
    result: '2657WMsDfac5GGdHMD6sR22tyhmFvuPrBZ79hvEvuisyUK9XCcB3nu8JecKuCXEkr',
  },
]

const Pointer = (
  blockIndex: number,
  txIndex: number,
  certificateIndex: number,
) => ({blockIndex, txIndex, certificateIndex})

type ShelleyTestCase = {
  testName: string
  network: Network
  addressParams: DeviceOwnedAddress
  result: string
}
export const shelleyTestCases: ShelleyTestCase[] = [
  {
    testName: 'base address path/path 1',
    network: Networks.Fake,
    addressParams: {
      type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/0'/0/1"),
        stakingPath: str_to_path("1852'/1815'/0'/2/0"),
      },
    },
    result:
      'addr1qdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwqdquehe',
  },
  {
    testName: 'base address path/path 2',
    network: Networks.Testnet,
    addressParams: {
      type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/0'/0/1"),
        stakingPath: str_to_path("1852'/1815'/0'/2/0"),
      },
    },
    result:
      'addr_test1qpd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwq9nnhk4',
  },
  {
    testName: 'base address path/path unusual spending path account',
    network: Networks.Fake,
    addressParams: {
      type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/101'/0/1"), // WARN
        stakingPath: str_to_path("1852'/1815'/0'/2/0"),
      },
    },
    result:
      'addr1qv6dcymepkghuyt0za9jxg5hn89art9y8yjcvhxclxdhndsayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwqdqq9xn',
  },
  {
    testName: 'base address path/path unusual spending path address index',
    network: Networks.Fake,
    addressParams: {
      type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/1'/0/1000001"), // WARN
        stakingPath: str_to_path("1852'/1815'/0'/2/0"),
      },
    },
    result:
      'addr1q08rwk27cdm6vcp272pqcwq3t3gzea0q5xws2z84zzejrkcayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwq2cxp3q',
  },
  {
    testName: 'base address path/path unusual staking path account',
    network: Networks.Fake,
    addressParams: {
      type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/10'/0/4"),
        stakingPath: str_to_path("1852'/1815'/101'/2/0"), // WARN
      },
    },
    result:
      'addr1qwpug24twgud02405vncq9gmthq3r8e3a6l3855r8jpkgjnfwjwuljn5a0p37d4yvxevnte42mffrpmf4823vcdq62xqm8xq3j',
  },
  {
    testName: 'base address path/path multidelegation stake key usual',
    network: Networks.Testnet,
    addressParams: {
      type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/0'/0/1"),
        stakingPath: str_to_path("1852'/1815'/0'/2/60"),
      },
    },
    result:
      'addr_test1qpd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vl404mjsaz2xyzvegxxrpx5ltrjgy4qws4ataqtv5lp2h3q30eyjm',
  },
  {
    testName:
      'base address path/path multidelegation stake key unusual account',
    network: Networks.Fake,
    addressParams: {
      type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/0'/0/1"),
        stakingPath: str_to_path("1852'/1815'/101'/2/60"), // WARN
      },
    },
    result:
      'addr1qdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vmugd5zn06wnjkd3e4gz260kt832axwmcruch85mkpqnv2qzt38al',
  },
  {
    testName: 'base address path/path multidelegation stake key unusual index',
    network: Networks.Fake,
    addressParams: {
      type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/0'/0/1"),
        stakingPath: str_to_path("1852'/1815'/0'/2/1000001"), // WARN
      },
    },
    result:
      'addr1qdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63v7z7lu6g8ncaa9ksx9q5lg2676a59a93y6fv86qzzdx4k5qjp9hw2',
  },
  {
    testName: 'base address path/keyHash 1',
    network: Networks.Testnet,
    addressParams: {
      type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/0'/0/1"),
        stakingKeyHashHex:
          '1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c',
      },
    },
    result:
      'addr_test1qpd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwq9nnhk4',
  },
  {
    testName: 'base address path/keyHash 2',
    network: Networks.Fake,
    addressParams: {
      type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/0'/0/1"),
        stakingKeyHashHex:
          '122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277',
      },
    },
    result:
      'addr1qdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcj922xhxkn6twlq2wn4q50q352annk3903tj00h45mgfmswz93l5',
  },
  {
    testName: 'base address path/keyHash unusual account',
    network: Networks.Testnet,
    addressParams: {
      type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/101'/0/1"), // WARN
        stakingKeyHashHex:
          '1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c',
      },
    },
    result:
      'addr_test1qq6dcymepkghuyt0za9jxg5hn89art9y8yjcvhxclxdhndsayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwq9n0t8l',
  },
  {
    testName: 'base address path/keyHash unusual address index',
    network: Networks.Testnet,
    addressParams: {
      type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/0'/0/1'"), // WARN
        stakingKeyHashHex:
          '1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c',
      },
    },
    result:
      'addr_test1qppn39wu9az8zv5c6k59ke0j2udmjzy42uelpsjjcadf0fgayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwqelwlvz',
  },
  {
    testName: 'base address scriptHash/path',
    network: Networks.Fake,
    addressParams: {
      type: AddressType.BASE_PAYMENT_SCRIPT_STAKE_KEY,
      params: {
        spendingScriptHashHex:
          '122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277',
        stakingPath: str_to_path("1852'/1815'/0'/2/0"),
      },
    },
    result:
      'addr1zvfz49rtntfa9h0s98f6s28sg69weemgjhc4e8hm66d5yacayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwq8dxrpu',
  },
  {
    testName: 'base address scriptHash/path multidelegation',
    network: Networks.Fake,
    addressParams: {
      type: AddressType.BASE_PAYMENT_SCRIPT_STAKE_KEY,
      params: {
        spendingScriptHashHex:
          '122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277',
        stakingPath: str_to_path("1852'/1815'/0'/2/3"),
      },
    },
    result:
      'addr1zvfz49rtntfa9h0s98f6s28sg69weemgjhc4e8hm66d5yauc4nklr34kj8uk8kfgz3lkv6tu0ndr3x0rp3snqdayaxgqwrgxu2',
  },
  {
    testName: 'base address scriptHash/path unusual account',
    network: Networks.Testnet,
    addressParams: {
      type: AddressType.BASE_PAYMENT_SCRIPT_STAKE_KEY,
      params: {
        spendingScriptHashHex:
          '122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277',
        stakingPath: str_to_path("1852'/1815'/200'/2/0"), // WARN
      },
    },
    result:
      'addr_test1zqfz49rtntfa9h0s98f6s28sg69weemgjhc4e8hm66d5yaad7dqp9clvjdu902n5app3d70rnkax3wjy8n78fz29uhfqzs7q26',
  },
  {
    testName: 'base address path/scriptHash',
    network: Networks.Fake,
    addressParams: {
      type: AddressType.BASE_PAYMENT_KEY_STAKE_SCRIPT,
      params: {
        spendingPath: str_to_path("1852'/1815'/0'/0/1"),
        stakingScriptHashHex:
          '122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277',
      },
    },
    result:
      'addr1ydd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcj922xhxkn6twlq2wn4q50q352annk3903tj00h45mgfmssu7w24',
  },
  {
    testName: 'base address path/scriptHash unusual account',
    network: Networks.Testnet,
    addressParams: {
      type: AddressType.BASE_PAYMENT_KEY_STAKE_SCRIPT,
      params: {
        spendingPath: str_to_path("1852'/1815'/101'/0/1"), // WARN
        stakingScriptHashHex:
          '122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277',
      },
    },
    result:
      'addr_test1yq6dcymepkghuyt0za9jxg5hn89art9y8yjcvhxclxdhndsj922xhxkn6twlq2wn4q50q352annk3903tj00h45mgfmsc0du6n',
  },
  {
    testName: 'base address path/scriptHash unusual address index',
    network: Networks.Testnet,
    addressParams: {
      type: AddressType.BASE_PAYMENT_KEY_STAKE_SCRIPT,
      params: {
        spendingPath: str_to_path("1852'/1815'/0'/0/1'"), // WARN because hardened address
        stakingScriptHashHex:
          '122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277',
      },
    },
    result:
      'addr_test1yppn39wu9az8zv5c6k59ke0j2udmjzy42uelpsjjcadf0fgj922xhxkn6twlq2wn4q50q352annk3903tj00h45mgfmsyrvg3w',
  },
  {
    testName: 'base address scriptHash/scriptHash',
    network: Networks.Fake,
    addressParams: {
      type: AddressType.BASE_PAYMENT_SCRIPT_STAKE_SCRIPT,
      params: {
        spendingScriptHashHex:
          '122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277',
        stakingScriptHashHex:
          '122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277',
      },
    },
    result:
      'addr1xvfz49rtntfa9h0s98f6s28sg69weemgjhc4e8hm66d5yacj922xhxkn6twlq2wn4q50q352annk3903tj00h45mgfms63y5us',
  },
  {
    testName: 'enterprise path 1',
    network: Networks.Testnet,
    addressParams: {
      type: AddressType.ENTERPRISE_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/0'/0/1"),
      },
    },
    result: 'addr_test1vpd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vc7t2fks',
  },
  {
    testName: 'enterprise path 2',
    network: Networks.Fake,
    addressParams: {
      type: AddressType.ENTERPRISE_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/0'/0/1"),
      },
    },
    result: 'addr1vdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vc9wh7em',
  },
  {
    testName: 'enterprise path unusual account',
    network: Networks.Fake,
    addressParams: {
      type: AddressType.ENTERPRISE_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/101'/0/1"),
      },
    },
    result: 'addr1vv6dcymepkghuyt0za9jxg5hn89art9y8yjcvhxclxdhnds25ctky',
  },
  {
    testName: 'enterprise script 1',
    network: Networks.Testnet,
    addressParams: {
      type: AddressType.ENTERPRISE_SCRIPT,
      params: {
        spendingScriptHashHex:
          '122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277',
      },
    },
    result: 'addr_test1wqfz49rtntfa9h0s98f6s28sg69weemgjhc4e8hm66d5yacn4n6n2',
  },
  {
    testName: 'enterprise script 2',
    network: Networks.Fake,
    addressParams: {
      type: AddressType.ENTERPRISE_SCRIPT,
      params: {
        spendingScriptHashHex:
          '122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277',
      },
    },
    result: 'addr1wvfz49rtntfa9h0s98f6s28sg69weemgjhc4e8hm66d5yacgswdup',
  },
  {
    testName: 'pointer path 1',
    network: Networks.Testnet,
    addressParams: {
      type: AddressType.POINTER_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/0'/0/1"),
        stakingBlockchainPointer: Pointer(1, 2, 3),
      },
    },
    result:
      'addr_test1gpd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcpqgpsg6s2p6',
  },
  {
    testName: 'pointer path 2',
    network: Networks.Fake,
    addressParams: {
      type: AddressType.POINTER_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/0'/0/1"),
        stakingBlockchainPointer: Pointer(24157, 177, 42),
      },
    },
    result:
      'addr1gdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vuph3wczvf288aeyu',
  },
  {
    testName: 'pointer path 3',
    network: Networks.Fake,
    addressParams: {
      type: AddressType.POINTER_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/0'/0/1"),
        stakingBlockchainPointer: Pointer(0, 0, 0),
      },
    },
    result: 'addr1gdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcqqqqqnnd32q',
  },
  {
    testName: 'pointer address unusual account',
    network: Networks.Testnet,
    addressParams: {
      type: AddressType.POINTER_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/1000'/0/1"), // WARN
        stakingBlockchainPointer: Pointer(1, 0, 0),
      },
    },
    result:
      'addr_test1gq8vvh30wke6m5wl2xgwg5luus7zl0pr8kewjzq0wyyga6gpqqqqze3mqg',
  },
  {
    testName: 'pointer address unusual address index',
    network: Networks.Testnet,
    addressParams: {
      type: AddressType.POINTER_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/0'/0/1'"), // WARN
        stakingBlockchainPointer: Pointer(0, 7, 0),
      },
    },
    result:
      'addr_test1gppn39wu9az8zv5c6k59ke0j2udmjzy42uelpsjjcadf0fgqquqqpn6uug',
  },
  {
    testName: 'pointer script 1',
    network: Networks.Testnet,
    addressParams: {
      type: AddressType.POINTER_SCRIPT,
      params: {
        spendingScriptHashHex:
          '122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277',
        stakingBlockchainPointer: Pointer(1, 2, 3),
      },
    },
    result:
      'addr_test12qfz49rtntfa9h0s98f6s28sg69weemgjhc4e8hm66d5yacpqgpsrwzzw9',
  },
  {
    testName: 'pointer script 2',
    network: Networks.Fake,
    addressParams: {
      type: AddressType.POINTER_SCRIPT,
      params: {
        spendingScriptHashHex:
          '122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277',
        stakingBlockchainPointer: Pointer(24157, 177, 42),
      },
    },
    result:
      'addr12vfz49rtntfa9h0s98f6s28sg69weemgjhc4e8hm66d5yauph3wczvf2sykph7',
  },
  {
    testName: 'pointer script 3',
    network: Networks.Fake,
    addressParams: {
      type: AddressType.POINTER_SCRIPT,
      params: {
        spendingScriptHashHex:
          '122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277',
        stakingBlockchainPointer: Pointer(0, 0, 0),
      },
    },
    result: 'addr12vfz49rtntfa9h0s98f6s28sg69weemgjhc4e8hm66d5yacqqqqqc8le9l',
  },
  {
    testName: 'reward path 1',
    network: Networks.Testnet,
    addressParams: {
      type: AddressType.REWARD_KEY,
      params: {
        stakingPath: str_to_path("1852'/1815'/0'/2/0"),
      },
    },
    result: 'stake_test1uqwjy7h05jmhx9y3wzy94td6xz4txynuccgam0zfn800v8q8mmqwc',
  },
  {
    testName: 'reward path 2',
    network: Networks.Fake,
    addressParams: {
      type: AddressType.REWARD_KEY,
      params: {
        stakingPath: str_to_path("1852'/1815'/0'/2/0"),
      },
    },
    result: 'stake1uvwjy7h05jmhx9y3wzy94td6xz4txynuccgam0zfn800v8qqucf2t',
  },
  {
    testName: 'reward multidelegation usual',
    network: Networks.Testnet,
    addressParams: {
      type: AddressType.REWARD_KEY,
      params: {
        stakingPath: str_to_path("1852'/1815'/0'/2/1"),
      },
    },
    result: 'stake_test1uqktgr9psuz0fxggkx9ald8wu8kgpckr2d9kjfxrum6sm3qp87652',
  },
  {
    testName: 'reward multidelegation unusual account',
    network: Networks.Testnet,
    addressParams: {
      type: AddressType.REWARD_KEY,
      params: {
        stakingPath: str_to_path("1852'/1815'/101'/2/1"),
      },
    },
    result: 'stake_test1up0umv478zejdvynrddaddjzcztnmm2phsqs77cghyuah6qnjw5hh',
  },
  {
    testName: 'reward multidelegation unusual index',
    network: Networks.Testnet,
    addressParams: {
      type: AddressType.REWARD_KEY,
      params: {
        stakingPath: str_to_path("1852'/1815'/0'/2/20000000"),
      },
    },
    result: 'stake_test1urgn94qu0ewtt6f7l4sp6jm5vjv5u3gktevzy46s2qn92yshap4ze',
  },
  {
    testName: 'reward path unusual account',
    network: Networks.Fake,
    addressParams: {
      type: AddressType.REWARD_KEY,
      params: {
        stakingPath: str_to_path("1852'/1815'/300'/2/0"),
      },
    },
    result: 'stake1u08h6dxajsaatnakylrd4pdhfrv7z3lkzgsq60fhvejux0gpcrd2j',
  },
  {
    testName: 'reward script 1',
    network: Networks.Testnet,
    addressParams: {
      type: AddressType.REWARD_SCRIPT,
      params: {
        stakingScriptHashHex:
          '122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277',
      },
    },
    result: 'stake_test17qfz49rtntfa9h0s98f6s28sg69weemgjhc4e8hm66d5yacnadzyq',
  },
  {
    testName: 'reward script 2',
    network: Networks.Fake,
    addressParams: {
      type: AddressType.REWARD_SCRIPT,
      params: {
        stakingScriptHashHex:
          '122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277',
      },
    },
    result: 'stake17vfz49rtntfa9h0s98f6s28sg69weemgjhc4e8hm66d5yac56wtqn',
  },
]

type RejectTestCase = {
  testName: string
  network: Network
  addressParams: DeviceOwnedAddress
  errCls: new (...args: any[]) => ErrorBase
  errMsg: string
  unsupportedInAppXS?: boolean
}

const rejectTestCaseBase = {
  network: Networks.Mainnet,
  errCls: DeviceStatusError,
  errMsg: DeviceStatusMessages[DeviceStatusCodes.ERR_REJECTED_BY_POLICY],
}

export const rejectTestCases: RejectTestCase[] = [
  {
    testName: 'path too short',
    ...rejectTestCaseBase,
    addressParams: {
      type: AddressType.BYRON,
      params: {
        spendingPath: str_to_path("44'/1815'/1'"),
      },
    },
    unsupportedInAppXS: true,
  },
  {
    testName: 'invalid path',
    ...rejectTestCaseBase,
    addressParams: {
      type: AddressType.BYRON,
      params: {
        spendingPath: str_to_path("44'/1815'/1'/5/10'"),
      },
    },
    unsupportedInAppXS: true,
  },
  {
    testName: 'Byron with Shelley path',
    ...rejectTestCaseBase,
    addressParams: {
      type: AddressType.BYRON,
      params: {
        spendingPath: str_to_path("1852'/1815'/1'/0/10"),
      },
    },
    unsupportedInAppXS: true,
  },
  {
    testName: 'base key/key with Byron spending path',
    ...rejectTestCaseBase,
    addressParams: {
      type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
      params: {
        spendingPath: str_to_path("44'/1815'/1'/0/1"),
        stakingPath: str_to_path("1852'/1815'/1'/2/0"),
      },
    },
  },
  {
    testName: 'base key/key with wrong spending path',
    ...rejectTestCaseBase,
    addressParams: {
      type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/1'/2/0"),
        stakingPath: str_to_path("1852'/1815'/1'/2/0"),
      },
    },
  },
  {
    testName: 'base key/key with wrong staking path 1',
    ...rejectTestCaseBase,
    addressParams: {
      type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/1'/0/0"),
        stakingPath: str_to_path("1852'/1815'/1'/0/1"),
      },
    },
  },
  {
    testName: 'base key/script with Byron spending path',
    ...rejectTestCaseBase,
    addressParams: {
      type: AddressType.BASE_PAYMENT_KEY_STAKE_SCRIPT,
      params: {
        spendingPath: str_to_path("44'/1815'/1'/0/1"),
        stakingScriptHashHex:
          '222a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277',
      },
    },
  },
  {
    testName: 'base address scripthash/keyhash not allowed',
    ...rejectTestCaseBase,
    addressParams: {
      type: AddressType.BASE_PAYMENT_SCRIPT_STAKE_KEY,
      params: {
        spendingScriptHashHex:
          '122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277',
        stakingKeyHashHex:
          '222a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277',
      },
    },
  },
  {
    testName: 'pointer with Byron spending path',
    ...rejectTestCaseBase,
    addressParams: {
      type: AddressType.POINTER_KEY,
      params: {
        spendingPath: str_to_path("44'/1815'/1'/0/0"),
        stakingBlockchainPointer: Pointer(1, 2, 3),
      },
    },
  },
  {
    testName: 'pointer with wrong spending path',
    ...rejectTestCaseBase,
    addressParams: {
      type: AddressType.POINTER_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/1'/2/0"),
        stakingBlockchainPointer: Pointer(1, 2, 3),
      },
    },
  },
  {
    testName: 'enterprise with Byron spending path',
    ...rejectTestCaseBase,
    addressParams: {
      type: AddressType.ENTERPRISE_KEY,
      params: {
        spendingPath: str_to_path("44'/1815'/1'/0/0"),
      },
    },
  },
  {
    testName: 'enterprise with wrong spending path',
    ...rejectTestCaseBase,
    addressParams: {
      type: AddressType.ENTERPRISE_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/1'/2/0"),
      },
    },
  },
]
