import type {Transaction} from '../../../src/Ada'
import {
  CertificateType,
  DeviceStatusError,
  InvalidData,
  InvalidDataReason,
  Networks,
  AddressType,
  TxOutputDestinationType,
  TxRequiredSignerType,
} from '../../../src/Ada'
import {
  StatusWordV7,
  StatusWordV8,
  StatusWordMsgV7,
  StatusWordMsgV8,
} from '../../../src/errors/deviceStatusError'
import type {
  BIP32Path,
  Network,
  PoolRegistrationParams,
  PoolRetirementParams,
  StakeDelegationParams,
  StakeDeregistrationParams,
  StakeRegistrationParams,
  VoteOption,
} from '../../../src/types/public'
import {
  PoolKeyType,
  PoolOwnerType,
  PoolRewardAccountType,
  CredentialParamsType,
  TransactionSigningMode,
  VoterType,
} from '../../../src/types/public'
import {str_to_path} from '../../../src/utils/address'
import {bech32_to_hex, DoNotRunOnLedger} from '../../test_utils'
import type {AppVersionOverride, RejectError} from '../../test_utils'
import {
  destinations,
  inputs,
  mainnetFeeTtl,
  mints,
  outputs,
  shelleyBase,
} from './txElements'

export type TestCaseRejectShelley = {
  testName: string
  tx: Transaction
  signingMode: TransactionSigningMode
  additionalWitnessPaths?: BIP32Path[]
  err?: {v7: RejectError; v8: RejectError}
  rejectReason: InvalidDataReason
  appVersion?: AppVersionOverride
}

const poolRegParamOwner: PoolRegistrationParams = {
  poolKey: {
    type: PoolKeyType.THIRD_PARTY,
    params: {
      keyHashHex: '01234567890123456789012345678901234567890123456789012345',
    },
  },
  vrfKeyHashHex:
    '0123456789012345678901234567890123456789012345678901234567890123',
  pledge: 0,
  cost: 0,
  margin: {
    numerator: 0,
    denominator: 1,
  },
  rewardAccount: {
    type: PoolRewardAccountType.THIRD_PARTY,
    params: {
      rewardAccountHex:
        'f123456789012345678901234567890123456789012345678901234567',
    },
  },
  poolOwners: [
    {
      type: PoolOwnerType.DEVICE_OWNED,
      params: {
        stakingPath: str_to_path("1852'/1815'/0'/2/0"),
      },
    },
  ],
  relays: [],
}

const poolRegParamOperator: PoolRegistrationParams = {
  poolKey: {
    type: PoolKeyType.DEVICE_OWNED,
    params: {
      path: str_to_path("1852'/1815'/0'/0/0"),
    },
  },
  vrfKeyHashHex:
    '0123456789012345678901234567890123456789012345678901234567890123',
  pledge: 0,
  cost: 0,
  margin: {
    numerator: 0,
    denominator: 1,
  },
  rewardAccount: {
    type: PoolRewardAccountType.THIRD_PARTY,
    params: {
      rewardAccountHex:
        'f123456789012345678901234567890123456789012345678901234567',
    },
  },
  poolOwners: [],
  relays: [],
}

const poolRetirementParam: PoolRetirementParams = {
  poolKeyPath: str_to_path("1853'/1815'/0'/1'"),
  retirementEpoch: 42,
}

const stakeRegistrationPathParam: StakeRegistrationParams = {
  stakeCredential: {
    type: CredentialParamsType.KEY_PATH,
    keyPath: str_to_path("1852'/1815'/0'/2/0"),
  },
}

const stakeRegistrationScriptHashParam: StakeRegistrationParams = {
  stakeCredential: {
    type: CredentialParamsType.SCRIPT_HASH,
    scriptHashHex: '29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd',
  },
}

const stakeDeregistrationParam: StakeDeregistrationParams = {
  stakeCredential: {
    type: CredentialParamsType.KEY_PATH,
    keyPath: str_to_path("1852'/1815'/0'/2/0"),
  },
}

const stakeDelegationParam: StakeDelegationParams = {
  stakeCredential: {
    type: CredentialParamsType.KEY_PATH,
    keyPath: str_to_path("1852'/1815'/0'/2/0"),
  },
  poolKeyHashHex: '',
}

