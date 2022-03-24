import type { DeviceOwnedAddress, ErrorBase, Network } from "../../../src/Ada"
import { DeviceStatusCodes, DeviceStatusMessages } from "../../../src/Ada"
import { DeviceStatusError } from "../../../src/Ada"
import { AddressType } from "../../../src/Ada"
import { str_to_path } from "../../../src/utils/address"
import { Networks } from "../../test_utils"

type ByronTestcase = {
    testname: string;
    network: Network;
    addressParams: DeviceOwnedAddress;
    result: string;
}

export const byronTestcases: ByronTestcase[] = [
    // Mainnet
    {
        testname: "mainnet 1",
        network: Networks.Mainnet,
        addressParams: {
            type: AddressType.BYRON,
            params: {
                spendingPath: str_to_path("44'/1815'/1'/0/55'"),
            },
        },
        result: "Ae2tdPwUPEZELF6oijm8VFmhWpujnNzyG2zCf4RxfhmWqQKHo2drRD5Uhah",
    },
    {
        testname: "mainnet 2",
        network: Networks.Mainnet,
        addressParams: {
            type: AddressType.BYRON,
            params: {
                spendingPath: str_to_path("44'/1815'/1'/0/12'"),
            },
        },
        result: "Ae2tdPwUPEYyiPZzoMSN9GJMNZnn3S6ZAErrezee9s1bH6tjaX6m9Cyf3Wy",
    },
    // Testnet
    {
        testname: "testnet 1",
        network: Networks.Testnet,
        addressParams: {
            type: AddressType.BYRON,
            params: {
                spendingPath: str_to_path("44'/1815'/1'/0/12'"),
            },
        },
        result: "2657WMsDfac5GGdHMD6sR22tyhmFvuPrBZ79hvEvuisyUK9XCcB3nu8JecKuCXEkr",
    },
]

const Pointer = (blockIndex: number, txIndex: number, certificateIndex: number) => ({ blockIndex, txIndex, certificateIndex })

