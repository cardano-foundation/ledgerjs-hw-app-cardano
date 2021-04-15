import type { DeviceOwnedAddress, ErrorBase, Network } from "../../../src/Ada";
import { DeviceStatusError } from "../../../src/Ada";
import { AddressType } from "../../../src/Ada";
import { str_to_path } from "../../../src/utils/address";
import { Networks, } from "../../test_utils";

type ByronTestcase = {
    testname: string,
    network: Network,
    addressParams: DeviceOwnedAddress,
    result: string
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
    testname: string,
    network: Network,
    addressParams: DeviceOwnedAddress,
    result: string
}
export const shelleyTestcases: ShelleyTestcase[] = [
    {
        testname: "base address 1",
        network: Networks.Fake,
        addressParams: {
            type: AddressType.BASE,
            params: {
                spendingPath: str_to_path("1852'/1815'/0'/0/1"),
                stakingPath: str_to_path("1852'/1815'/0'/2/0"),
            }
        },
        result: "addr1qdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwqdquehe",
    },
    {
        testname: "base address 2",
        network: Networks.Testnet,
        addressParams: {
            type: AddressType.BASE,
            params: {
                spendingPath: str_to_path("1852'/1815'/0'/0/1"),
                stakingPath: str_to_path("1852'/1815'/0'/2/0"),
            }
        },
        result: "addr_test1qpd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwq9nnhk4",
    },
    {
        testname: "base with 3rd party staking key 1",
        network: Networks.Testnet,
        addressParams: {
            type: AddressType.BASE,
            params: {
                spendingPath: str_to_path("1852'/1815'/0'/0/1"),
                stakingKeyHashHex:
                    "1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c",
            }
        },
        result: "addr_test1qpd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwq9nnhk4",
    },
    {
        testname: "base with 3rd party staking key 2",
        network: Networks.Fake,
        addressParams: {
            type: AddressType.BASE,
            params: {
                spendingPath: str_to_path("1852'/1815'/0'/0/1"),
                stakingKeyHashHex:
                    "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
            }
        },
        result: "addr1qdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcj922xhxkn6twlq2wn4q50q352annk3903tj00h45mgfmswz93l5",
    },
    {
        testname: "enterprise 1",
        network: Networks.Testnet,
        addressParams: {
            type: AddressType.ENTERPRISE,
            params: {
                spendingPath: str_to_path("1852'/1815'/0'/0/1"),
            }
        },
        result: "addr_test1vpd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vc7t2fks",
    },
    {
        testname: "enterprise 2",
        network: Networks.Fake,
        addressParams: {
            type: AddressType.ENTERPRISE,
            params: {
                spendingPath: str_to_path("1852'/1815'/0'/0/1"),
            }
        },
        result: "addr1vdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vc9wh7em",
    },
    {
        testname: "pointer 1",
        network: Networks.Testnet,
        addressParams: {
            type: AddressType.POINTER,
            params: {
                spendingPath: str_to_path("1852'/1815'/0'/0/1"),
                stakingBlockchainPointer: Pointer(1, 2, 3),
            }
        },
        result: "addr_test1gpd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcpqgpsg6s2p6",
    },
    {
        testname: "pointer 2",
        network: Networks.Fake,
        addressParams: {
            type: AddressType.POINTER,
            params: {
                spendingPath: str_to_path("1852'/1815'/0'/0/1"),
                stakingBlockchainPointer: Pointer(24157, 177, 42),
            }
        },
        result: "addr1gdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vuph3wczvf288aeyu",
    },
    {
        testname: "pointer 3",
        network: Networks.Fake,
        addressParams: {
            type: AddressType.POINTER,
            params: {
                spendingPath: str_to_path("1852'/1815'/0'/0/1"),
                stakingBlockchainPointer: Pointer(0, 0, 0),
            }
        },
        result: "addr1gdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcqqqqqnnd32q",
    },
    {
        testname: "reward 1",
        network: Networks.Testnet,
        addressParams: {
            type: AddressType.REWARD,
            params: {
                stakingPath: str_to_path("1852'/1815'/0'/2/0"),
            }
        },
        result: "stake_test1uqwjy7h05jmhx9y3wzy94td6xz4txynuccgam0zfn800v8q8mmqwc",
    },
    {
        testname: "reward 2",
        network: Networks.Fake,
        addressParams: {
            type: AddressType.REWARD,
            params: {
                stakingPath: str_to_path("1852'/1815'/0'/2/0"),
            }
        },
        result: "stake1uvwjy7h05jmhx9y3wzy94td6xz4txynuccgam0zfn800v8qqucf2t",
    }
]


type InvalidPathTestcase = {
    testname: string,
    network: Network,
    addressParams: DeviceOwnedAddress,
    errCls: new (...args: any[]) => ErrorBase,
    errMsg: string,
}

export const InvalidPathTestcases: InvalidPathTestcase[] = [
    {
        testname: "too short (address)",
        network: Networks.Fake,
        addressParams: {
            type: AddressType.BYRON,
            params: {
                spendingPath: str_to_path("44'/1815'/1'")
            }
        },
        errCls: DeviceStatusError,
        errMsg: "Action rejected by Ledger's security policy"
    },
    {
        testname: "invalid path",
        network: Networks.Fake,
        addressParams: {
            type: AddressType.BYRON,
            params: {
                spendingPath: str_to_path("44'/1815'/1'/5/10'")
            }
        },
        errCls: DeviceStatusError,
        errMsg: "Action rejected by Ledger's security policy"
    }
]