export const transactionInitRejectTestCases: TestCaseRejectShelley[] = [
  {
    testName: 'Non_mainnet_protocol_magic',
    tx: {
      ...shelleyBase,
      network: {
        networkId: 0x01,
        protocolMagic: 764824072,
      } as Network,
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV8[StatusWordV8.SWO_INVALID_PROTOCOL_MAGIC],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Invalid_network_id',
    tx: {
      ...shelleyBase,
      network: {
        networkId: 0x10,
        protocolMagic: 764824073,
      } as Network,
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_INVALID_DATA],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV8[StatusWordV8.SWO_INVALID_NETWORK_ID],
      },
    },
    rejectReason: InvalidDataReason.NETWORK_INVALID_NETWORK_ID,
  },
  {
    testName: 'Pool_registration_operator_too_few_certificates',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      certificates: [],
    },
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_POOL_OPERATOR__SINGLE_POOL_REG_CERTIFICATE_REQUIRED,
  },
  {
    testName: 'Pool_registration_owner_too_few_certificates',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      inputs: [inputs.utxoMultisig],
      certificates: [],
    },
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_POOL_OWNER__SINGLE_POOL_REG_CERTIFICATE_REQUIRED,
  },
  {
    testName: 'Pool_registration_operator_too_many_certificates',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOperator,
        },
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOperator,
        },
      ],
    },
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_POOL_OPERATOR__SINGLE_POOL_REG_CERTIFICATE_REQUIRED,
  },
  {
    testName: 'Pool_registration_owner_too_many_certificates',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      inputs: [inputs.utxoMultisig],
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOwner,
        },
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOwner,
        },
      ],
    },
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_POOL_OWNER__SINGLE_POOL_REG_CERTIFICATE_REQUIRED,
  },
  {
    testName: 'Pool_registration_operator_too_many_withdrawals',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOperator,
        },
      ],
      withdrawals: [
        {
          stakeCredential: {
            type: CredentialParamsType.SCRIPT_HASH,
            scriptHashHex:
              '29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd',
          },
          amount: 1000,
        },
      ],
    },
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_POOL_OPERATOR__WITHDRAWALS_NOT_ALLOWED,
  },
  {
    testName: 'Pool_registration_owner_too_many_withdrawals',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      inputs: [inputs.utxoMultisig],
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOwner,
        },
      ],
      withdrawals: [
        {
          stakeCredential: {
            type: CredentialParamsType.SCRIPT_HASH,
            scriptHashHex:
              '29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd',
          },
          amount: 1000,
        },
      ],
    },
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_POOL_OWNER__WITHDRAWALS_NOT_ALLOWED,
  },
  {
    testName: 'Pool_registration_operator_mint_included',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOperator,
        },
      ],
      mint: [
        {
          policyIdHex:
            '0d63e8d2c5a00cbcffbdf9112487c443466e1ea7d8c834df5ac5c425',
          tokens: [
            {
              assetNameHex: '75657374436f696e',
              amount: -7878754,
            },
          ],
        },
      ],
    },
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.SIGN_MODE_POOL_OPERATOR__MINT_NOT_ALLOWED,
  },
  {
    testName: 'Pool_registration_owner_mint_included',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      inputs: [inputs.utxoMultisig],
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOwner,
        },
      ],
      mint: [
        {
          policyIdHex:
            '0d63e8d2c5a00cbcffbdf9112487c443466e1ea7d8c834df5ac5c425',
          tokens: [
            {
              assetNameHex: '75657374436f696e',
              amount: -7878754,
            },
          ],
        },
      ],
    },
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.SIGN_MODE_POOL_OWNER__MINT_NOT_ALLOWED,
  },
  // collateral inputs
  {
    testName: 'Ordinary_tx_collateral_inputs_included',
    tx: {
      ...shelleyBase,
      collateralInputs: [inputs.utxoShelley],
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_ORDINARY__COLLATERAL_INPUTS_NOT_ALLOWED,
  },
  {
    testName: 'Multisig_tx_collateral_inputs_included',
    tx: {
      ...shelleyBase,
      collateralInputs: [inputs.utxoShelley],
    },
    signingMode: TransactionSigningMode.MULTISIG_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_MULTISIG__COLLATERAL_INPUTS_NOT_ALLOWED,
  },
  {
    testName: 'Pool_registration_operator_collateral_inputs_included',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOperator,
        },
      ],
      collateralInputs: [inputs.utxoShelley],
    },
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_POOL_OPERATOR__COLLATERAL_INPUTS_NOT_ALLOWED,
  },
  {
    testName: 'Pool_registration_owner_collateral_inputs_included',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      inputs: [inputs.utxoMultisig],
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOwner,
        },
      ],
      collateralInputs: [inputs.utxoShelley],
    },
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_POOL_OWNER__COLLATERAL_INPUTS_NOT_ALLOWED,
  },
  // required signers
  {
    testName: 'Pool_registration_operator_required_signers_included',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOperator,
        },
      ],
      requiredSigners: [
        {
          type: TxRequiredSignerType.PATH,
          path: str_to_path("1852'/1815'/0'/0/0"),
        },
      ],
    },
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_POOL_OPERATOR__REQUIRED_SIGNERS_NOT_ALLOWED,
  },
  {
    testName: 'Pool_registration_owner_required_signers_included',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      inputs: [inputs.utxoMultisig],
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOwner,
        },
      ],
      requiredSigners: [
        {
          type: TxRequiredSignerType.PATH,
          path: str_to_path("1852'/1815'/0'/0/0"),
        },
      ],
    },
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_POOL_OWNER__REQUIRED_SIGNERS_NOT_ALLOWED,
  },
  // collateral return output included
  {
    testName: 'Ordinary_tx_collateral_output_included',
    tx: {
      ...shelleyBase,
      collateralOutput: outputs.externalShelleyBaseKeyhashKeyhash,
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_ORDINARY__COLLATERAL_OUTPUT_NOT_ALLOWED,
  },
  {
    testName: 'Multisig_tx_collateral_output_included',
    tx: {
      ...shelleyBase,
      collateralOutput: outputs.externalShelleyBaseKeyhashKeyhash,
    },
    signingMode: TransactionSigningMode.MULTISIG_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_MULTISIG__COLLATERAL_OUTPUT_NOT_ALLOWED,
  },
  {
    testName: 'Pool_registration_operator_collateral_output_included',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOperator,
        },
      ],
      collateralOutput: outputs.externalShelleyBaseKeyhashKeyhash,
    },
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_POOL_OPERATOR__COLLATERAL_OUTPUT_NOT_ALLOWED,
  },
  {
    testName: 'Pool_registration_owner_collateral_output_included',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      inputs: [inputs.utxoMultisig],
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOwner,
        },
      ],
      collateralOutput: outputs.externalShelleyBaseKeyhashKeyhash,
    },
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_POOL_OWNER__COLLATERAL_OUTPUT_NOT_ALLOWED,
  },
  // total collateral included
  {
    testName: 'Ordinary_tx_total_collateral_included',
    tx: {
      ...shelleyBase,
      totalCollateral: 8,
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_ORDINARY__TOTAL_COLLATERAL_NOT_ALLOWED,
  },
  {
    testName: 'Multisig_tx_total_collateral_included',
    tx: {
      ...shelleyBase,
      totalCollateral: 8,
    },
    signingMode: TransactionSigningMode.MULTISIG_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_MULTISIG__TOTAL_COLLATERAL_NOT_ALLOWED,
  },
  {
    testName: 'Pool_registration_operator_total_collateral_included',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOperator,
        },
      ],
      totalCollateral: 8,
    },
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_POOL_OPERATOR__TOTAL_COLLATERAL_NOT_ALLOWED,
  },
  {
    testName: 'Pool_registration_owner_total_collateral_included',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      inputs: [inputs.utxoMultisig],
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOwner,
        },
      ],
      totalCollateral: 8,
    },
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_POOL_OWNER__TOTAL_COLLATERAL_NOT_ALLOWED,
  },
  // reference inputs included
  {
    testName: 'Ordinary_tx_reference_inputs_included',
    tx: {
      ...shelleyBase,
      referenceInputs: [inputs.utxoShelley],
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_ORDINARY__REFERENCE_INPUTS_NOT_ALLOWED,
  },
  {
    testName: 'Multisig_tx_reference_inputs_included',
    tx: {
      ...shelleyBase,
      referenceInputs: [inputs.utxoShelley],
    },
    signingMode: TransactionSigningMode.MULTISIG_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_MULTISIG__REFERENCE_INPUTS_NOT_ALLOWED,
  },
  {
    testName: 'Pool_registration_operator_reference_inputs_included',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOperator,
        },
      ],
      referenceInputs: [inputs.utxoShelley],
    },
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_POOL_OPERATOR__REFERENCE_INPUTS_NOT_ALLOWED,
  },
  {
    testName: 'Pool_registration_owner_reference_inputs_included',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      inputs: [inputs.utxoMultisig],
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOwner,
        },
      ],
      referenceInputs: [inputs.utxoShelley],
    },
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_POOL_OWNER__REFERENCE_INPUTS_NOT_ALLOWED,
  },
]

