import type { DeviceOwnedAddress, Network } from "../../../src/Ada";
import { AddressType } from "../../../src/Ada";
import { str_to_path } from "../../../src/utils/address";
import { Networks, } from "../../test_utils";


export const byronTestcases: Array<{ network: Network, path: string, address: string }> = [
    // Mainnet
    {
        network: Networks.Mainnet,
        path: "44'/1815'/1'/0/55'",
        address: "Ae2tdPwUPEZELF6oijm8VFmhWpujnNzyG2zCf4RxfhmWqQKHo2drRD5Uhah",
    },
    {
        network: Networks.Mainnet,
        path: "44'/1815'/1'/0/12'",
        address: "Ae2tdPwUPEYyiPZzoMSN9GJMNZnn3S6ZAErrezee9s1bH6tjaX6m9Cyf3Wy",
    },
    // Testnet
    {
        network: Networks.Testnet,
        path: "44'/1815'/1'/0/12'",
        address: "2657WMsDfac5GGdHMD6sR22tyhmFvuPrBZ79hvEvuisyUK9XCcB3nu8JecKuCXEkr",
    },
]

const Pointer = (blockIndex: number, txIndex: number, certificateIndex: number) => ({ blockIndex, txIndex, certificateIndex })
export const shelleyTestcases: Record<string, Array<[Network, DeviceOwnedAddress, string]>> = {
    "base address": [
        [
            Networks.Fake,
            {
                type: AddressType.BASE,
                params: {
                    spendingPath: str_to_path("1852'/1815'/0'/0/1"),
                    stakingPath: str_to_path("1852'/1815'/0'/2/0"),
                }
            },
            "addr1qdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwqdquehe",
        ],
        [
            Networks.Testnet,
            {
                type: AddressType.BASE,
                params: {
                    spendingPath: str_to_path("1852'/1815'/0'/0/1"),
                    stakingPath: str_to_path("1852'/1815'/0'/2/0"),
                }
            },
            "addr_test1qpd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwq9nnhk4",
        ],
    ], "base with 3rd party staking key": [
        [
            Networks.Testnet,
            {
                type: AddressType.BASE,
                params: {
                    spendingPath: str_to_path("1852'/1815'/0'/0/1"),
                    stakingKeyHashHex:
                        "1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c",
                }
            },
            "addr_test1qpd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwq9nnhk4",
        ],
        [
            Networks.Fake,
            {
                type: AddressType.BASE,
                params: {
                    spendingPath: str_to_path("1852'/1815'/0'/0/1"),
                    stakingKeyHashHex:
                        "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
                }
            },
            "addr1qdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcj922xhxkn6twlq2wn4q50q352annk3903tj00h45mgfmswz93l5",
        ],
    ],
    "enterprise": [[
        Networks.Testnet,
        {
            type: AddressType.ENTERPRISE,
            params: {
                spendingPath: str_to_path("1852'/1815'/0'/0/1"),
            }
        },
        "addr_test1vpd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vc7t2fks",
    ],
    [
        Networks.Fake,
        {
            type: AddressType.ENTERPRISE,
            params: {
                spendingPath: str_to_path("1852'/1815'/0'/0/1"),
            }
        },
        "addr1vdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vc9wh7em",
    ],
    ],
    "pointer": [
        [
            Networks.Testnet,
            {
                type: AddressType.POINTER,
                params: {
                    spendingPath: str_to_path("1852'/1815'/0'/0/1"),
                    stakingBlockchainPointer: Pointer(1, 2, 3),
                }
            },
            "addr_test1gpd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcpqgpsg6s2p6",
        ],
        [
            Networks.Fake,
            {
                type: AddressType.POINTER,
                params: {
                    spendingPath: str_to_path("1852'/1815'/0'/0/1"),
                    stakingBlockchainPointer: Pointer(24157, 177, 42),
                }
            },
            "addr1gdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vuph3wczvf288aeyu",
        ],
        [
            Networks.Fake,
            {
                type: AddressType.POINTER,
                params: {
                    spendingPath: str_to_path("1852'/1815'/0'/0/1"),
                    stakingBlockchainPointer: Pointer(0, 0, 0),
                }
            },
            "addr1gdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcqqqqqnnd32q",
        ],
    ],
    "reward": [
        [
            Networks.Testnet,
            {
                type: AddressType.REWARD,
                params: {
                    spendingPath: str_to_path("1852'/1815'/0'/2/0"),
                }
            },
            "stake_test1uqwjy7h05jmhx9y3wzy94td6xz4txynuccgam0zfn800v8q8mmqwc",
        ],
        [
            Networks.Fake,
            {
                type: AddressType.REWARD,
                params: {
                    spendingPath: str_to_path("1852'/1815'/0'/2/0"),
                }
            },
            "stake1uvwjy7h05jmhx9y3wzy94td6xz4txynuccgam0zfn800v8qqucf2t",
        ],
    ]
};