type ShelleyTestcase = {
    testname: string;
    network: Network;
    addressParams: DeviceOwnedAddress;
    result: string;
}
export const shelleyTestcases: ShelleyTestcase[] = [
    {
        testname: "base address path/path 1",
        network: Networks.Fake,
        addressParams: {
            type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
            params: {
                spendingPath: str_to_path("1852'/1815'/0'/0/1"),
                stakingPath: str_to_path("1852'/1815'/0'/2/0"),
            },
        },
        result: "addr1qdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwqdquehe",
    },
    {
        testname: "base address path/path 2",
        network: Networks.Testnet,
        addressParams: {
            type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
            params: {
                spendingPath: str_to_path("1852'/1815'/0'/0/1"),
                stakingPath: str_to_path("1852'/1815'/0'/2/0"),
            },
        },
        result: "addr_test1qpd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwq9nnhk4",
    },
    {
        testname: "base address path/path unusual spending path account",
        network: Networks.Fake,
        addressParams: {
            type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
            params: {
                spendingPath: str_to_path("1852'/1815'/101'/0/1"),
                stakingPath: str_to_path("1852'/1815'/0'/2/0"),
            },
        },
        result: "addr1qv6dcymepkghuyt0za9jxg5hn89art9y8yjcvhxclxdhndsayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwqdqq9xn",
    },
    {
        testname: "base address path/path unusual spending path address index",
        network: Networks.Fake,
        addressParams: {
            type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
            params: {
                spendingPath: str_to_path("1852'/1815'/1'/0/1000001"),
                stakingPath: str_to_path("1852'/1815'/0'/2/0"),
            },
        },
        result: "addr1q08rwk27cdm6vcp272pqcwq3t3gzea0q5xws2z84zzejrkcayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwq2cxp3q",
    },
    // TODO check for warning cases in security policies --- we don't have them covered by tests apparently, at least not for addresses, where we don't have reject tests either?
    {
        testname: "base address path/path unusual staking path account",
        network: Networks.Fake,
        addressParams: {
            type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
            params: {
                spendingPath: str_to_path("1852'/1815'/0'/0/1"),
                stakingPath: str_to_path("1852'/1815'/101'/2/0"),
            },
        },
        result: "addr1qdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vmfwjwuljn5a0p37d4yvxevnte42mffrpmf4823vcdq62xq3kdpkj",
    },
    {
        testname: "base address path/keyHash 1",
        network: Networks.Testnet,
        addressParams: {
            type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
            params: {
                spendingPath: str_to_path("1852'/1815'/0'/0/1"),
                stakingKeyHashHex:
                    "1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c",
            },
        },
        result: "addr_test1qpd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwq9nnhk4",
    },
    {
        testname: "base address path/keyHash 2",
        network: Networks.Fake,
        addressParams: {
            type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
            params: {
                spendingPath: str_to_path("1852'/1815'/0'/0/1"),
                stakingKeyHashHex:
                    "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
            },
        },
        result: "addr1qdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcj922xhxkn6twlq2wn4q50q352annk3903tj00h45mgfmswz93l5",
    },
    {
        testname: "base address scriptHash/path",
        network: Networks.Fake,
        addressParams: {
            type: AddressType.BASE_PAYMENT_SCRIPT_STAKE_KEY,
            params: {
                spendingScriptHashHex: "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
                stakingPath: str_to_path("1852'/1815'/0'/2/0"),
            },
        },
        result: "addr1zvfz49rtntfa9h0s98f6s28sg69weemgjhc4e8hm66d5yacayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwq8dxrpu",
    },
    {
        testname: "base address path/scriptHash",
        network: Networks.Fake,
        addressParams: {
            type: AddressType.BASE_PAYMENT_KEY_STAKE_SCRIPT,
            params: {
                spendingPath: str_to_path("1852'/1815'/0'/0/1"),
                stakingScriptHashHex: "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
            },
        },
        result: "addr1ydd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcj922xhxkn6twlq2wn4q50q352annk3903tj00h45mgfmssu7w24",
    },
    {
        testname: "base address scriptHash/scriptHash",
        network: Networks.Fake,
        addressParams: {
            type: AddressType.BASE_PAYMENT_SCRIPT_STAKE_SCRIPT,
            params: {
                spendingScriptHashHex: "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
                stakingScriptHashHex: "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
            },
        },
        result: "addr1xvfz49rtntfa9h0s98f6s28sg69weemgjhc4e8hm66d5yacj922xhxkn6twlq2wn4q50q352annk3903tj00h45mgfms63y5us",
    },
    {
        testname: "enterprise path 1",
        network: Networks.Testnet,
        addressParams: {
            type: AddressType.ENTERPRISE_KEY,
            params: {
                spendingPath: str_to_path("1852'/1815'/0'/0/1"),
            },
        },
        result: "addr_test1vpd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vc7t2fks",
    },
    {
        testname: "enterprise path 2",
        network: Networks.Fake,
        addressParams: {
            type: AddressType.ENTERPRISE_KEY,
            params: {
                spendingPath: str_to_path("1852'/1815'/0'/0/1"),
            },
        },
        result: "addr1vdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vc9wh7em",
    },
    {
        testname: "enterprise script 1",
        network: Networks.Testnet,
        addressParams: {
            type: AddressType.ENTERPRISE_SCRIPT,
            params: {
                spendingScriptHashHex: "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
            },
        },
        result: "addr_test1wqfz49rtntfa9h0s98f6s28sg69weemgjhc4e8hm66d5yacn4n6n2",
    },
    {
        testname: "enterprise script 2",
        network: Networks.Fake,
        addressParams: {
            type: AddressType.ENTERPRISE_SCRIPT,
            params: {
                spendingScriptHashHex: "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
            },
        },
        result: "addr1wvfz49rtntfa9h0s98f6s28sg69weemgjhc4e8hm66d5yacgswdup",
    },
    {
        testname: "pointer path 1",
        network: Networks.Testnet,
        addressParams: {
            type: AddressType.POINTER_KEY,
            params: {
                spendingPath: str_to_path("1852'/1815'/0'/0/1"),
                stakingBlockchainPointer: Pointer(1, 2, 3),
            },
        },
        result: "addr_test1gpd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcpqgpsg6s2p6",
    },
    {
        testname: "pointer path 2",
        network: Networks.Fake,
        addressParams: {
            type: AddressType.POINTER_KEY,
            params: {
                spendingPath: str_to_path("1852'/1815'/0'/0/1"),
                stakingBlockchainPointer: Pointer(24157, 177, 42),
            },
        },
        result: "addr1gdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vuph3wczvf288aeyu",
    },
    {
        testname: "pointer path 3",
        network: Networks.Fake,
        addressParams: {
            type: AddressType.POINTER_KEY,
            params: {
                spendingPath: str_to_path("1852'/1815'/0'/0/1"),
                stakingBlockchainPointer: Pointer(0, 0, 0),
            },
        },
        result: "addr1gdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcqqqqqnnd32q",
    },
    {
        testname: "pointer script 1",
        network: Networks.Testnet,
        addressParams: {
            type: AddressType.POINTER_SCRIPT,
            params: {
                spendingScriptHashHex: "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
                stakingBlockchainPointer: Pointer(1, 2, 3),
            },
        },
        result: "addr_test12qfz49rtntfa9h0s98f6s28sg69weemgjhc4e8hm66d5yacpqgpsrwzzw9",
    },
    {
        testname: "pointer script 2",
        network: Networks.Fake,
        addressParams: {
            type: AddressType.POINTER_SCRIPT,
            params: {
                spendingScriptHashHex: "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
                stakingBlockchainPointer: Pointer(24157, 177, 42),
            },
        },
        result: "addr12vfz49rtntfa9h0s98f6s28sg69weemgjhc4e8hm66d5yauph3wczvf2sykph7",
    },
    {
        testname: "pointer script 3",
        network: Networks.Fake,
        addressParams: {
            type: AddressType.POINTER_SCRIPT,
            params: {
                spendingScriptHashHex: "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
                stakingBlockchainPointer: Pointer(0, 0, 0),
            },
        },
        result: "addr12vfz49rtntfa9h0s98f6s28sg69weemgjhc4e8hm66d5yacqqqqqc8le9l",
    },
    {
        testname: "reward path 1",
        network: Networks.Testnet,
        addressParams: {
            type: AddressType.REWARD_KEY,
            params: {
                stakingPath: str_to_path("1852'/1815'/0'/2/0"),
            },
        },
        result: "stake_test1uqwjy7h05jmhx9y3wzy94td6xz4txynuccgam0zfn800v8q8mmqwc",
    },
    {
        testname: "reward path 2",
        network: Networks.Fake,
        addressParams: {
            type: AddressType.REWARD_KEY,
            params: {
                stakingPath: str_to_path("1852'/1815'/0'/2/0"),
            },
        },
        result: "stake1uvwjy7h05jmhx9y3wzy94td6xz4txynuccgam0zfn800v8qqucf2t",
    },
    {
        testname: "reward script 1",
        network: Networks.Testnet,
        addressParams: {
            type: AddressType.REWARD_SCRIPT,
            params: {
                stakingScriptHashHex: "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
            },
        },
        result: "stake_test17qfz49rtntfa9h0s98f6s28sg69weemgjhc4e8hm66d5yacnadzyq",
    },
    {
        testname: "reward script 2",
        network: Networks.Fake,
        addressParams: {
            type: AddressType.REWARD_SCRIPT,
            params: {
                stakingScriptHashHex: "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
            },
        },
        result: "stake17vfz49rtntfa9h0s98f6s28sg69weemgjhc4e8hm66d5yac56wtqn",
    },
]


type InvalidPathTestcase = {
    testname: string;
    network: Network;
    addressParams: DeviceOwnedAddress;
    errCls: new (...args: any[]) => ErrorBase;
    errMsg: string;
}

export const InvalidPathTestcases: InvalidPathTestcase[] = [
    {
        testname: "too short (address)",
        network: Networks.Fake,
        addressParams: {
            type: AddressType.BYRON,
            params: {
                spendingPath: str_to_path("44'/1815'/1'"),
            },
        },
        errCls: DeviceStatusError,
        errMsg: DeviceStatusMessages[DeviceStatusCodes.ERR_REJECTED_BY_POLICY],
    },
    {
        testname: "invalid path",
        network: Networks.Fake,
        addressParams: {
            type: AddressType.BYRON,
            params: {
                spendingPath: str_to_path("44'/1815'/1'/5/10'"),
            },
        },
        errCls: DeviceStatusError,
        errMsg: DeviceStatusMessages[DeviceStatusCodes.ERR_REJECTED_BY_POLICY],
    },
]