export const addressParamsRejectTestCases: TestCaseRejectShelley[] = [
  {
    testName: 'Reward_address_key',
    tx: {
      ...shelleyBase,
      outputs: [
        {
          amount: 10,
          destination: destinations.paymentKeyPath,
        },
      ],
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.OUTPUT_INVALID_ADDRESS_PARAMS,
  },
  {
    testName: 'Reward_address_script',
    tx: {
      ...shelleyBase,
      outputs: [
        {
          amount: 10,
          destination: destinations.paymentScriptHash,
        },
      ],
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.OUTPUT_INVALID_ADDRESS_PARAMS,
  },
  {
    testName: 'No_spending_path_Ordinary_Tx_1',
    tx: {
      ...shelleyBase,
      outputs: [
        {
          amount: 3003112,
          destination: {
            type: TxOutputDestinationType.DEVICE_OWNED,
            params: {
              type: AddressType.BASE_PAYMENT_SCRIPT_STAKE_KEY,
              params: {
                spendingScriptHashHex:
                  '29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd',
                stakingKeyHashHex:
                  '122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277',
              },
            },
          },
        },
      ],
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.OUTPUT_INVALID_ADDRESS_PARAMS,
  },
  {
    testName: 'No_spending_path_Ordinary_Tx_2',
    tx: {
      ...shelleyBase,
      outputs: [
        {
          amount: 3003112,
          destination: {
            type: TxOutputDestinationType.DEVICE_OWNED,
            params: {
              type: AddressType.BASE_PAYMENT_SCRIPT_STAKE_SCRIPT,
              params: {
                spendingScriptHashHex:
                  '29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd',
                stakingScriptHashHex:
                  '122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277',
              },
            },
          },
        },
      ],
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.OUTPUT_INVALID_ADDRESS_PARAMS,
  },
  {
    testName: 'Pool_operator_spending_choice_not_path',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      outputs: [
        {
          amount: 10,
          destination: {
            type: TxOutputDestinationType.DEVICE_OWNED,
            params: {
              type: AddressType.BASE_PAYMENT_SCRIPT_STAKE_KEY,
              params: {
                spendingScriptHashHex:
                  '122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277',
                stakingPath: str_to_path("1852'/1815'/456'/2/0"),
              },
            },
          },
        },
      ],
    },
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.OUTPUT_INVALID_ADDRESS_PARAMS,
  },
  {
    testName: 'Multisig_unconditionally',
    tx: {
      ...shelleyBase,
      outputs: [outputs.internalBaseWithStakingPath],
    },
    signingMode: TransactionSigningMode.MULTISIG_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_MULTISIG__DEVICE_OWNED_ADDRESS_NOT_ALLOWED,
  },
  {
    testName: 'Pool_owner_unconditionally',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      inputs: [inputs.utxoMultisig],
      outputs: [outputs.internalBaseWithStakingPath],
    },
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_POOL_OWNER__DEVICE_OWNED_ADDRESS_NOT_ALLOWED,
  },
]

export const certificateRejectTestCases: TestCaseRejectShelley[] = [
  {
    testName: 'Pool_registration_in_Ordinary_Tx',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOperator,
        },
      ],
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_ORDINARY__POOL_REGISTRATION_NOT_ALLOWED,
  },
  {
    testName: 'Pool_registration_in_Multisig_Tx',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOperator,
        },
      ],
    },
    signingMode: TransactionSigningMode.MULTISIG_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_MULTISIG__POOL_REGISTRATION_NOT_ALLOWED,
  },
  {
    testName: 'Pool_registration_in_Plutus_Tx',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOperator,
        },
      ],
    },
    signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_PLUTUS__POOL_REGISTRATION_NOT_ALLOWED,
  },
  {
    testName: 'Pool_retirement_in_Multisig_Tx',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      certificates: [
        {
          type: CertificateType.STAKE_POOL_RETIREMENT,
          params: poolRetirementParam,
        },
      ],
    },
    signingMode: TransactionSigningMode.MULTISIG_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_MULTISIG__POOL_RETIREMENT_NOT_ALLOWED,
  },
  // after this we can't really test the ledger policies from LedgerJS,
  // since we can't serialize the wrong type of certificate
  {
    testName: 'Stake_registration_in_Pool_Registration_Operator',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      certificates: [
        {
          type: CertificateType.STAKE_REGISTRATION,
          params: stakeRegistrationPathParam,
        },
      ],
    },
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR,
    err: {
      v7: {
        errCls: TypeError,
        errMsg: "Cannot read properties of undefined (reading 'poolKey')",
      },
      v8: {
        errCls: TypeError,
        errMsg: "Cannot read properties of undefined (reading 'poolKey')",
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_POOL_OPERATOR__SINGLE_POOL_REG_CERTIFICATE_REQUIRED,
  },
  {
    testName: 'Stake_registration_in_Pool_Registration_Owner',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      inputs: [],
      certificates: [
        {
          type: CertificateType.STAKE_REGISTRATION,
          params: stakeRegistrationPathParam,
        },
      ],
    },
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
    err: {
      v7: {
        errCls: TypeError,
        errMsg: "Cannot read properties of undefined (reading 'poolKey')",
      },
      v8: {
        errCls: TypeError,
        errMsg: "Cannot read properties of undefined (reading 'poolKey')",
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_POOL_OWNER__SINGLE_POOL_REG_CERTIFICATE_REQUIRED,
  },
  {
    testName: 'Stake_deregistration_in_Pool_Registration_Operator',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      certificates: [
        {
          type: CertificateType.STAKE_DEREGISTRATION,
          params: stakeDeregistrationParam,
        },
      ],
    },
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR,
    err: {
      v7: {
        errCls: TypeError,
        errMsg: "Cannot read properties of undefined (reading 'poolKey')",
      },
      v8: {
        errCls: TypeError,
        errMsg: "Cannot read properties of undefined (reading 'poolKey')",
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_POOL_OPERATOR__SINGLE_POOL_REG_CERTIFICATE_REQUIRED,
  },
  {
    testName: 'Stake_deregistration_in_Pool_Registration_Owner',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      inputs: [],
      certificates: [
        {
          type: CertificateType.STAKE_DEREGISTRATION,
          params: stakeDeregistrationParam,
        },
      ],
    },
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
    err: {
      v7: {
        errCls: TypeError,
        errMsg: "Cannot read properties of undefined (reading 'poolKey')",
      },
      v8: {
        errCls: TypeError,
        errMsg: "Cannot read properties of undefined (reading 'poolKey')",
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_POOL_OWNER__SINGLE_POOL_REG_CERTIFICATE_REQUIRED,
  },
  {
    testName: 'Stake_delegation_in_Pool_Registration_Operator',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      certificates: [
        {
          type: CertificateType.STAKE_DELEGATION,
          params: stakeDelegationParam,
        },
      ],
    },
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR,
    err: {
      v7: {
        errCls: TypeError,
        errMsg: "Cannot read properties of undefined (reading 'poolKey')",
      },
      v8: {
        errCls: TypeError,
        errMsg: "Cannot read properties of undefined (reading 'poolKey')",
      },
    },
    rejectReason: InvalidDataReason.CERTIFICATE_INVALID_POOL_KEY_HASH,
  },
  {
    testName: 'Stake_delegation_in_Pool_Registration_Owner',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      inputs: [],
      certificates: [
        {
          type: CertificateType.STAKE_DELEGATION,
          params: stakeDelegationParam,
        },
      ],
    },
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
    err: {
      v7: {
        errCls: TypeError,
        errMsg: "Cannot read properties of undefined (reading 'poolKey')",
      },
      v8: {
        errCls: TypeError,
        errMsg: "Cannot read properties of undefined (reading 'poolKey')",
      },
    },
    rejectReason: InvalidDataReason.CERTIFICATE_INVALID_POOL_KEY_HASH,
  },
  {
    testName: 'Pool_retirement_in_Pool_Registration_Operator',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      certificates: [
        {
          type: CertificateType.STAKE_POOL_RETIREMENT,
          params: poolRetirementParam,
        },
      ],
    },
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR,
    err: {
      v7: {
        errCls: TypeError,
        errMsg: "Cannot read properties of undefined (reading 'poolKey')",
      },
      v8: {
        errCls: TypeError,
        errMsg: "Cannot read properties of undefined (reading 'poolKey')",
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_POOL_OPERATOR__SINGLE_POOL_REG_CERTIFICATE_REQUIRED,
  },
  {
    testName: 'Pool_retirement_in_Pool_Registration_Owner',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      inputs: [],
      certificates: [
        {
          type: CertificateType.STAKE_POOL_RETIREMENT,
          params: poolRetirementParam,
        },
      ],
    },
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
    err: {
      v7: {
        errCls: TypeError,
        errMsg: "Cannot read properties of undefined (reading 'poolKey')",
      },
      v8: {
        errCls: TypeError,
        errMsg: "Cannot read properties of undefined (reading 'poolKey')",
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_POOL_OWNER__SINGLE_POOL_REG_CERTIFICATE_REQUIRED,
  },
]

export const certificateStakingRejectTestCases: TestCaseRejectShelley[] = [
  {
    testName: 'Script_hash_in_Ordinary_Tx',
    tx: {
      ...shelleyBase,
      certificates: [
        {
          type: CertificateType.STAKE_REGISTRATION,
          params: stakeRegistrationScriptHashParam,
        },
      ],
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_ORDINARY__CERTIFICATE_STAKE_CREDENTIAL_ONLY_AS_PATH,
  },
  {
    testName: 'Non_staking_path_in_Ordinary_Tx',
    tx: {
      ...shelleyBase,
      certificates: [
        {
          type: CertificateType.STAKE_REGISTRATION,
          params: {
            stakeCredential: {
              type: CredentialParamsType.KEY_PATH,
              keyPath: str_to_path("1852'/1815'/0'/0/0"),
            },
          },
        },
      ],
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Path_in_Multisig_Tx',
    tx: {
      ...shelleyBase,
      certificates: [
        {
          type: CertificateType.STAKE_REGISTRATION,
          params: stakeRegistrationPathParam,
        },
      ],
    },
    signingMode: TransactionSigningMode.MULTISIG_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_MULTISIG__CERTIFICATE_CREDENTIAL_ONLY_AS_SCRIPT,
  },
]

export const certificateStakePoolRetirementRejectTestCases: TestCaseRejectShelley[] =
  [
    {
      testName: 'Non_pool_cold_key_in_Ordinary_Tx',
      appVersion: {unsupportedInAppXS: true},
      tx: {
        ...shelleyBase,
        certificates: [
          {
            type: CertificateType.STAKE_POOL_RETIREMENT,
            params: {
              poolKeyPath: str_to_path("1853'/1815'/0'/0"),
              retirementEpoch: 42,
            },
          },
        ],
      },
      signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
      err: {
        v7: {
          errCls: DeviceStatusError,
          errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
        },
        v8: {
          errCls: DeviceStatusError,
          errMsg:
            StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
        },
      },
      rejectReason: InvalidDataReason.LEDGER_POLICY,
    },
    // can't test the rest of the signing modes, because a previous checks catches them
  ]

export const withdrawalRejectTestCases: TestCaseRejectShelley[] = [
  {
    testName: 'Reject_tx_with_invalid_canonical_ordering_of_withdrawals',
    // ledgerjs cannot validate this, so this test is only meaningful for a ledger device
    tx: {
      ...mainnetFeeTtl,
      inputs: [inputs.utxoShelley],
      outputs: [],
      withdrawals: [
        {
          amount: 33333,
          stakeCredential: {
            keyPath: [2147485500, 2147485463, 2147483648, 2, 1],
            type: 0,
          },
        },
        {
          amount: 33333,
          stakeCredential: {
            keyPath: [2147485500, 2147485463, 2147483648, 2, 0],
            type: 0,
          },
        },
      ],
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_INVALID_DATA],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV8[StatusWordV8.SWO_TX_PARSING_FAIL_WITHDRAWALS],
      },
    },
    rejectReason: InvalidDataReason.INVALID_DATA_SUPPLIED_TO_LEDGER,
  },
  {
    testName: 'Script_hash_as_stake_credential_in_Ordinary_Tx',
    tx: {
      ...shelleyBase,
      withdrawals: [
        {
          stakeCredential: {
            type: CredentialParamsType.SCRIPT_HASH,
            scriptHashHex:
              '29fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd',
          },
          amount: 1000,
        },
      ],
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.SIGN_MODE_ORDINARY__WITHDRAWAL_ONLY_AS_PATH,
  },
  {
    testName: 'Non_staking_path_as_stake_credential_in_Ordinary_Tx',
    tx: {
      ...shelleyBase,
      withdrawals: [
        {
          stakeCredential: {
            type: CredentialParamsType.KEY_PATH,
            keyPath: str_to_path("1852'/1815'/0'/0/0"),
          },
          amount: 1000,
        },
      ],
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Staking_path_as_stake_credential_in_Multisig_Tx',
    tx: {
      ...shelleyBase,
      withdrawals: [
        {
          stakeCredential: {
            type: CredentialParamsType.KEY_PATH,
            keyPath: str_to_path("1852'/1815'/0'/2/0"),
          },
          amount: 1000,
        },
      ],
    },
    signingMode: TransactionSigningMode.MULTISIG_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason:
      InvalidDataReason.SIGN_MODE_MULTISIG__WITHDRAWAL_ONLY_AS_SCRIPT,
  },
  {
    testName: 'Non_staking_path_as_stake_credential_in_Plutus_Tx',
    tx: {
      ...shelleyBase,
      withdrawals: [
        {
          stakeCredential: {
            type: CredentialParamsType.KEY_PATH,
            keyPath: str_to_path("1852'/1815'/0'/0/0"),
          },
          amount: 1000,
        },
      ],
    },
    signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
]

const witnessRejectTestCasesRaw: TestCaseRejectShelley[] = [
  {
    testName: 'Ordinary_account_path_in_Ordinary_Tx',
    tx: {
      ...shelleyBase,
    },
    additionalWitnessPaths: [str_to_path("1852'/1815'/0'")],
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Multisig_account_path_in_Ordinary_Tx',
    tx: {
      ...shelleyBase,
    },
    additionalWitnessPaths: [str_to_path("1854'/1815'/0'")],
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Multisig_spending_path_in_Ordinary_Tx',
    tx: {
      ...shelleyBase,
    },
    additionalWitnessPaths: [str_to_path("1854'/1815'/0'/0/0")],
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Multisig_staking_path_in_Ordinary_Tx',
    tx: {
      ...shelleyBase,
    },
    additionalWitnessPaths: [str_to_path("1854'/1815'/0'/2/0")],
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Mint_path_in_Ordinary_Tx',
    tx: {
      ...shelleyBase,
    },
    additionalWitnessPaths: [str_to_path("1855'/1815'/0'")],
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Ordinary_account_path_in_Multisig_Tx',
    tx: {
      ...shelleyBase,
    },
    additionalWitnessPaths: [str_to_path("1852'/1815'/0'")],
    signingMode: TransactionSigningMode.MULTISIG_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Multisig_account_path_in_Multisig_Tx',
    tx: {
      ...shelleyBase,
    },
    additionalWitnessPaths: [str_to_path("1854'/1815'/0'")],
    signingMode: TransactionSigningMode.MULTISIG_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Ordinary_spending_path_in_Multisig_Tx',
    tx: {
      ...shelleyBase,
    },
    additionalWitnessPaths: [str_to_path("1852'/1815'/0'/0/0")],
    signingMode: TransactionSigningMode.MULTISIG_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Ordinary_staking_path_in_Multisig_Tx',
    tx: {
      ...shelleyBase,
    },
    additionalWitnessPaths: [str_to_path("1852'/1815'/0'/2/0")],
    signingMode: TransactionSigningMode.MULTISIG_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Mint_path_in_Multisig_Tx',
    tx: {
      ...shelleyBase,
    },
    additionalWitnessPaths: [str_to_path("1855'/1815'/0'")],
    signingMode: TransactionSigningMode.MULTISIG_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Pool_cold_path_in_Multisig_Tx',
    tx: {
      ...shelleyBase,
    },
    additionalWitnessPaths: [str_to_path("1853'/1815'/0'/0'")],
    signingMode: TransactionSigningMode.MULTISIG_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Ordinary_account_path_in_Plutus_Tx',
    tx: {
      ...shelleyBase,
    },
    additionalWitnessPaths: [str_to_path("1852'/1815'/0'")],
    signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Multisig_account_path_in_Plutus_Tx',
    tx: {
      ...shelleyBase,
    },
    additionalWitnessPaths: [str_to_path("1854'/1815'/0'")],
    signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Multisig_account_path_in_Pool_Registration_Owner_Tx',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      inputs: [inputs.utxoMultisig],
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOwner,
        },
      ],
    },
    additionalWitnessPaths: [str_to_path("1854'/1815'/0'")],
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Ordinary_spending_path_in_Pool_Registration_Owner_Tx',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      inputs: [inputs.utxoMultisig],
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOwner,
        },
      ],
    },
    additionalWitnessPaths: [str_to_path("1852'/1815'/0'/0/0")],
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Multisig_spending_path_in_Pool_Registration_Owner_Tx',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      inputs: [inputs.utxoMultisig],
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOwner,
        },
      ],
    },
    additionalWitnessPaths: [str_to_path("1854'/1815'/0'/0/0")],
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Multisig_staking_path_in_Pool_Registration_Owner_Tx',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      inputs: [inputs.utxoMultisig],
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOwner,
        },
      ],
    },
    additionalWitnessPaths: [str_to_path("1854'/1815'/0'/2/0")],
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Mint_path_in_Pool_Registration_Owner_Tx',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      inputs: [inputs.utxoMultisig],
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOwner,
        },
      ],
    },
    additionalWitnessPaths: [str_to_path("1855'/1815'/0'")],
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Pool_cold_path_in_Pool_Registration_Owner_Tx',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      inputs: [inputs.utxoMultisig],
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOwner,
        },
      ],
    },
    additionalWitnessPaths: [str_to_path("1853'/1815'/0'/0'")],
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Multisig_account_path_in_Pool_Registration_Operator_Tx',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOperator,
        },
      ],
    },
    additionalWitnessPaths: [str_to_path("1854'/1815'/0'")],
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Multisig_spending_path_in_Pool_Registration_Operator_Tx',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOperator,
        },
      ],
    },
    additionalWitnessPaths: [str_to_path("1854'/1815'/0'/0/0")],
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Ordinary_staking_path_in_Pool_Registration_Operator_Tx',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOperator,
        },
      ],
    },
    additionalWitnessPaths: [str_to_path("1852'/1815'/0'/2/0")],
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Multisig_staking_path_in_Pool_Registration_Operator_Tx',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOperator,
        },
      ],
    },
    additionalWitnessPaths: [str_to_path("1854'/1815'/0'/2/0")],
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Mint_path_in_Pool_Registration_Operator_Tx',
    appVersion: {unsupportedInAppXS: true},
    tx: {
      ...shelleyBase,
      certificates: [
        {
          type: CertificateType.STAKE_POOL_REGISTRATION,
          params: poolRegParamOperator,
        },
      ],
    },
    additionalWitnessPaths: [str_to_path("1855'/1815'/0'")],
    signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
]

export const witnessRejectTestCases: TestCaseRejectShelley[] =
  witnessRejectTestCasesRaw.map((testCase) => ({
    ...testCase,
    err:
      testCase.err == null
        ? undefined
        : {
            v7: testCase.err.v7,
            v8: {
              errCls: testCase.err.v8.errCls,
              errMsg: DoNotRunOnLedger,
            },
          },
  }))

export const testsInvalidTokenBundleOrdering: TestCaseRejectShelley[] = [
  {
    testName: 'Reject_tx_where_asset_groups_are_not_ordered',
    tx: {
      ...mainnetFeeTtl,
      inputs: [inputs.utxoShelley],
      outputs: [outputs.multiassetInvalidAssetGroupOrdering],
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_INVALID_DATA],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_TX_PARSING_FAIL_CANONICAL_ORDER],
      },
    },
    rejectReason: InvalidDataReason.MULTIASSET_INVALID_TOKEN_BUNDLE_ORDERING,
  },
  {
    testName: 'Reject_tx_where_asset_groups_are_not_unique',
    tx: {
      ...mainnetFeeTtl,
      inputs: [inputs.utxoShelley],
      outputs: [outputs.multiassetAssetGroupsNotUnique],
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_INVALID_DATA],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_TX_PARSING_FAIL_CANONICAL_ORDER],
      },
    },
    rejectReason: InvalidDataReason.MULTIASSET_INVALID_TOKEN_BUNDLE_NOT_UNIQUE,
  },
  {
    testName:
      'Reject_tx_where_tokens_within_an_asset_group_are_not_ordered_alphabetical',
    tx: {
      ...mainnetFeeTtl,
      inputs: [inputs.utxoShelley],
      outputs: [outputs.multiassetInvalidTokenOrderingSameLength],
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_INVALID_DATA],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_TX_PARSING_FAIL_CANONICAL_ORDER],
      },
    },
    rejectReason: InvalidDataReason.MULTIASSET_INVALID_ASSET_GROUP_ORDERING,
  },
  {
    testName:
      'Reject_tx_where_tokens_within_an_asset_group_are_not_ordered_length',
    tx: {
      ...mainnetFeeTtl,
      inputs: [inputs.utxoShelley],
      outputs: [outputs.multiassetInvalidTokenOrderingDifferentLengths],
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_INVALID_DATA],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_TX_PARSING_FAIL_CANONICAL_ORDER],
      },
    },
    rejectReason: InvalidDataReason.MULTIASSET_INVALID_ASSET_GROUP_ORDERING,
  },
  {
    testName: 'Reject_tx_where_tokens_within_an_asset_group_are_not_unique',
    tx: {
      ...mainnetFeeTtl,
      inputs: [inputs.utxoShelley],
      outputs: [outputs.multiassetTokensNotUnique],
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_INVALID_DATA],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_TX_PARSING_FAIL_CANONICAL_ORDER],
      },
    },
    rejectReason: InvalidDataReason.MULTIASSET_INVALID_ASSET_GROUP_NOT_UNIQUE,
  },
  {
    testName:
      'Reject_tx_with_mint_fields_with_invalid_canonical_ordering_of_policies',
    tx: {
      ...mainnetFeeTtl,
      inputs: [inputs.utxoShelley],
      outputs: [],
      mint: mints.mintInvalidCanonicalOrderingPolicy,
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_INVALID_DATA],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV8[StatusWordV8.SWO_TX_PARSING_FAIL_MINT],
      },
    },
    rejectReason: InvalidDataReason.MULTIASSET_INVALID_TOKEN_BUNDLE_ORDERING,
  },
  {
    testName:
      'Reject_tx_with_mint_fields_with_invalid_canonical_ordering_of_asset_names',
    tx: {
      ...mainnetFeeTtl,
      inputs: [inputs.utxoShelley],
      outputs: [],
      mint: mints.mintInvalidCanonicalOrderingAssetName,
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_INVALID_DATA],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV8[StatusWordV8.SWO_TX_PARSING_FAIL_MINT],
      },
    },
    rejectReason: InvalidDataReason.MULTIASSET_INVALID_ASSET_GROUP_ORDERING,
  },
]

const singleAccountRejectTestCasesRaw: TestCaseRejectShelley[] = [
  {
    testName: 'Input_and_change_output_account_mismatch',
    tx: {
      network: Networks.Mainnet,
      inputs: [inputs.utxoShelley],
      outputs: [
        {
          amount: 1,
          destination: {
            type: TxOutputDestinationType.THIRD_PARTY,
            params: {
              addressHex: bech32_to_hex(
                'addr1q84sh2j72ux0l03fxndjnhctdg7hcppsaejafsa84vh7lwgmcs5wgus8qt4atk45lvt4xfxpjtwfhdmvchdf2m3u3hlsd5tq5r',
              ),
            },
          },
        },
        {
          amount: 7120787,
          destination: {
            type: TxOutputDestinationType.DEVICE_OWNED,
            params: {
              type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
              params: {
                spendingPath: str_to_path("1852'/1815'/1'/0/0"),
                stakingPath: str_to_path("1852'/1815'/0'/2/0"),
              },
            },
          },
        },
      ],
      fee: 42,
      ttl: 10,
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Input_and_stake_deregistration_certificate_account_mismatch',
    tx: {
      network: Networks.Mainnet,
      inputs: [inputs.utxoShelley],
      outputs: [
        {
          amount: 1,
          destination: {
            type: TxOutputDestinationType.THIRD_PARTY,
            params: {
              addressHex: bech32_to_hex(
                'addr1q84sh2j72ux0l03fxndjnhctdg7hcppsaejafsa84vh7lwgmcs5wgus8qt4atk45lvt4xfxpjtwfhdmvchdf2m3u3hlsd5tq5r',
              ),
            },
          },
        },
      ],
      certificates: [
        {
          type: CertificateType.STAKE_DEREGISTRATION,
          params: {
            stakeCredential: {
              type: CredentialParamsType.KEY_PATH,
              keyPath: str_to_path("1852'/1815'/1'/2/0"),
            },
          },
        },
      ],
      fee: 42,
      ttl: 10,
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Input_and_withdrawal_account_mismatch',
    tx: {
      network: Networks.Mainnet,
      inputs: [inputs.utxoShelley],
      outputs: [
        {
          amount: 1,
          destination: {
            type: TxOutputDestinationType.THIRD_PARTY,
            params: {
              addressHex: bech32_to_hex(
                'addr1q84sh2j72ux0l03fxndjnhctdg7hcppsaejafsa84vh7lwgmcs5wgus8qt4atk45lvt4xfxpjtwfhdmvchdf2m3u3hlsd5tq5r',
              ),
            },
          },
        },
      ],
      withdrawals: [
        {
          amount: 1000,
          stakeCredential: {
            type: CredentialParamsType.KEY_PATH,
            keyPath: str_to_path("1852'/1815'/1'/2/0"),
          },
        },
      ],
      fee: 42,
      ttl: 10,
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Change_output_and_stake_deregistration_account_mismatch',
    tx: {
      network: Networks.Mainnet,
      inputs: [inputs.utxoShelley],
      outputs: [
        {
          amount: 1,
          destination: {
            type: TxOutputDestinationType.THIRD_PARTY,
            params: {
              addressHex: bech32_to_hex(
                'addr1q84sh2j72ux0l03fxndjnhctdg7hcppsaejafsa84vh7lwgmcs5wgus8qt4atk45lvt4xfxpjtwfhdmvchdf2m3u3hlsd5tq5r',
              ),
            },
          },
        },
        outputs.internalBaseWithStakingPath,
      ],
      certificates: [
        {
          type: CertificateType.STAKE_DEREGISTRATION,
          params: {
            stakeCredential: {
              type: CredentialParamsType.KEY_PATH,
              keyPath: str_to_path("1852'/1815'/1'/2/0"),
            },
          },
        },
      ],
      fee: 42,
      ttl: 10,
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Change_output_and_withdrawal_account_mismatch',
    tx: {
      network: Networks.Mainnet,
      inputs: [inputs.utxoShelley],
      outputs: [
        {
          amount: 1,
          destination: {
            type: TxOutputDestinationType.THIRD_PARTY,
            params: {
              addressHex: bech32_to_hex(
                'addr1q84sh2j72ux0l03fxndjnhctdg7hcppsaejafsa84vh7lwgmcs5wgus8qt4atk45lvt4xfxpjtwfhdmvchdf2m3u3hlsd5tq5r',
              ),
            },
          },
        },
        outputs.internalBaseWithStakingPath,
      ],
      withdrawals: [
        {
          amount: 1000,
          stakeCredential: {
            type: CredentialParamsType.KEY_PATH,
            keyPath: str_to_path("1852'/1815'/1'/2/0"),
          },
        },
      ],
      fee: 42,
      ttl: 10,
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName:
      'Stake_deregistration_certificate_and_withdrawal_account_mismatch',
    tx: {
      network: Networks.Mainnet,
      inputs: [inputs.utxoShelley],
      outputs: [
        {
          amount: 1,
          destination: {
            type: TxOutputDestinationType.THIRD_PARTY,
            params: {
              addressHex: bech32_to_hex(
                'addr1q84sh2j72ux0l03fxndjnhctdg7hcppsaejafsa84vh7lwgmcs5wgus8qt4atk45lvt4xfxpjtwfhdmvchdf2m3u3hlsd5tq5r',
              ),
            },
          },
        },
      ],
      certificates: [
        {
          type: CertificateType.STAKE_DEREGISTRATION,
          params: {
            stakeCredential: {
              type: CredentialParamsType.KEY_PATH,
              keyPath: str_to_path("1852'/1815'/0'/2/0"),
            },
          },
        },
      ],
      withdrawals: [
        {
          amount: 1000,
          stakeCredential: {
            type: CredentialParamsType.KEY_PATH,
            keyPath: str_to_path("1852'/1815'/1'/2/0"),
          },
        },
      ],
      fee: 42,
      ttl: 10,
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Byron_to_Shelley_transfer_input_account_mismatch',
    tx: {
      network: Networks.Mainnet,
      inputs: [
        {
          ...inputs.utxoByron,
          txHashHex:
            '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
          path: str_to_path("44'/1815'/1'/0/0"),
        },
        {
          ...inputs.utxoShelley,
          path: str_to_path("1852'/1815'/1'/0/0"),
        },
      ],
      outputs: [
        {
          amount: 1,
          destination: {
            type: TxOutputDestinationType.THIRD_PARTY,
            params: {
              addressHex: bech32_to_hex(
                'addr1z90z7zqwhya6mpk5q929ur897g3pp9kkgalpreny8y304r2dcrtx0sf3dluyu4erzr3xtmdnzvcyfzekkuteu2xagx0qeva0pr',
              ),
            },
          },
        },
      ],
      fee: 42,
      ttl: 10,
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
  {
    testName: 'Byron_to_Shelley_transfer_output_account_mismatch',
    tx: {
      network: Networks.Mainnet,
      inputs: [
        {
          ...inputs.utxoByron,
          txHashHex:
            '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
          path: str_to_path("44'/1815'/1'/0/0"),
        },
      ],
      outputs: [
        {
          amount: 7120787,
          destination: {
            type: TxOutputDestinationType.DEVICE_OWNED,
            params: {
              type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
              params: {
                spendingPath: str_to_path("1852'/1815'/1'/0/0"),
                stakingPath: str_to_path("1852'/1815'/1'/2/0"),
              },
            },
          },
        },
      ],
      fee: 42,
      ttl: 10,
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.LEDGER_POLICY,
  },
]

const singleAccountRejectNeedsReviewOnV8 = new Set([
  'Input and change output account mismatch',
  'Input and stake deregistration certificate account mismatch',
  'Input and withdrawal account mismatch',
  'Byron to Shelley transfer input account mismatch',
  'Byron to Shelley transfer output account mismatch',
])

export const singleAccountRejectTestCases: TestCaseRejectShelley[] =
  singleAccountRejectTestCasesRaw.map((testCase) => ({
    ...testCase,
    err:
      testCase.err == null ||
      !singleAccountRejectNeedsReviewOnV8.has(testCase.testName)
        ? testCase.err
        : {
            v7: testCase.err.v7,
            v8: {
              errCls: testCase.err.v8.errCls,
              errMsg: DoNotRunOnLedger,
            },
          },
  }))

export const collateralOutputRejectTestCases: TestCaseRejectShelley[] = [
  {
    testName: 'Collateral_output_with_datum_hash',
    tx: {
      ...shelleyBase,
      collateralOutput: outputs.datumHashExternal,
    },
    signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.COLLATERAL_INPUT_CONTAINS_DATUM,
  },
  {
    testName: 'Collateral_output_with_inline_datum',
    tx: {
      ...shelleyBase,
      collateralOutput: outputs.inlineDatum480Map,
    },
    signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.COLLATERAL_INPUT_CONTAINS_DATUM,
  },
  {
    testName: 'Collateral_output_with_reference_script',
    tx: {
      ...shelleyBase,
      collateralOutput: outputs.refScriptExternalMap,
    },
    signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
    err: {
      v7: {
        errCls: DeviceStatusError,
        errMsg: StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY],
      },
      v8: {
        errCls: DeviceStatusError,
        errMsg:
          StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED],
      },
    },
    rejectReason: InvalidDataReason.COLLATERAL_INPUT_CONTAINS_REFERENCE_SCRIPT,
  },
]

export const votingProcedureRejectTestCases: TestCaseRejectShelley[] = [
  {
    testName: 'Invalid vote option (out of range)',
    tx: {
      ...shelleyBase,
      votingProcedures: [
        {
          voter: {
            type: VoterType.DREP_KEY_PATH,
            keyPath: str_to_path("1852'/1815'/0'/3/0"),
          },
          votes: [
            {
              govActionId: {
                txHashHex:
                  '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
                govActionIndex: 0,
              },
              votingProcedure: {
                vote: 99 as unknown as VoteOption,
                anchor: null,
              },
            },
          ],
        },
      ],
    },
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    err: {
      v7: {
        errCls: InvalidData,
        errMsg: InvalidDataReason.VOTING_PROCEDURE_INVALID_VOTE_OPTION,
      },
      v8: {
        errCls: InvalidData,
        errMsg: InvalidDataReason.VOTING_PROCEDURE_INVALID_VOTE_OPTION,
      },
    },
    rejectReason: InvalidDataReason.VOTING_PROCEDURE_INVALID_VOTE_OPTION,
  },
]
