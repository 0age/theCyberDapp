import React, { Component } from 'react'
import Web3 from 'web3'
import ProviderEngine from 'web3-provider-engine'
import WebsocketSubprovider from 'web3-provider-engine/subproviders/websocket'
import TransportU2F from '@ledgerhq/hw-transport-u2f'
import createLedgerSubprovider from '@ledgerhq/web3-subprovider'
import Dropzone from 'react-dropzone'
import * as moment from 'moment'
import { Row, Col } from 'react-simple-flex-grid'
import 'react-simple-flex-grid/lib/main.css'
import './App.css'
import config from './config.json'

let openpgp = require('openpgp')
openpgp.initWorker({path: 'openpgp.worker.min.js'})

const MemberGreeting = ({
  networkId, foundMember, memberName, memberAccountIndex, messageBody,
  showCursor, style
}) => {
  if (foundMember === true) {
    let networkInterfaceName = 'testRPC'
    if (networkId === 1) {
      networkInterfaceName = 'mainnet'
    } else if (networkId === 3) {
      networkInterfaceName = 'ropsten'
    }
    return (
      <div style={{...style, width: '100%', overflow: 'hidden'}}>
        <div style={{...style, float: 'left', color: 'dodgerBlue'}}>
          {(memberName !== null && memberName.length > 0 ?
            memberName :
            memberAccountIndex)}
        </div>
        <div style={{...style, float: 'left', color: 'lightGrey'}}>
          {'@'}
        </div>
        <div style={{...style, float: 'left'}}>
          {'theCyber'}
        </div>
        <div style={{...style, float: 'left', color: 'lightGrey'}}>
          {':'}
        </div>
        <div style={{...style, float: 'left', color: 'yellow'}}>
          {`~/${networkInterfaceName}`}
        </div>
        <div style={{...style, float: 'left', color: 'lightGrey'}}>
          {'$\u00a0'}
        </div>
        <div style={{...style, float: 'left', overflow: 'hidden'}}>
          {messageBody.replace(/ /g, '\u00a0')}
        </div>
        <div style={{...style, float: 'left', transform: 'scale(1, 1.5)', overflow: 'hidden'}}>
          {showCursor ? '█' : '\u00a0'}
        </div>
        <div style={{...style, float: 'right'}}>
          <a
            href={`https://${
              networkId === 3 ?
                'ropsten.' :
                ''}etherscan.io/address/${
              networkId === 3 ?
                config.cyberClubhouseAddress :
                'clubhouse.thecyber.eth'
            }#code`}
            target="_blank"
          >
            {'clubhouse'}
          </a>
        </div>
        <div style={{...style, float: 'right'}}>
          {'\u00a0\u00a0'}
        </div>
        <div style={{...style, float: 'right'}}>
          <a
            href={'https://etherscan.io/address/gatekeepertwo.thecyber.eth#code'}
            target="_blank"
          >
            {'gatekeeper'}
          </a>
        </div>
      </div>
    )
  } else if (foundMember === false) {
    return(
      <div style={{...style, width: '100%', overflow: 'hidden'}}>
        <div style={{...style, float: 'left', color: 'dodgerBlue'}}>
          {'guest'}
        </div>
        <div style={{...style, float: 'left', color: 'lightGrey'}}>
          {'@'}
        </div>
        <div style={{...style, float: 'left'}}>
          {'theCyber'}
        </div>
        <div style={{...style, float: 'left', color: 'lightGrey'}}>
          {':'}
        </div>
        <div style={{...style, float: 'left', color: 'white'}}>
          {'\u00a0Access denied.'}
        </div>
        <div style={{...style, float: 'right'}}>
          <a
            href={`https://${
              networkId === 3 ?
                'ropsten.' :
                ''}etherscan.io/address/${
              networkId === 3 ?
                config.cyberClubhouseAddress :
                'clubhouse.thecyber.eth'
            }#code`}
            target="_blank"
          >
            {'clubhouse'}
          </a>
        </div>
        <div style={{...style, float: 'right'}}>
          {'\u00a0\u00a0'}
        </div>
        <div style={{...style, float: 'right'}}>
          <a
            href={'https://etherscan.io/address/gatekeepertwo.thecyber.eth#code'}
            target="_blank"
          >
            {'gatekeeper'}
          </a>
        </div>
      </div>
    )
  }
  return (
    <div style={{...style, color: 'white'}}>
      {'Authenticating with theCyber...'}
    </div>)
}

const BlockSummary = (({ block, style, isSyncing }) => {
  return (
    <div style={{...style, float: 'left', paddingLeft: '20px', textAlign: 'left'}}>
      <span>{'Block: '}</span>
      <span className={'blockDetails'}>{`${block.number} | ${
        !isSyncing ? (`${
          block.timestamp ?
            moment.unix(block.timestamp).format('MM/DD/YY h:mm:ss a') :
            '...'
        } | ${
          block.transactions ?
            block.transactions.length :
            0

        } transactions\n`) : 'syncing chain...'
      }`}</span>
    </div>
  )
})

const AddressSummary = (({ accounts, networkId, style }) => {
  return (
    <div>
      <ul>
        {Object.entries(accounts).map((account) => {
          return (
            <li key={account[0]}>
              <div style={{...style, float: 'left'}}>
                {`${account[0]}:\u00a0`}
              </div>
              <div style={{...style, float: 'left'}}>
                <a
                  href={`https://${
                    networkId === 3 ?
                      'ropsten.' :
                      ''
                  }etherscan.io/address/${account[1].address}`}
                  target='_blank'
                >
                  {`${account[1].address.substring(0, 6)}...${
                    account[1].address.substring(account[1].address.length - 4)
                  }`}
                </a>
              </div>
              <div>
                {account[1].balance ?
                  `\u00a0=> ${Number((account[1].balance / (10 ** 18)).toFixed(10))} ether` :
                  ''}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
})

const MembersList = ({ members, networkId, style }) => {
  return (
    <div>
      <ul>
        {
          members.filter(member => {
            return (
              typeof member !== 'undefined' && member.memberSince !== null
            )
          }).map((member, index) => {
            return (
              <li key={index}>
                {((typeof member !== 'undefined' && member.memberSince !== '0') ?
                  <div >
                    <div style={{...style, float: 'left', color: 'dodgerBlue'}}>
                      {`${String(member.memberId).length === 1 ? '00' : ''}${
                        String(member.memberId).length === 2 ? '0' : ''}${
                        member.memberId}:\u00a0`}
                    </div>
                    <div style={{...style, float: 'left'}}>
                      <a
                        href={`https://${
                          networkId === 3 ?
                            'ropsten.' :
                            ''
                        }etherscan.io/address/${member.memberAddress}`}
                        target="_blank"
                      >
                        {`${member.memberAddress.substring(0, 6)}...${
                          member.memberAddress.substring(member.memberAddress.length - 4)}`}
                      </a>
                    </div>
                    <div style={{...style, float: 'left'}}>
                      {`\u00a0${member.memberName}`}
                    </div>
                    <div style={{...style, float: 'left'}}>
                      {`\u00a0(member since ${member.memberSince})`}
                    </div>
                    <div style={{...style, float: 'left', color: 'red'}}>
                      {member.inactiveSince !== null ? '\u00a0- INACTIVE' : ''}
                    </div>
                    <div style={{...style, float: 'left', color: 'yellow'}}>
                      {String(member.memberKey).length === 0 ? '\u00a0- KEYLESS' : ''}
                    </div>
                    <div style={{...style, clear: 'both', padding: '0x'}} />
                  </div> :
                  index + ': no member')}
              </li>
            )
          })
        }
      </ul>
    </div>
  )
}

const EventsList = (({ events, isMember, filterType }) => {
  const sortedEventsArray = Object.values(
    Object.keys(events).sort().reduce((r, k) => {
      r[k] = events[k]
      return r
    }, {})
  )

  return (
    <div>
      {sortedEventsArray.length > 0 ?
        <ul>
          {
            sortedEventsArray.reverse().map((event, index) => {
              return (
                <li key={index}>
                  {((typeof event !== 'undefined') ?
                    <div>
                      <div style={{whiteSpace: 'pre-line', paddingBottom: '8px'}}>
                        <span style={{color: 'dodgerBlue'}}>
                          {`${String(event.member).length < 2 ? '0' : ''}${
                            String(event.member).length < 3 ? '0' : ''}${event.member}`}
                        </span>
                        <span>
                          {` | ${event.block} | ${event.timestamp} | ${event.message}`}
                        </span>
                      </div>
                    </div> :
                    'no event')
                  }
                </li>
              )
            })
          }
        </ul> :
        <div style={{paddingLeft: '30px', paddingTop: '8px'}}>
          {(isMember === false && filterType === 'personal') ?
            'A valid membership is required to filter by personal events.' :
            'Loading events...'}
        </div>
      }
    </div>
  )
})

const TransactionPoolList = (({ transactionPool, networkId }) => {
  let transactions = []
  Object.keys(transactionPool).forEach(txHash => {
    let transaction = transactionPool[txHash]
    transaction.transactionHash = txHash
    transactions.push(transaction)
  })

  transactions.sort((a, b) => {
    return a.submitted - b.submitted
  })

  return (
    <div>
      {transactions.length > 0 ?
        <ul>
          {
            transactions.reverse().map((transaction, index) => {
              let transactionStatus = {
                color: 'dodgerBlue',
                message: 'pending'
              }
              if (transaction.failed) {
                transactionStatus = {
                  color: 'red',
                  message: 'failed'
                }
              } else if (transaction.confirmed) {
                transactionStatus = {
                  color: '#0f0',
                  message: 'success'
                }
              }
              return (
                <li key={index}>
                  {((typeof transaction !== 'undefined') ?
                    <div>
                      <div style={{whiteSpace: 'pre-line', paddingBottom: '8px'}}>
                        <span>
                          <a
                            href={`https://${
                              networkId === 3 ?
                                'ropsten.' :
                                ''
                            }etherscan.io/tx/${transaction.transactionHash}`}
                            target='_blank'
                          >
                            {`${transaction.transactionHash.substring(0, 6)}...${
                              transaction.transactionHash.substring(
                                transaction.transactionHash.length - 4
                              )}`}
                          </a>
                        </span>
                        <span>
                          {`: ${transaction.eventType} => `}
                        </span>
                        <span style={{
                          color: transactionStatus.color
                        }}>
                          {transactionStatus.message}
                        </span>
                      </div>
                    </div> :
                    'no transaction'
                  )}
                </li>
              )
            })
          }
        </ul> :
        <div style={{float: 'left', paddingLeft: '20px', paddingTop: '8px'}}>
          {'\u00a0Transaction pool is empty.'}
        </div>
      }
    </div>
  )
})

const ConnectionOptions = (({
  currentChoice, choiceOne, choiceTwo, choiceThree, choiceFour, rpcUrl,
  onChoiceOne, onChoiceTwo, onChoiceThree, onChoiceFour, onChangeRpcUrl, onSelect
}) => {
  return (
    <div>
      <header className='App-header'>
        <h1 className='App-title'>
          <div style={{textAlign: 'center', fontSize: '85%'}}>
            <span>
              theCyber
            </span>
            <span style={{color: 'white'}}>
              {' - choose your connection method.'}
            </span>
          </div>
        </h1>
      </header>
      <div className={'choices'}>
        <button
          className={'choice-1'}
          style={{color: choiceOne.textColor, background: choiceOne.color}}
          onClick={() => onChoiceOne()}
        >
          {'view only (infura)'}
        </button>
        <button
          className={'choice-2'}
          style={{color: choiceTwo.textColor, background: choiceTwo.color}}
          onClick={() => onChoiceTwo()}
        >
          {'injected (e.g. metamask)'}
        </button>
        <button
          className={'choice-3'}
          style={{color: choiceThree.textColor, background: choiceThree.color}}
          onClick={() => onChoiceThree()}
        >
          {'custom (e.g. geth node)'}
        </button>
        <button
          className={'choice-4'}
          style={{color: choiceFour.textColor, background: choiceFour.color}}
          onClick={() => onChoiceFour()}
        >
          {'ledger & infura node'}
        </button>
      </div>
      <div style={{clear: 'both', padding: '8px'}} />
      {currentChoice === 'custom' ?
        <div style={{margin: '0 auto', width: '333px'}}>
          <input
            placeholder={'rpc url (ideally a websocket)'}
            style={{width: '333px', color: 'white', background: 'black'}}
            value={rpcUrl}
            onChange={onChangeRpcUrl}
          />
          <div style={{clear: 'both', padding: '8px'}} />
        </div> : <div />
      }
      <div style={{margin: '0 auto', width: '33.016px'}}>
        <button
          onClick={() => onSelect()}
        >
          {'enter'}
        </button>
      </div>
    </div>
  )
})


class Main extends Component {
  constructor(props) {
    super(props)
    console.log(`web3 connection type chosen: ${props.connectionType}`)
    if (props.connectionType === 'custom') {
      console.log(`rpc endpoint provided: ${props.rpcUrl}`)
    }

    const consoleGreeting = String.raw`
   __   __           ______        __
  / /_ / /_   ___   / ____/__  __ / /_   ___   _____
 / __// __ \ / _ \ / /    / / / // __ \ / _ \ / ___/
/ /_ / / / //  __// /___ / /_/ // /_/ //  __// /
\__//_/ /_/ \___/ \____/ \__, / \____/ \___//_/
                        /____/`.split('\n').slice(1).join('\n')

    console.log(consoleGreeting)

    // set up basic information for interacting with mainnet contracts.
    const networkId = config.networkId
    const cyberAddress = config.cyberAddress
    const cyberUtilAddress = config.cyberUtilAddress // TODO: assign as member
    const contractDeployedBlock = config.contractDeployedBlock

    // use infura as a fallback provider (or additional websocket provider).
    const infura = config.infuraWebsocket // NOTE: this isn't production-ready
    const infuraHttp = config.infuraHttp

    // set up dummy web3 objects that will throw unless they are replaced.
    this.web3 = {
      version: null,
      eth: {
        isSyncing: (() => {
          return Promise.reject('Error: no Web3 provider found.')
        }),
        Contract: ((..._) => {
          return false && _
        })
      }
    }
    this.wsWeb3 = this.web3

    // set up web3 (including a websocket) based on the connection type chosen.
    if (props.connectionType === 'custom') {
      // connect via the provided rpc url, add infura for ws if the url is http
      const provider = props.rpcUrl
      if (provider.startsWith('ws')) {
        console.log(`attempting to connect to websocket provider at ${provider}...`)
        this.web3 = new Web3(new Web3.providers.WebsocketProvider(provider))
        this.wsWeb3 = this.web3
      } else if (provider.startsWith('http')) {
        console.log(`attempting to connect to http provider at ${provider}...`)
        this.web3 = new Web3(new Web3.providers.HttpProvider(provider))
        console.log(`attempting to connect event listener to websocket provider at ${infura}...`)
        this.wsWeb3 = new Web3(new Web3.providers.WebsocketProvider(infura))
      }
    } else if (props.connectionType === 'inject') {
      // set up the injected web3 object in the event that it indeed exists
      if (typeof window.web3 !== 'undefined' &&
          typeof window.web3.currentProvider !== 'undefined') {
        // TODO: how can we support a ledger AND the current provider?
        console.log('found existing web3 provider, initializing...')
        this.web3 = new Web3(window.web3.currentProvider)

        // TODO: can we detect if the current provider is websocket-enabled?
        console.log(`attempting to connect event listener to websocket provider at ${infura}...`)
        this.wsWeb3 = new Web3(new Web3.providers.WebsocketProvider(infura))
      }
    } else if (props.connectionType === 'ledger') {
      // connect to the ledger via u2f, then add infura subprovider & websocket
      console.log('attempting to connect to ledger...')
      const engine = new ProviderEngine()
      const getTransport = () => TransportU2F.create(1000, 2000)
      const ledger = createLedgerSubprovider(getTransport, {
        networkId,
        accountsLength: config.ledgerAccountsLength,
        accountsOffset: config.ledgerAccountsOffset
      })
      engine.addProvider(ledger)

      console.log(`attempting to connect to provider at ${infura}...`)
      let infuraWsProvider = new WebsocketSubprovider({ rpcUrl: infura })
      /* these commands don't work, need to monitor websocket connection health

      infuraWsProvider.on('start', e => console.error('WS start:', e))
      infuraWsProvider.on('error', e => console.error('WS error:', e))
      infuraWsProvider.on('end', e => console.error('WS end:', e))

      */
      engine.addProvider(infuraWsProvider)
      engine.start()
      this.web3 = new Web3(engine)
      this.wsWeb3 = new Web3(new Web3.providers.WebsocketProvider(infura))
    } else {
      // connect to infura, which will not have any attached wallet information
      console.log(`attempting to connect to http provider at ${infuraHttp}...`)
      this.web3 = new Web3(new Web3.providers.HttpProvider(infuraHttp))

      console.log(`attempting to connect event listener to websocket provider at ${infura}...`)
      this.wsWeb3 = new Web3(new Web3.providers.WebsocketProvider(infura))
    }

    // load theCyber's ABI.
    const theCyberABI = [
      {
        constant: false,
        inputs: [
          {
            name: 'tokenContractAddress',
            type: 'address'
          }
        ],
        name: 'donateTokens',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: false,
        inputs: [
          {
            name: 'message',
            type: 'string'
          }
        ],
        name: 'broadcastMessage',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: false,
        inputs: [
          {
            name: 'contractAddress',
            type: 'address'
          },
          {
            name: 'message',
            type: 'string'
          }
        ],
        name: 'passMessage',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: false,
        inputs: [],
        name: 'heartbeat',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: false,
        inputs: [],
        name: 'donateFunds',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: true,
        inputs: [],
        name: 'inactivityTimeout',
        outputs: [
          {
            name: '',
            type: 'uint64'
          }
        ],
        payable: false,
        stateMutability: 'pure',
        type: 'function'
      },
      {
        constant: false,
        inputs: [
          {
            name: 'newMemberAddress',
            type: 'address'
          }
        ],
        name: 'transferMembership',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: false,
        inputs: [
          {
            name: 'newMemberName',
            type: 'bytes32'
          }
        ],
        name: 'changeName',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: false,
        inputs: [
          {
            name: 'memberId',
            type: 'uint8'
          },
          {
            name: 'memberName',
            type: 'bytes32'
          },
          {
            name: 'memberAddress',
            type: 'address'
          }
        ],
        name: 'newMember',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: true,
        inputs: [
          {
            name: 'memberAddress',
            type: 'address'
          }
        ],
        name: 'getMembershipStatus',
        outputs: [
          {
            name: 'member',
            type: 'bool'
          },
          {
            name: 'memberId',
            type: 'uint8'
          }
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [
          {
            name: 'memberId',
            type: 'uint8'
          }
        ],
        name: 'getMemberInformation',
        outputs: [
          {
            name: 'memberName',
            type: 'bytes32'
          },
          {
            name: 'memberKey',
            type: 'string'
          },
          {
            name: 'memberSince',
            type: 'uint64'
          },
          {
            name: 'inactiveSince',
            type: 'uint64'
          },
          {
            name: 'memberAddress',
            type: 'address'
          }
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: false,
        inputs: [
          {
            name: 'memberId',
            type: 'uint8'
          }
        ],
        name: 'revokeMembership',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: false,
        inputs: [
          {
            name: 'newMemberKey',
            type: 'string'
          }
        ],
        name: 'changeKey',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: true,
        inputs: [],
        name: 'maxMembers',
        outputs: [
          {
            name: '',
            type: 'uint16'
          }
        ],
        payable: false,
        stateMutability: 'pure',
        type: 'function'
      },
      {
        constant: false,
        inputs: [
          {
            name: 'memberId',
            type: 'uint8'
          }
        ],
        name: 'proclaimInactive',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: false,
        inputs: [
          {
            name: 'toMemberId',
            type: 'uint8'
          },
          {
            name: 'message',
            type: 'string'
          }
        ],
        name: 'directMessage',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: true,
        inputs: [],
        name: 'donationAddress',
        outputs: [
          {
            name: '',
            type: 'address'
          }
        ],
        payable: false,
        stateMutability: 'pure',
        type: 'function'
      },
      {
        inputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'constructor'
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            name: 'memberId',
            type: 'uint8'
          },
          {
            indexed: false,
            name: 'memberName',
            type: 'bytes32'
          },
          {
            indexed: true,
            name: 'memberAddress',
            type: 'address'
          }
        ],
        name: 'NewMember',
        type: 'event'
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            name: 'memberId',
            type: 'uint8'
          },
          {
            indexed: false,
            name: 'newMemberName',
            type: 'bytes32'
          }
        ],
        name: 'NewMemberName',
        type: 'event'
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            name: 'memberId',
            type: 'uint8'
          },
          {
            indexed: false,
            name: 'newMemberKey',
            type: 'string'
          }
        ],
        name: 'NewMemberKey',
        type: 'event'
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            name: 'memberId',
            type: 'uint8'
          },
          {
            indexed: false,
            name: 'newMemberAddress',
            type: 'address'
          }
        ],
        name: 'MembershipTransferred',
        type: 'event'
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            name: 'memberId',
            type: 'uint8'
          },
          {
            indexed: true,
            name: 'proclaimingMemberId',
            type: 'uint8'
          }
        ],
        name: 'MemberProclaimedInactive',
        type: 'event'
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            name: 'memberId',
            type: 'uint8'
          }
        ],
        name: 'MemberHeartbeated',
        type: 'event'
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            name: 'memberId',
            type: 'uint8'
          },
          {
            indexed: true,
            name: 'revokingMemberId',
            type: 'uint8'
          }
        ],
        name: 'MembershipRevoked',
        type: 'event'
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            name: 'memberId',
            type: 'uint8'
          },
          {
            indexed: false,
            name: 'message',
            type: 'string'
          }
        ],
        name: 'BroadcastMessage',
        type: 'event'
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            name: 'memberId',
            type: 'uint8'
          },
          {
            indexed: true,
            name: 'toMemberId',
            type: 'uint8'
          },
          {
            indexed: false,
            name: 'message',
            type: 'string'
          }
        ],
        name: 'DirectMessage',
        type: 'event'
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            name: 'memberId',
            type: 'uint8'
          },
          {
            indexed: true,
            name: 'contractAddress',
            type: 'address'
          },
          {
            indexed: false,
            name: 'message',
            type: 'string'
          }
        ],
        name: 'Call',
        type: 'event'
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            name: 'memberId',
            type: 'uint8'
          },
          {
            indexed: false,
            name: 'value',
            type: 'uint256'
          }
        ],
        name: 'FundsDonated',
        type: 'event'
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            name: 'memberId',
            type: 'uint8'
          },
          {
            indexed: false,
            name: 'tokenContractAddress',
            type: 'address'
          },
          {
            indexed: false,
            name: 'value',
            type: 'uint256'
          }
        ],
        name: 'TokensDonated',
        type: 'event'
      }
    ]

    // load theCyberMemberUtilities's ABI.
    const theCyberUtilABI = [
      {
        inputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'constructor'
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            name: 'isMember',
            type: 'bool'
          },
          {
            indexed: false,
            name: 'memberId',
            type: 'uint8'
          }
        ],
        name: 'MembershipStatusSet',
        type: 'event'
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            name: 'value',
            type: 'uint256'
          }
        ],
        name: 'FundsDonated',
        type: 'event'
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            name: 'tokenContractAddress',
            type: 'address'
          },
          {
            indexed: false,
            name: 'value',
            type: 'uint256'
          }
        ],
        name: 'TokensDonated',
        type: 'event'
      },
      {
        constant: false,
        inputs: [],
        name: 'setMembershipStatus',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: false,
        inputs: [],
        name: 'heartbeat',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: false,
        inputs: [
          {
            name: '_memberId',
            type: 'uint8'
          },
          {
            name: '_memberName',
            type: 'bytes32'
          },
          {
            name: '_memberAddress',
            type: 'address'
          }
        ],
        name: 'revokeAndSetNewMember',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: false,
        inputs: [],
        name: 'proclaimAllInactive',
        outputs: [
          {
            name: 'complete',
            type: 'bool'
          }
        ],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: false,
        inputs: [],
        name: 'inactivateSelf',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: false,
        inputs: [],
        name: 'revokeAllVulnerable',
        outputs: [
          {
            name: 'complete',
            type: 'bool'
          }
        ],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: false,
        inputs: [],
        name: 'revokeSelf',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: false,
        inputs: [],
        name: 'donateFunds',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: false,
        inputs: [
          {
            name: '_tokenContractAddress',
            type: 'address'
          }
        ],
        name: 'donateTokens',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: true,
        inputs: [],
        name: 'donationAddress',
        outputs: [
          {
            name: '',
            type: 'address'
          }
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      }
    ]

    // set up theCyber contract object using the ABI and the address.
    const theCyberContract = new this.web3.eth.Contract(
      theCyberABI,
      cyberAddress,
      {
        gas: 292929
      }
    )

    // set up a duplicate theCyber contract object via websocket-enabled web3.
    const theCyberWsContract = new this.wsWeb3.eth.Contract(
      theCyberABI,
      cyberAddress,
      {
        gas: 292929
      }
    )

    // set up theCyberUtil contract object using the ABI and the address.
    const theCyberUtilContract = new this.web3.eth.Contract(
      theCyberUtilABI,
      cyberUtilAddress,
      {
        gas: 7474747
      }
    )

    let members = new Array(256)

    // bind functions and initialize state
    this.updateToLatestBlock = this.updateToLatestBlock.bind(this)
    this.setBlockDetails = this.setBlockDetails.bind(this)
    this.setAccounts = this.setAccounts.bind(this)
    this.setBalanceState = this.setBalanceState.bind(this)
    this.setAccountInformation = this.setAccountInformation.bind(this)
    this.getMembers = this.getMembers.bind(this)
    this.getAccountMembershipStatus = this.getAccountMembershipStatus.bind(this)
    this.getMemberInfo = this.getMemberInfo.bind(this)
    this.getMemberDetails = this.getMemberDetails.bind(this)
    this.getDonationAddress = this.getDonationAddress.bind(this)

    this.setEvents = this.setEvents.bind(this)
    this.filterEvents = this.filterEvents.bind(this)
    this.filterAllEvents = this.filterAllEvents.bind(this)
    this.filterPersonalEvents = this.filterPersonalEvents.bind(this)
    this.filterMessagesEvents = this.filterMessagesEvents.bind(this)
    this.filterMembershipChangeEvents = this.filterMembershipChangeEvents.bind(this)

    this.broadcastMessage = this.broadcastMessage.bind(this)
    this.directMessage = this.directMessage.bind(this)
    this.callExternal = this.callExternal.bind(this)
    this.setMemberName = this.setMemberName.bind(this)
    this.setMemberKey = this.setMemberKey.bind(this)
    this.sendMemberHeartbeat = this.sendMemberHeartbeat.bind(this)
    this.transferMembership = this.transferMembership.bind(this)
    this.addMember = this.addMember.bind(this)
    this.markMemberInactive = this.markMemberInactive.bind(this)
    this.revokeMember = this.revokeMember.bind(this)
    this.donateFunds = this.donateFunds.bind(this)
    this.donateTokens = this.donateTokens.bind(this)
    this.inactivateSelf = this.inactivateSelf.bind(this)
    this.revokeSelf = this.revokeSelf.bind(this)
    this.inactivateAll = this.inactivateAll.bind(this)
    this.revokeAll = this.revokeAll.bind(this)
    this.heartbeatUtil = this.heartbeatUtil.bind(this)

    this.onDrop = this.onDrop.bind(this)
    this.onDropPrivate = this.onDropPrivate.bind(this)
    this.generateKeypair = this.generateKeypair.bind(this)
    this.downloadKeypair = this.downloadKeypair.bind(this)
    this.wipeKeysAndPassphrase = this.wipeKeysAndPassphrase.bind(this)
    this.decryptMessages = this.decryptMessages.bind(this)
    this.getPassphrase = this.getPassphrase.bind(this)
    this.decryptPrivateKey = this.decryptPrivateKey.bind(this)
    this.clearTransactionState = this.clearTransactionState.bind(this)
    this.clearTransactionPool = this.clearTransactionPool.bind(this)
    this.blinkCursor = this.blinkCursor.bind(this)

    this.handleBroadcastFormChange = this.handleBroadcastFormChange.bind(this)
    this.handleDirectMessageFormChange = this.handleDirectMessageFormChange.bind(this)
    this.handleEncryptMessageCheckboxChange = this.handleEncryptMessageCheckboxChange.bind(this)
    this.handleDirectIdFormChange = this.handleDirectIdFormChange.bind(this)
    this.handleExternalMessageFormChange = this.handleExternalMessageFormChange.bind(this)
    this.handleExternalAddressFormChange = this.handleExternalAddressFormChange.bind(this)
    this.handleNameFormChange = this.handleNameFormChange.bind(this)
    this.handleTransferAddressFormChange = this.handleTransferAddressFormChange.bind(this)
    this.handleInactiveIdFormChange = this.handleInactiveIdFormChange.bind(this)
    this.handleRevokedIdFormChange = this.handleRevokedIdFormChange.bind(this)
    this.handleNewMemberIdFormChange = this.handleNewMemberIdFormChange.bind(this)
    this.handleNewMemberNameFormChange = this.handleNewMemberNameFormChange.bind(this)
    this.handleNewMemberAddressFormChange = this.handleNewMemberAddressFormChange.bind(this)
    this.handleTokenAddressFormChange = this.handleTokenAddressFormChange.bind(this)

    this.state = {
      networkId: networkId,
      hasWeb3: false,
      loading: true,
      isSyncing: null,
      syncObject: false,
      block: {number: null},
      accounts: {},
      txpool: {},
      testTransactionStatus: {
        color: 'black',
        message: 'Send test transaction'
      },
      addMemberStatus: {
        color: 'black',
        message: 'set member'
      },
      markMemberInactiveStatus: {
        color: 'black',
        message: 'set inactive'
      },
      revokeMemberStatus: {
        color: 'black',
        message: 'set revoked'
      },
      setMemberNameStatus: {
        color: 'black',
        message: 'set name'
      },
      setMemberKeyStatus: {
        color: 'black',
        message: 'set key'
      },
      heartbeatStatus: {
        color: 'black',
        message: 'set active'
      },
      setMessageStatus: {
        color: 'black',
        message: 'broadcast message'
      },
      setDirectMessageStatus: {
        color: 'black',
        message: 'direct message'
      },
      transferMembershipStatus: {
        color: 'black',
        message: 'set transferred'
      },
      callExternalStatus: {
        color: 'black',
        message: 'external message'
      },
      donateFundsStatus: {
        color: 'black',
        message: 'donate ether'
      },
      donateTokensStatus: {
        color: 'black',
        message: 'donate ERC20'
      },
      inactivateSelfStatus: {
        color: 'black',
        message: 'inactivate membership'
      },
      revokeSelfStatus: {
        color: 'black',
        message: 'revoke membership'
      },
      inactivateAllStatus: {
        color: 'black',
        message: 'inactivate all'
      },
      revokeAllStatus: {
        color: 'black',
        message: 'revoke all'
      },
      heartbeatUtilStatus: {
        color: 'black',
        message: 'heartbeat util'
      },
      members: members,
      events: {},
      filteredEvents: {},
      newMemberEvents: [],
      newMemberNameEvents: [],
      newMemberKeyEvents: [],
      membershipTransferredEvents: [],
      memberProclaimedInactiveEvents: [],
      memberHeartbeatedEvents: [],
      membershipRevokedEvents: [],
      messageEvents: [],
      directMessageEvents: [],
      callEvents: [],
      fundsDonatedEvents: [],
      tokensDonatedEvents: [],
      updateIntervalId: null,
      theCyberContract: theCyberContract,
      theCyberWsContract: theCyberWsContract,
      cyberAddress: cyberAddress,
      theCyberUtilContract: theCyberUtilContract,
      cyberUtilAddress: cyberUtilAddress,
      contractDeployedBlock: contractDeployedBlock,
      donationAddress: false,
      eventsSet: false,
      foundMember: null,
      memberAccount: {
        address: null,
        balance: null
      },
      memberAccountIndex: null,
      memberId: null,
      memberName: null,
      memberKey: null,
      memberKeyFingerprint: null,
      memberSince: null,
      memberInactiveSince: null,
      droppedMemberPublicKey: false,
      droppedMemberPrivateKey: false,
      generatingKeypair: false,
      passphrase: '',
      keyDecrypted: null,
      showCursor: true,
      messageBody: '',
      consoleShift: false,
      broadcastForm: '',
      directMessageForm: '',
      willEncryptDirectMessage: false,
      directIdForm: '',
      externalMessageForm: '',
      externalAddressForm: '',
      nameForm: '',
      transferAddressForm: '',
      inactiveIdForm: '',
      revokedIdForm: '',
      newMemberIdForm: '',
      newMemberNameForm: '',
      newMemberAddressForm: '',
      tokenAddressForm: '',
      filterAllStatus: {
        color: 'black',
        textColor: 'white'
      },
      filterPersonalStatus: {
        color: 'black',
        textColor: 'white'
      },
      filterMessagesStatus: {
        color: 'black',
        textColor: 'white'
      },
      filterMembershipChangeStatus: {
        color: 'black',
        textColor: 'white'
      }
    }
  }

  async componentDidMount() {
    // check if the blockchain is syncing & ensure that web3 is working
    this.web3.eth.isSyncing()
      .then(syncObject => {
        // get latest block / wallet information & set up polling for updates
        this.updateToLatestBlock()
        const intervalId = setInterval(this.updateToLatestBlock, 500)

        // set up the blinking cursor in the header console
        setInterval(this.blinkCursor, 650)

        this.setState({
          hasWeb3: true,
          isSyncing: (syncObject ? true : false),
          syncObject: syncObject,
          updateIntervalId: intervalId
        })

        return Promise.resolve(true)
      })
      .catch(error => {
        console.error(error)
        this.setState({
          hasWeb3: false,
          loading: false
        })

        return Promise.reject(false)
      })
  }

  handleBroadcastFormChange(event) {
    this.setState({
      broadcastForm: event.target.value
    })
  }

  handleDirectMessageFormChange(event) {
    this.setState({
      directMessageForm: event.target.value
    })
  }

  handleEncryptMessageCheckboxChange() {
    if ((typeof this.state.members[this.state.directIdForm] !== 'undefined') &&
        (this.state.members[this.state.directIdForm].memberKey)) {
      this.setState({
        willEncryptDirectMessage: !this.state.willEncryptDirectMessage
      })
    } else {
      this.setState({
        willEncryptDirectMessage: false
      })
    }
  }

  handleDirectIdFormChange(event) {
    if ((typeof this.state.members[event.target.value] !== 'undefined') &&
        (this.state.members[event.target.value].memberKey)) {
      this.setState({
        directIdForm: event.target.value,
        willEncryptDirectMessage: true
      })
    } else {
      this.setState({
        directIdForm: event.target.value,
        willEncryptDirectMessage: false
      })
    }
  }

  handleExternalMessageFormChange(event) {
    this.setState({
      externalMessageForm: event.target.value
    })
  }

  handleExternalAddressFormChange(event) {
    if (event.target.value.length < 43) {
      this.setState({
        externalAddressForm: event.target.value
      })
    }
  }

  handleNameFormChange(event) {
    if (event.target.value.length < 33) {
      this.setState({
        nameForm: event.target.value
      })
    }
  }

  handleTransferAddressFormChange(event) {
    if (event.target.value.length < 43) {
      this.setState({
        transferAddressForm: event.target.value
      })
    }
  }

  handleInactiveIdFormChange(event) {
    this.setState({
      inactiveIdForm: event.target.value
    })
  }

  handleRevokedIdFormChange(event) {
    this.setState({
      revokedIdForm: event.target.value
    })
  }

  handleNewMemberIdFormChange(event) {
    this.setState({
      newMemberIdForm: event.target.value
    })
  }

  handleNewMemberNameFormChange(event) {
    if (event.target.value.length < 33) {
      this.setState({
        newMemberNameForm: event.target.value
      })
    }
  }

  handleNewMemberAddressFormChange(event) {
    if (event.target.value.length < 43) {
      this.setState({
        newMemberAddressForm: event.target.value
      })
    }
  }

  handleTokenAddressFormChange(event) {
    if (event.target.value.length < 43) {
      this.setState({
        tokenAddressForm: event.target.value
      })
    }
  }

  onDrop(files) {
    console.log('reading imported file...')
    let reader = new FileReader()

    reader.onload = () => {
      this.setState({
        droppedMemberPublicKey: reader.result
      })
    }

    reader.readAsText(files[0])
  }

  onDropPrivate(files) {
    console.log('reading imported file...')
    let reader = new FileReader()

    reader.onload = () => {
      this.setState({
        droppedMemberPrivateKey: reader.result
      }, () => {
        this.getPassphrase().then(() => {
          console.log('decrypting private key...')
          this.decryptPrivateKey().then(() => {
            console.log('decrypting messages...')
            this.decryptMessages()
          })
        })
      })
    }

    reader.readAsText(files[0])
  }

  generateKeypair(bits) {
    let bitsChoice = 4096
    if (bits !== bitsChoice) {
      bitsChoice = 2048
    }
    const name = this.state.memberName ? this.state.memberName : 'noNameSet'
    const email = `${name}@theCyber.eth`

    const message = 'Enter the passphrase for your new private key ' +
                    '(or leave empty for no passphrase):'
    let passphrase = prompt(message, '')
    if (passphrase !== null) {
      passphrase = ''
    }

    let options = {
      userIds: [{name: name, email: email}],
      numBits: bitsChoice,
      passphrase: passphrase
    }

    console.log(`generating ${bitsChoice}-bit keypair, please wait...`)
    this.setState({
      generatingKeypair: true,
      passphrase: passphrase
    }, () => {
      openpgp.generateKey(options).then(key => {
        const privkey = key.privateKeyArmored
        const pubkey = key.publicKeyArmored
        console.log('successfully generated new keypair.')
        this.setState({
          generatingKeypair: false,
          droppedMemberPublicKey: pubkey,
          droppedMemberPrivateKey: privkey
        })
      })
    })
  }

  downloadKeypair() {
    const contentType = 'data:application/x-pem-file;charset=utf-8,'
    const privkey = this.state.droppedMemberPrivateKey
    if (privkey) {
      let element = document.createElement('a')
      element.setAttribute('href', contentType + encodeURIComponent(privkey))
      element.setAttribute('download', 'theCyberKey.pem')
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }

    const pubkey = this.state.droppedMemberPublicKey
    const onChainKey = this.state.memberKey
    if (pubkey) {
      let element = document.createElement('a')
      element.setAttribute('href', contentType + encodeURIComponent(pubkey))
      element.setAttribute('download', 'theCyberKey.pub')
      element.style.display = 'none'
      setTimeout(() => {
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
      }, 100)
    } else if (onChainKey) {
      let element = document.createElement('a')
      element.setAttribute('href', contentType + encodeURIComponent(onChainKey))
      element.setAttribute('download', 'theCyberKey.pub')
      element.style.display = 'none'
      setTimeout(() => {
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
      }, 100)
    }
  }

  wipeKeysAndPassphrase() {
    this.setState({
      droppedMemberPrivateKey: false,
      droppedMemberPublicKey: false,
      passphrase: ''
    }, () => {
      console.log('wiped locally stored keys and passphrase.')
    })
  }

  setEvents() {
    if (!this.state.eventsSet) {
      console.log('getting event histories...')
      this.setState({
        eventsSet: true
      })

      // NOTE: For mainnet, we'll use websockets via infura if web3 is over http

      // NOTE: we may not be interested in collecting ALL of the event histories
      // going back to the block where the contract was deployed, especially if
      // it slows down load times significantly. Consider using something like
      // max(`contractDeployedBlock`, (`latest` - <desiredHistoryLength>)).

      // TODO: use event indexed fields for filtering based on category

      // add a listener for new member events
      this.state.theCyberWsContract.events.NewMember(
        {},
        {fromBlock: this.state.contractDeployedBlock, toBlock: 'latest'}
      ).on('data', event => {
        // update txpool (this is needed for now when using infura endpoints)
        if (Object.keys(this.state.txpool).includes(event.transactionHash) &&
            this.state.txpool[event.transactionHash].confirmed === false) {
          // mark the UI for the event type as confirmed and clear from txpool
          let txpool = this.state.txpool
          txpool[event.transactionHash].confirmed = true
          this.setState({
            txpool: txpool,
            addMemberStatus: {
              color: 'darkGreen',
              message: 'Added member.'
            }
          })
        }

        const message = `new member @ ${
          event.returnValues.memberAddress
        } ${this.web3.utils.toAscii(event.returnValues.memberName)}`
        console.log(message)
        this.state.newMemberEvents.push(event)
        this.web3.eth.getBlock(event.blockNumber).then(block => {
          const stamp = block.timestamp + (event.logIndex / 1000)
          let events = this.state.events
          events[stamp] = {
            event: event,
            type: 'NewMember',
            block: event.blockNumber,
            member: event.returnValues.memberId,
            timestamp: (
              block.timestamp ?
                moment.unix(block.timestamp).format('MM/DD/YY hh:mm:ss a') :
                '...'
            ),
            message: message
          }
          this.setState({
            events: events
          }, () => {
            this.filterEvents(this.state.filterType)
          })
        })
      }).on('error', error => {
        console.error(error)
      })

      // add a listener for new member name events
      this.state.theCyberWsContract.events.NewMemberName(
        {},
        {fromBlock: this.state.contractDeployedBlock, toBlock: 'latest'}
      ).on('data', event => {
        const message = `new member name: '${
          this.web3.utils.toAscii(event.returnValues.newMemberName)}'`
        console.log(message)
        this.state.newMemberNameEvents.push(event)
        this.web3.eth.getBlock(event.blockNumber).then(block => {
          const stamp = block.timestamp + (event.logIndex / 1000)
          let events = this.state.events
          events[stamp] = {
            event: event,
            type: 'NewMemberName',
            block: event.blockNumber,
            member: event.returnValues.memberId,
            timestamp: (
              block.timestamp ?
                moment.unix(block.timestamp).format('MM/DD/YY hh:mm:ss a') :
                '...'
            ),
            message: message
          }
          this.setState({
            events: events
          }, () => {
            this.filterEvents(this.state.filterType)
          })
        })
      }).on('error', error => {
        console.error(error)
      })

      // add a listener for new member key events
      this.state.theCyberWsContract.events.NewMemberKey(
        {},
        {fromBlock: this.state.contractDeployedBlock, toBlock: 'latest'}
      ).on('data', event => {
        const pubkey = openpgp.key.readArmored(event.returnValues.newMemberKey).keys.pop()
        const fingerprint = (
          (pubkey && pubkey.primaryKey && pubkey.primaryKey.fingerprint) ?
            pubkey.primaryKey.fingerprint.match(/.{4}/g).join(':') :
            '(unknown fingerprint)'
        )
        const message = `new member key: ${fingerprint}`
        this.state.newMemberKeyEvents.push(event)
        this.web3.eth.getBlock(event.blockNumber).then(block => {
          const stamp = block.timestamp + (event.logIndex / 1000)
          let events = this.state.events
          events[stamp] = {
            event: event,
            type: 'NewMemberKey',
            block: event.blockNumber,
            member: event.returnValues.memberId,
            timestamp: (
              block.timestamp ?
                moment.unix(block.timestamp).format('MM/DD/YY hh:mm:ss a') :
                '...'
            ),
            message: message
          }
          this.setState({
            events: events
          }, () => {
            this.filterEvents(this.state.filterType)
          })
        })
      }).on('error', error => {
        console.error(error)
      })

      // add a listener for membership transfer events
      this.state.theCyberWsContract.events.MembershipTransferred(
        {},
        {fromBlock: this.state.contractDeployedBlock, toBlock: 'latest'}
      ).on('data', event => {
        const message = `membership transferred to ${event.returnValues.newMemberAddress}`
        console.log(message)
        this.web3.eth.getBlock(event.blockNumber).then(block => {
          const stamp = block.timestamp + (event.logIndex / 1000)
          let events = this.state.events
          events[stamp] = {
            event: event,
            type: 'MembershipTransferred',
            block: event.blockNumber,
            member: event.returnValues.memberId,
            timestamp: (
              block.timestamp ?
                moment.unix(block.timestamp).format('MM/DD/YY hh:mm:ss a') :
                '...'
            ),
            message: message
          }
          this.setState({
            events: events
          }, () => {
            this.filterEvents(this.state.filterType)
          })
        })
        this.state.membershipTransferredEvents.push(event)
      }).on('error', error => {
        console.error(error)
      })

      // add a listener for membership inactivity proclamation events
      this.state.theCyberWsContract.events.MemberProclaimedInactive(
        {},
        {fromBlock: this.state.contractDeployedBlock, toBlock: 'latest'}
      ).on('data', event => {
        const message = `member proclaimed inactive by ${event.returnValues.proclaimingMemberId}`
        console.log(message)
        this.state.memberProclaimedInactiveEvents.push(event)
        this.web3.eth.getBlock(event.blockNumber).then(block => {
          const stamp = block.timestamp + (event.logIndex / 1000)
          let events = this.state.events
          events[stamp] = {
            event: event,
            type: 'MemberProclaimedInactive',
            block: event.blockNumber,
            member: event.returnValues.memberId,
            timestamp: (
              block.timestamp ?
                moment.unix(block.timestamp).format('MM/DD/YY hh:mm:ss a') :
                '...'
            ),
            message: message
          }
          this.setState({
            events: events
          }, () => {
            this.filterEvents(this.state.filterType)
          })
        })
      }).on('error', error => {
        console.error(error)
      })

      // add a listener for member heatbeat events
      this.state.theCyberWsContract.events.MemberHeartbeated(
        {},
        {fromBlock: this.state.contractDeployedBlock, toBlock: 'latest'}
      ).on('data', event => {
        console.log('event from transaction:', event.transactionHash)
        // update txpool (this is needed for now when using infura endpoints)
        if (Object.keys(this.state.txpool).includes(event.transactionHash)) {
          // mark the UI for the event type as confirmed and clear from txpool
          console.log('found event in txpool!')
          let txpool = this.state.txpool
          txpool[event.transactionHash].confirmed = true
          this.setState({
            txpool: txpool,
            heartbeatStatus: {
              color: 'darkGreen',
              message: 'Sent Heartbeat.'
            }
          })
        }

        const message = 'member heartbeated'
        console.log(message)
        this.state.memberHeartbeatedEvents.push(event)
        this.web3.eth.getBlock(event.blockNumber).then(block => {
          const stamp = block.timestamp + (event.logIndex / 1000)
          let events = this.state.events
          events[stamp] = {
            event: event,
            type: 'MemberHeartbeated',
            block: event.blockNumber,
            member: event.returnValues.memberId,
            timestamp: (
              block.timestamp ?
                moment.unix(block.timestamp).format('MM/DD/YY hh:mm:ss a') :
                '...'
            ),
            message: message
          }
          this.setState({
            events: events
          }, () => {
            this.filterEvents(this.state.filterType)
          })
        })
      }).on('error', error => {
        console.error(error)
      })

      // add a listener for member revokation events
      this.state.theCyberWsContract.events.MembershipRevoked(
        {},
        {fromBlock: this.state.contractDeployedBlock, toBlock: 'latest'}
      ).on('data', event => {
        const message = `membership revoked by ${event.returnValues.revokingMemberId}`
        console.log(message)
        this.state.membershipRevokedEvents.push(event)
        this.web3.eth.getBlock(event.blockNumber).then(block => {
          const stamp = block.timestamp + (event.logIndex / 1000)
          let events = this.state.events
          events[stamp] = {
            event: event,
            type: 'MembershipRevoked',
            block: event.blockNumber,
            member: event.returnValues.memberId,
            timestamp: (
              block.timestamp ?
                moment.unix(block.timestamp).format('MM/DD/YY hh:mm:ss a') :
                '...'
            ),
            message: message
          }
          this.setState({
            events: events
          }, () => {
            this.filterEvents(this.state.filterType)
          })
        })
      }).on('error', error => {
        console.error(error)
      })

      // add a listener for broadcast message events
      this.state.theCyberWsContract.events.BroadcastMessage(
        {},
        {fromBlock: this.state.contractDeployedBlock, toBlock: 'latest'}
      ).on('data', event => {
        const messageContents = (
          event.returnValues.message.length === 0 ?
            '<empty message body>' :
            event.returnValues.message
        )

        const message = `broadcast message:\n${messageContents}`
        console.log(message)
        this.state.messageEvents.push(event)
        this.web3.eth.getBlock(event.blockNumber).then(block => {
          const stamp = block.timestamp + (event.logIndex / 1000)
          let events = this.state.events
          events[stamp] = {
            event: event,
            type: 'BroadcastMessage',
            block: event.blockNumber,
            member: event.returnValues.memberId,
            timestamp: (
              block.timestamp ?
                moment.unix(block.timestamp).format('MM/DD/YY hh:mm:ss a') :
                '...'
            ),
            message: message
          }
          this.setState({
            events: events
          }, () => {
            this.filterEvents(this.state.filterType)
          })
        })
      }).on('error', error => {
        console.error(error)
      })

      // add a listener for direct message events
      this.state.theCyberWsContract.events.DirectMessage(
        {},
        {fromBlock: this.state.contractDeployedBlock, toBlock: 'latest'}
      ).on('data', event => {
        if (this.state.droppedMemberPrivateKey &&
            event.returnValues.message.startsWith('-----BEGIN PGP MESSAGE-----') &&
            String(event.returnValues.toMemberId) === String(this.state.memberId)) {
          this.decryptPrivateKey().then(result => {
            // seems like async functions cannot return tuples, so unpack array
            const privateKey = result[0]
            const decrypted = result[1]

            if (decrypted !== true) {
              throw new Error('could not decrypt the private key.')
            }
            openpgp.decrypt({
              message: openpgp.message.readArmored(event.returnValues.message),
              privateKey: privateKey
            }).then(plaintext => {
              const messageContents = `${plaintext.data}`
              const message = `direct message to member ${
                event.returnValues.toMemberId} (decrypted):\n${messageContents}`
              this.state.directMessageEvents.push(event)
              this.web3.eth.getBlock(event.blockNumber).then(block => {
                const stamp = block.timestamp + (event.logIndex / 1000)
                let events = this.state.events
                events[stamp] = {
                  event: event,
                  type: 'DirectMessage',
                  block: event.blockNumber,
                  member: event.returnValues.memberId,
                  timestamp: (
                    block.timestamp ?
                      moment.unix(block.timestamp).format('MM/DD/YY hh:mm:ss a') :
                      '...'
                  ),
                  message: message
                }
                this.setState({
                  events: events
                }, () => {
                  this.filterEvents(this.state.filterType)
                })
              })
            }).catch(error => {
              console.error(error)
              const messageContents = '<error decrypting encrypted message>'
              const message = `direct message to member ${
                event.returnValues.toMemberId}: ${messageContents}`
              this.state.directMessageEvents.push(event)
              this.web3.eth.getBlock(event.blockNumber).then(block => {
                const stamp = block.timestamp + (event.logIndex / 1000)
                let events = this.state.events
                events[stamp] = {
                  event: event,
                  type: 'DirectMessage',
                  block: event.blockNumber,
                  member: event.returnValues.memberId,
                  timestamp: (
                    block.timestamp ?
                      moment.unix(block.timestamp).format('MM/DD/YY hh:mm:ss a') :
                      '...'
                  ),
                  message: message
                }
                this.setState({
                  events: events
                }, () => {
                  this.filterEvents(this.state.filterType)
                })
              })
            })
          }).catch(error => {
            console.error(error)
          })
        } else {
          let messageContents = event.returnValues.message
          if (event.returnValues.message.startsWith('-----BEGIN PGP MESSAGE-----')) {
            messageContents = `<encrypted message - length ${event.returnValues.message.length}>`
          } else if (event.returnValues.message.length === 0) {
            messageContents = '<empty message body>'
          }
          const message = `direct message to member ${
            event.returnValues.toMemberId}: ${messageContents}`
          this.state.directMessageEvents.push(event)
          this.web3.eth.getBlock(event.blockNumber).then(block => {
            const stamp = block.timestamp + (event.logIndex / 1000)
            let events = this.state.events
            events[stamp] = {
              event: event,
              type: 'DirectMessage',
              block: event.blockNumber,
              member: event.returnValues.memberId,
              timestamp: (
                block.timestamp ?
                  moment.unix(block.timestamp).format('MM/DD/YY hh:mm:ss a') :
                  '...'
              ),
              message: message
            }
            this.setState({
              events: events
            }, () => {
              this.filterEvents(this.state.filterType)
            })
          })
        }
      }).on('error', error => {
        console.error(error)
      })

      // add a listener for events designating calls to external contracts
      this.state.theCyberWsContract.events.Call(
        {},
        {fromBlock: this.state.contractDeployedBlock, toBlock: 'latest'}
      ).on('data', event => {
        const message = `external call to ${
          event.returnValues.contractAddress} address: ${event.returnValues.message}`
        console.log(message)
        this.state.callEvents.push(event)
        this.web3.eth.getBlock(event.blockNumber).then(block => {
          const stamp = block.timestamp + (event.logIndex / 1000)
          let events = this.state.events
          events[stamp] = {
            event: event,
            type: 'Call',
            block: event.blockNumber,
            member: event.returnValues.memberId,
            timestamp: (
              block.timestamp ?
                moment.unix(block.timestamp).format('MM/DD/YY hh:mm:ss a') :
                '...'
            ),
            message: message
          }
          this.setState({
            events: events
          }, () => {
            this.filterEvents(this.state.filterType)
          })
        })
      }).on('error', error => {
        console.error(error)
      })

      // add a listener for fund donation events
      this.state.theCyberWsContract.events.FundsDonated(
        {},
        {fromBlock: this.state.contractDeployedBlock, toBlock: 'latest'}
      ).on('data', event => {
        const message = 'ether sent to donation address'
        console.log(message)
        this.state.fundsDonatedEvents.push(event)
        this.web3.eth.getBlock(event.blockNumber).then(block => {
          const stamp = block.timestamp + (event.logIndex / 1000)
          let events = this.state.events
          events[stamp] = {
            event: event,
            type: 'FundsDonated',
            block: event.blockNumber,
            member: event.returnValues.memberId,
            timestamp: (
              block.timestamp ?
                moment.unix(block.timestamp).format('MM/DD/YY hh:mm:ss a') :
                '...'
            ),
            message: message
          }
          this.setState({
            events: events
          }, () => {
            this.filterEvents(this.state.filterType)
          })
        })
      }).on('error', error => {
        console.error(error)
      })

      // add a listener for token donation events
      this.state.theCyberWsContract.events.TokensDonated(
        {},
        {fromBlock: this.state.contractDeployedBlock, toBlock: 'latest'}
      ).on('data', event => {
        const message = `tokens at ${
          event.returnValues.tokenContractAddress} sent to donation address`
        console.log(message)
        this.state.tokensDonatedEvents.push(event)
        this.web3.eth.getBlock(event.blockNumber).then(block => {
          const stamp = block.timestamp + (event.logIndex / 1000)
          let events = this.state.events
          events[stamp] = {
            event: event,
            type: 'TokensDonated',
            block: event.blockNumber,
            member: event.returnValues.memberId,
            timestamp: (
              block.timestamp ?
                moment.unix(block.timestamp).format('MM/DD/YY hh:mm:ss a') :
                '...'
            ),
            message: message
          }
          this.setState({
            events: events
          }, () => {
            this.filterEvents(this.state.filterType)
          })
        })
      }).on('error', error => {
        console.error(error)
      })
    }
    return Promise.resolve(true)
  }

  filterEvents(filterType) {
    if (filterType === 'all events') {
      this.setEvents().then(() => {
        this.setState({
          filteredEvents: this.state.events
        })
      })
    } else if (filterType === 'personal') {
      const filteredEvents = Object.keys(this.state.events).reduce((p, c) => {
        if ((String(this.state.events[c].member) === String(this.state.memberId)) ||
            ((this.state.events[c].type === 'DirectMessage') &&
             (String(
               this.state.events[c].event.returnValues.toMemberId
             ) === String(this.state.memberId)))) {
          p[c] = this.state.events[c]
        }
        return p
      }, {})

      this.setEvents().then(() => {
        this.setState({
          filteredEvents: filteredEvents
        })
      })
    } else if (filterType === 'messages') {
      const filteredEvents = Object.keys(this.state.events).reduce((p, c) => {
        if ((this.state.events[c].type === 'BroadcastMessage') ||
            ((this.state.events[c].type === 'DirectMessage') &&
             ((String(this.state.events[c].member) === String(this.state.memberId)) ||
              (String(
                this.state.events[c].event.returnValues.toMemberId
              ) === String(this.state.memberId)))) ||
            ((this.state.events[c].type === 'Call') &&
             (String(this.state.events[c].member) === String(this.state.memberId)))) {
          p[c] = this.state.events[c]
        }
        return p
      }, {})

      this.setEvents().then(() => {
        this.setState({
          filteredEvents: filteredEvents
        })
      })
    } else if (filterType === 'membership changes') {
      const validEventTypes = [
        'NewMember', 'NewMemberName', 'NewMemberKey', 'MembershipTransferred',
        'MemberProclaimedInactive', 'MemberHeartbeated', 'MembershipRevoked'
      ]
      const filteredEvents = Object.keys(this.state.events).reduce((p, c) => {
        if (validEventTypes.includes(this.state.events[c].type)) {
          p[c] = this.state.events[c]
        }
        return p
      }, {})

      this.setEvents().then(() => {
        this.setState({
          filteredEvents: filteredEvents
        })
      })
    }
  }

  addMember(memberId, memberName, memberAddress) {
    // TODO: validate memberAddress
    if (this.state.addMemberStatus.message.toLowerCase() === 'set member') {
      this.setState({
        addMemberStatus: {
          color: 'sienna',
          message: 'Sign transaction to continue...'
        }
      })
      this.state.theCyberContract.methods.newMember(
        memberId, this.web3.utils.utf8ToHex(memberName), memberAddress
      ).send({
        from: this.state.memberAccount.address
      }).on('transactionHash', hash => {
        console.log('transaction sent. Hash:', hash)
        let txpool = this.state.txpool
        txpool[hash] = {
          eventType: 'NewMember',
          confirmed: false,
          failed: false,
          submitted: moment().valueOf()
        }
        this.setState({
          txpool: txpool,
          addMemberStatus: {
            color: 'darkBlue',
            message: 'Pending...'
          }
        })
      }).on('receipt', receipt => {
        console.log('transaction included in block. Receipt:', receipt)
        let txpool = this.state.txpool
        if (receipt.status === '0x0') {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
            txpool[receipt.transactionHash].failed = true
          }
          this.setState({
            txpool: txpool,
            addMemberStatus: {
              color: 'darkRed',
              message: 'Could not add member.'
            }
          })
        } else {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
          }

          this.setState({
            txpool: txpool,
            addMemberStatus: {
              color: 'darkGreen',
              message: 'Added member.'
            }
          })
        }
      }).on('confirmation', (confirmationNumber) => {
        console.log('transaction confirmations:', confirmationNumber)
      }).on('error', (error, receipt) => {
        let txpool = this.state.txpool
        if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
            this.state.txpool[receipt.transactionHash].confirmed === false) {
          txpool[receipt.transactionHash].failed = true
        }
        this.setState({
          txpool: txpool,
          addMemberStatus: {
            color: 'darkRed',
            message: 'Could not add member.'
          }
        })
        console.error(error)
      })
    }
  }

  markMemberInactive(memberId) {
    if (this.state.markMemberInactiveStatus.message === 'set inactive') {
      this.setState({
        markMemberInactiveStatus: {
          color: 'sienna',
          message: 'Sign transaction to continue...'
        }
      })
      this.state.theCyberContract.methods.proclaimInactive(
        memberId
      ).send({
        from: this.state.memberAccount.address
      }).on('transactionHash', hash => {
        console.log('transaction sent. Hash:', hash)
        let txpool = this.state.txpool
        txpool[hash] = {
          eventType: 'MemberProclaimedInactive',
          confirmed: false,
          failed: false,
          submitted: moment().valueOf()
        }
        this.setState({
          txpool: txpool,
          markMemberInactiveStatus: {
            color: 'darkBlue',
            message: 'Pending...'
          }
        })
      }).on('receipt', receipt => {
        console.log('transaction included in block. Receipt:', receipt)
        let txpool = this.state.txpool
        if (receipt.status === '0x0') {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
            txpool[receipt.transactionHash].failed = true
          }
          this.setState({
            txpool: txpool,
            markMemberInactiveStatus: {
              color: 'darkRed',
              message: 'Could not mark member as inactive.'
            }
          })
        } else {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
          }

          this.setState({
            txpool: txpool,
            markMemberInactiveStatus: {
              color: 'darkGreen',
              message: 'Marked member as inactive.'
            }
          })
        }
      }).on('confirmation', (confirmationNumber) => {
        console.log('transaction confirmations:', confirmationNumber)
      }).on('error', (error, receipt) => {
        let txpool = this.state.txpool
        if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
            this.state.txpool[receipt.transactionHash].confirmed === false) {
          txpool[receipt.transactionHash].failed = true
        }
        this.setState({
          txpool: txpool,
          markMemberInactiveStatus: {
            color: 'darkRed',
            message: 'Could not mark member as inactive.'
          }
        })
        console.error(error)
      })
    }
  }

  revokeMember(memberId) {
    if (this.state.revokeMemberStatus.message === 'set revoked') {
      this.setState({
        revokeMemberStatus: {
          color: 'sienna',
          message: 'Sign transaction to continue...'
        }
      })
      this.state.theCyberContract.methods.revokeMembership(
        memberId
      ).send({
        from: this.state.memberAccount.address
      }).on('transactionHash', hash => {
        console.log('transaction sent. Hash:', hash)
        let txpool = this.state.txpool
        txpool[hash] = {
          eventType: 'MembershipRevoked',
          confirmed: false,
          failed: false,
          submitted: moment().valueOf()
        }
        this.setState({
          txpool: txpool,
          revokeMemberStatus: {
            color: 'darkBlue',
            message: 'Pending...'
          }
        })
      }).on('receipt', receipt => {
        console.log('transaction included in block. Receipt:', receipt)
        let txpool = this.state.txpool
        if (receipt.status === '0x0') {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
            txpool[receipt.transactionHash].failed = true
          }
          this.setState({
            txpool: txpool,
            revokeMemberStatus: {
              color: 'darkRed',
              message: 'Could not revoke membership.'
            }
          })
        } else {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
          }

          this.setState({
            txpool: txpool,
            revokeMemberStatus: {
              color: 'darkGreen',
              message: 'Membership revoked.'
            }
          })
        }
      }).on('confirmation', (confirmationNumber) => {
        console.log('transaction confirmations:', confirmationNumber)
      }).on('error', (error, receipt) => {
        let txpool = this.state.txpool
        if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
            this.state.txpool[receipt.transactionHash].confirmed === false) {
          txpool[receipt.transactionHash].failed = true
        }
        this.setState({
          txpool: txpool,
          revokeMemberStatus: {
            color: 'darkRed',
            message: 'Could not revoke membership.'
          }
        })
        console.error(error)
      })
    }
  }

  setMemberName(name) {
    if (this.state.setMemberNameStatus.message === 'set name') {
      this.setState({
        setMemberNameStatus: {
          color: 'sienna',
          message: 'Sign transaction to continue...'
        }
      })
      this.state.theCyberContract.methods.changeName(
        this.web3.utils.utf8ToHex(name)
      ).send({
        from: this.state.memberAccount.address
      }).on('transactionHash', hash => {
        console.log('transaction sent. Hash:', hash)
        let txpool = this.state.txpool
        txpool[hash] = {
          eventType: 'NewMemberName',
          confirmed: false,
          failed: false,
          submitted: moment().valueOf()
        }
        this.setState({
          txpool: txpool,
          setMemberNameStatus: {
            color: 'darkBlue',
            message: 'Pending...'
          }
        })
      }).on('receipt', receipt => {
        console.log('transaction included in block. Receipt:', receipt)
        let txpool = this.state.txpool
        if (receipt.status === '0x0') {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
            txpool[receipt.transactionHash].failed = true
          }
          this.setState({
            txpool: txpool,
            revokeMemberStatus: {
              color: 'darkRed',
              message: 'Could not set name.'
            }
          })
        } else {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
          }
          this.setState({
            txpool: txpool,
            setMemberNameStatus: {
              color: 'darkGreen',
              message: 'Set name.'
            },
            memberName: name
          })
        }
      }).on('confirmation', (confirmationNumber) => {
        console.log('transaction confirmations:', confirmationNumber)
      }).on('error', (error, receipt) => {
        let txpool = this.state.txpool
        if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
            this.state.txpool[receipt.transactionHash].confirmed === false) {
          txpool[receipt.transactionHash].failed = true
        }
        this.setState({
          txpool: txpool,
          setMemberNameStatus: {
            color: 'darkRed',
            message: 'Could not set name.'
          }
        })
        console.error(error)
      })
    }
  }

  setMemberKey(key) {
    if (key === false) {
      this.setState({
        setMemberKeyStatus: {
          color: 'darkRed',
          message: 'Could not find a key to set.'
        }
      })
      return
    }
    if (this.state.setMemberKeyStatus.message === 'set key') {
      this.setState({
        setMemberKeyStatus: {
          color: 'sienna',
          message: 'Sign transaction to continue...'
        }
      })
      this.state.theCyberContract.methods.changeKey(
        key
      ).send({
        from: this.state.memberAccount.address,
        gas: 7777777
      }).on('transactionHash', hash => {
        console.log('transaction sent. Hash:', hash)
        let txpool = this.state.txpool
        txpool[hash] = {
          eventType: 'NewMemberKey',
          confirmed: false,
          failed: false,
          submitted: moment().valueOf()
        }
        this.setState({
          txpool: txpool,
          setMemberKeyStatus: {
            color: 'darkBlue',
            message: 'Pending...'
          }
        })
      }).on('receipt', receipt => {
        console.log('transaction included in block. Receipt:', receipt)
        let txpool = this.state.txpool
        if (receipt.status === '0x0') {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
            txpool[receipt.transactionHash].failed = true
          }
          this.setState({
            txpool: txpool,
            setMemberKeyStatus: {
              color: 'darkRed',
              message: 'Could not set key.'
            }
          })
        } else {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
          }

          this.setState({
            txpool: txpool,
            setMemberKeyStatus: {
              color: 'darkGreen',
              message: 'Set key.'
            }
          })
        }
      }).on('confirmation', (confirmationNumber) => {
        console.log('transaction confirmations:', confirmationNumber)
      }).on('error', (error, receipt) => {
        let txpool = this.state.txpool
        if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
            this.state.txpool[receipt.transactionHash].confirmed === false) {
          txpool[receipt.transactionHash].failed = true
        }
        this.setState({
          txpool: txpool,
          setMemberKeyStatus: {
            color: 'darkRed',
            message: 'Could not set key.'
          }
        })
        console.error(error)
      })
    }
  }

  sendMemberHeartbeat() {
    if (this.state.heartbeatStatus.message === 'set active') {
      this.setState({
        heartbeatStatus: {
          color: 'sienna',
          message: 'Sign transaction to continue...'
        }
      })
      this.state.theCyberContract.methods.heartbeat(
      ).send({
        from: this.state.memberAccount.address
      }).on('transactionHash', hash => {
        console.log('transaction sent. Hash:', hash)
        let txpool = this.state.txpool
        txpool[hash] = {
          eventType: 'MemberHeartbeated',
          confirmed: false,
          failed: false,
          submitted: moment().valueOf()
        }
        this.setState({
          txpool: txpool,
          heartbeatStatus: {
            color: 'darkBlue',
            message: 'Pending...'
          }
        })
      }).on('receipt', receipt => {
        console.log('transaction included in block. Receipt:', receipt)
        let txpool = this.state.txpool
        if (receipt.status === '0x0') {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
            txpool[receipt.transactionHash].failed = true
          }
          this.setState({
            txpool: txpool,
            heartbeatStatus: {
              color: 'darkRed',
              message: 'Could not send heartbeat.'
            }
          })
        } else {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
          }

          this.setState({
            txpool: txpool,
            heartbeatStatus: {
              color: 'darkGreen',
              message: 'Sent Heartbeat.'
            }
          })
        }
      }).on('confirmation', (confirmationNumber) => {
        console.log('transaction confirmations:', confirmationNumber)
      }).on('error', (error, receipt) => {
        let txpool = this.state.txpool
        if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
            this.state.txpool[receipt.transactionHash].confirmed === false) {
          txpool[receipt.transactionHash].failed = true
        }
        this.setState({
          txpool: txpool,
          heartbeatStatus: {
            color: 'darkRed',
            message: 'Could not send heartbeat.'
          }
        })
        console.error(error)
      })
    }
  }

  broadcastMessage(message) {
    if (this.state.setMessageStatus.message === 'broadcast message') {
      this.setState({
        setMessageStatus: {
          color: 'sienna',
          message: 'Sign transaction to continue...'
        }
      })
      this.state.theCyberContract.methods.broadcastMessage(
        message
      ).send({
        from: this.state.memberAccount.address
      }).on('transactionHash', hash => {
        console.log('transaction sent. Hash:', hash)
        let txpool = this.state.txpool
        txpool[hash] = {
          eventType: 'BroadcastMessage',
          confirmed: false,
          failed: false,
          submitted: moment().valueOf()
        }
        this.setState({
          txpool: txpool,
          setMessageStatus: {
            color: 'darkBlue',
            message: 'Pending...'
          }
        })
      }).on('receipt', receipt => {
        console.log('transaction included in block. Receipt:', receipt)
        let txpool = this.state.txpool
        if (receipt.status === '0x0') {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
            txpool[receipt.transactionHash].failed = true
          }
          this.setState({
            txpool: txpool,
            setMessageStatus: {
              color: 'darkRed',
              message: 'Could not send message.'
            }
          })
        } else {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
          }

          this.setState({
            txpool: txpool,
            setMessageStatus: {
              color: 'darkGreen',
              message: 'Sent message.'
            }
          })
        }
      }).on('confirmation', (confirmationNumber) => {
        console.log('transaction confirmations:', confirmationNumber)
      }).on('error', (error, receipt) => {
        let txpool = this.state.txpool
        if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
            this.state.txpool[receipt.transactionHash].confirmed === false) {
          txpool[receipt.transactionHash].failed = true
        }
        this.setState({
          txpool: txpool,
          setMessageStatus: {
            color: 'darkRed',
            message: 'Could not send message.'
          }
        })
        console.error(error)
      })
    }
  }

  async decryptPrivateKey() {
    let key = openpgp.key.readArmored(this.state.droppedMemberPrivateKey).keys[0]
    const decrypted = await key.decrypt(this.state.passphrase) // TODO: error handling
    this.setState({
      keyDecrypted: !!decrypted
    }, () => {
      console.log('keyDecrypted:', this.state.keyDecrypted)
    })
    return [key, decrypted]
  }

  directMessage(toMemberId, message) {
    if (this.state.setDirectMessageStatus.message === 'direct message') {
      this.setState({
        setDirectMessageStatus: {
          color: 'sienna',
          message: 'Sign transaction to continue...'
        }
      })

      // determine if message can be encrypted (and the flag is not deactivated)
      const key = (
        toMemberId in this.state.members ?
          this.state.members[toMemberId].memberKey :
          false
      )
      if (key && this.state.willEncryptDirectMessage) {
        // if so, encrypt the message
        const encryptOptions = {
          data: message,
          publicKeys: openpgp.key.readArmored(key).keys
          //privateKeys: privKeyObj  // for signing
        }

        openpgp.encrypt(encryptOptions)
          .then(ciphertext => {
            this.state.theCyberContract.methods.directMessage(
              toMemberId,
              ciphertext.data
            ).send({
              from: this.state.memberAccount.address
            }).on('transactionHash', hash => {
              console.log('transaction sent. Hash:', hash)
              let txpool = this.state.txpool
              txpool[hash] = {
                eventType: 'DirectMessage',
                confirmed: false,
                failed: false,
                submitted: moment().valueOf()
              }
              this.setState({
                txpool: txpool,
                setDirectMessageStatus: {
                  color: 'darkBlue',
                  message: 'Pending...'
                }
              })
            }).on('receipt', receipt => {
              console.log('transaction included in block. Receipt:', receipt)
              let txpool = this.state.txpool
              if (receipt.status === '0x0') {
                if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
                    this.state.txpool[receipt.transactionHash].confirmed === false) {
                  txpool[receipt.transactionHash].confirmed = true
                  txpool[receipt.transactionHash].failed = true
                }
                this.setState({
                  txpool: txpool,
                  setDirectMessageStatus: {
                    color: 'darkRed',
                    message: 'Could not send message.'
                  }
                })
              } else {
                if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
                    this.state.txpool[receipt.transactionHash].confirmed === false) {
                  txpool[receipt.transactionHash].confirmed = true
                }

                this.setState({
                  txpool: txpool,
                  setDirectMessageStatus: {
                    color: 'darkGreen',
                    message: 'Sent message.'
                  }
                })
              }
            }).on('confirmation', (confirmationNumber) => {
              console.log('transaction confirmations:', confirmationNumber)
            }).on('error', (error, receipt) => {
              let txpool = this.state.txpool
              if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
                  this.state.txpool[receipt.transactionHash].confirmed === false) {
                txpool[receipt.transactionHash].failed = true
              }
              this.setState({
                txpool: txpool,
                setDirectMessageStatus: {
                  color: 'darkRed',
                  message: 'Could not send message.'
                }
              })
              console.error(error)
            })
          })
      } else {
        this.state.theCyberContract.methods.directMessage(
          toMemberId,
          message
        ).send({
          from: this.state.memberAccount.address
        }).on('transactionHash', hash => {
          console.log('transaction sent. Hash:', hash)
          let txpool = this.state.txpool
          txpool[hash] = {
            eventType: 'DirectMessage',
            confirmed: false,
            failed: false,
            submitted: moment().valueOf()
          }
          this.setState({
            txpool: txpool,
            setDirectMessageStatus: {
              color: 'darkBlue',
              message: 'Pending...'
            }
          })
        }).on('receipt', receipt => {
          let txpool = this.state.txpool
          if (receipt.status === '0x0') {
            if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
                this.state.txpool[receipt.transactionHash].confirmed === false) {
              txpool[receipt.transactionHash].confirmed = true
              txpool[receipt.transactionHash].failed = true
            }
            this.setState({
              txpool: txpool,
              setDirectMessageStatus: {
                color: 'darkRed',
                message: 'Could not send message.'
              }
            })
          } else {
            if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
                this.state.txpool[receipt.transactionHash].confirmed === false) {
              txpool[receipt.transactionHash].confirmed = true
            }

            this.setState({
              txpool: txpool,
              setDirectMessageStatus: {
                color: 'darkGreen',
                message: 'Sent message.'
              }
            })
          }
        }).on('confirmation', (confirmationNumber) => {
          console.log('transaction confirmations:', confirmationNumber)
        }).on('error', (error, receipt) => {
          let txpool = this.state.txpool
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].failed = true
          }
          this.setState({
            txpool: txpool,
            setDirectMessageStatus: {
              color: 'darkRed',
              message: 'Could not send message.'
            }
          })
          console.error(error)
        })
      }
    }
  }

  callExternal(address, message) {
    // TODO: validate address
    if (this.state.callExternalStatus.message === 'external message') {
      this.setState({
        callExternalStatus: {
          color: 'sienna',
          message: 'Sign transaction to continue...'
        }
      })
      this.state.theCyberContract.methods.passMessage(
        address, message
      ).send({
        from: this.state.memberAccount.address
      }).on('transactionHash', hash => {
        console.log('transaction sent. Hash:', hash)
        let txpool = this.state.txpool
        txpool[hash] = {
          eventType: 'Call',
          confirmed: false,
          failed: false,
          submitted: moment().valueOf()
        }
        this.setState({
          txpool: txpool,
          callExternalStatus: {
            color: 'darkBlue',
            message: 'Pending...'
          }
        })
      }).on('receipt', receipt => {
        console.log('transaction included in block. Receipt:', receipt)
        let txpool = this.state.txpool
        if (receipt.status === '0x0') {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
            txpool[receipt.transactionHash].failed = true
          }
          this.setState({
            txpool: txpool,
            callExternalStatus: {
              color: 'darkRed',
              message: 'Could not call external contract.'
            }
          })
        } else {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
          }

          this.setState({
            txpool: txpool,
            callExternalStatus: {
              color: 'darkGreen',
              message: 'Called external contract.'
            }
          })
        }
      }).on('confirmation', (confirmationNumber) => {
        console.log('transaction confirmations:', confirmationNumber)
      }).on('error', (error, receipt) => {
        let txpool = this.state.txpool
        if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
            this.state.txpool[receipt.transactionHash].confirmed === false) {
          txpool[receipt.transactionHash].failed = true
        }
        this.setState({
          txpool: txpool,
          callExternalStatus: {
            color: 'darkRed',
            message: 'Could not call external contract.'
          }
        })
        console.error(error)
      })
    }
  }

  transferMembership(address) {
    // TODO: validate address
    if (this.state.transferMembershipStatus.message.toLowerCase() === 'set transferred') {
      this.setState({
        transferMembershipStatus: {
          color: 'sienna',
          message: 'Sign transaction to continue...'
        }
      })
      this.state.theCyberContract.methods.transferMembership(
        address
      ).send({
        from: this.state.memberAccount.address
      }).on('transactionHash', hash => {
        console.log('transaction sent. Hash:', hash)
        let txpool = this.state.txpool
        txpool[hash] = {
          eventType: 'MembershipTransferred',
          confirmed: false,
          failed: false,
          submitted: moment().valueOf()
        }
        this.setState({
          txpool: txpool,
          transferMembershipStatus: {
            color: 'darkBlue',
            message: 'Pending...'
          }
        })
      }).on('receipt', receipt => {
        console.log('transaction included in block. Receipt:', receipt)
        let txpool = this.state.txpool
        if (receipt.status === '0x0') {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
            txpool[receipt.transactionHash].failed = true
          }
          this.setState({
            txpool: txpool,
            transferMembershipStatus: {
              color: 'darkRed',
              message: 'Could not transfer membership.'
            }
          })
        } else {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
          }

          this.setState({
            txpool: txpool,
            transferMembershipStatus: {
              color: 'darkGreen',
              message: 'Transferred membership.'
            }
          })

          // reload the view to invalidate current member (TODO: just modify state)
          setTimeout(window.location.reload, 5000)
        }
      }).on('confirmation', (confirmationNumber) => {
        console.log('transaction confirmations:', confirmationNumber)
      }).on('error', (error, receipt) => {
        let txpool = this.state.txpool
        if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
            this.state.txpool[receipt.transactionHash].confirmed === false) {
          txpool[receipt.transactionHash].failed = true
        }
        this.setState({
          txpool: txpool,
          transferMembershipStatus: {
            color: 'darkRed',
            message: 'Could not transfer membership.'
          }
        })
        console.error(error)
      })
    }
  }

  getDonationAddress() {
    this.state.theCyberContract.methods.donationAddress(
    ).call({
      from: this.state.memberAccount.address
    }).then(address => {
      this.setState({
        donationAddress: address
      })
    }).catch(error => {
      console.error(error)
    })
  }

  donateFunds() {
    if (this.state.donateFundsStatus.message === 'donate ether') {
      this.setState({
        donateFundsStatus: {
          color: 'sienna',
          message: 'Sign transaction to continue...'
        }
      })
      this.state.theCyberContract.methods.donateFunds(
      ).send({
        from: this.state.memberAccount.address
      }).on('transactionHash', hash => {
        console.log('transaction sent. Hash:', hash)
        let txpool = this.state.txpool
        txpool[hash] = {
          eventType: 'FundsDonated',
          confirmed: false,
          failed: false,
          submitted: moment().valueOf()
        }
        this.setState({
          txpool: txpool,
          donateFundsStatus: {
            color: 'darkBlue',
            message: 'Pending...'
          }
        })
      }).on('receipt', receipt => {
        console.log('transaction included in block. Receipt:', receipt)
        let txpool = this.state.txpool
        if (receipt.status === '0x0') {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
            txpool[receipt.transactionHash].failed = true
          }
          this.setState({
            txpool: txpool,
            donateFundsStatus: {
              color: 'darkRed',
              message: 'Could not donate lost ether.'
            }
          })
        } else {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
          }

          this.setState({
            txpool: txpool,
            donateFundsStatus: {
              color: 'darkGreen',
              message: 'Sent funds to donation address.'
            }
          })
        }
      }).on('confirmation', (confirmationNumber) => {
        console.log('transaction confirmations:', confirmationNumber)
      }).on('error', (error, receipt) => {
        let txpool = this.state.txpool
        if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
            this.state.txpool[receipt.transactionHash].confirmed === false) {
          txpool[receipt.transactionHash].failed = true
        }
        this.setState({
          txpool: txpool,
          donateFundsStatus: {
            color: 'darkRed',
            message: 'Could not donate lost ether.'
          }
        })
        console.error(error)
      })
    }
  }

  donateTokens(tokenAddress) {
    if (this.state.donateTokensStatus.message === 'donate ERC20') {
      this.setState({
        donateTokensStatus: {
          color: 'sienna',
          message: 'Sign transaction to continue...'
        }
      })
      this.state.theCyberContract.methods.donateTokens(
        tokenAddress
      ).send({
        from: this.state.memberAccount.address
      }).on('transactionHash', hash => {
        console.log('transaction sent. Hash:', hash)
        let txpool = this.state.txpool
        txpool[hash] = {
          eventType: 'TokensDonated',
          confirmed: false,
          failed: false,
          submitted: moment().valueOf()
        }
        this.setState({
          txpool: txpool,
          donateTokensStatus: {
            color: 'darkBlue',
            message: 'Pending...'
          }
        })
      }).on('receipt', receipt => {
        console.log('transaction included in block. Receipt:', receipt)
        let txpool = this.state.txpool
        if (receipt.status === '0x0') {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
            txpool[receipt.transactionHash].failed = true
          }
          this.setState({
            txpool: txpool,
            donateTokensStatus: {
              color: 'darkRed',
              message: 'Could not donate lost ERC20 tokens.'
            }
          })
        } else {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
          }

          this.setState({
            txpool: txpool,
            donateTokensStatus: {
              color: 'darkGreen',
              message: 'Sent ERC20 tokens to donation address.'
            }
          })
        }
      }).on('confirmation', (confirmationNumber) => {
        console.log('transaction confirmations:', confirmationNumber)
      }).on('error', (error, receipt) => {
        let txpool = this.state.txpool
        if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
            this.state.txpool[receipt.transactionHash].confirmed === false) {
          txpool[receipt.transactionHash].failed = true
        }
        this.setState({
          txpool: txpool,
          donateTokensStatus: {
            color: 'darkRed',
            message: 'Could not donate lost ERC20 tokens.'
          }
        })
        console.error(error)
      })
    }
  }

  getMemberInfo(memberId) {
    this.state.theCyberContract.methods.getMemberInformation(
      memberId
    ).call({
      from: this.state.memberAccount.address
    }).then(result => {
      const parsedResult = {
        memberId: memberId,
        isMember: result.memberSince !== '0',
        memberAddress: result.memberAddress,
        memberName: this.web3.utils.hexToUtf8(result.memberName),
        memberKey: result.memberKey,
        memberSince: (
          result.memberSince !== '0' ?
            moment.unix(result.memberSince).format('MM/DD/YY h:mm:ss a') :
            null
        ),
        inactiveSince: (
          result.inactiveSince !== '0' ?
            moment.unix(result.inactiveSince).format('MM/DD/YY h:mm:ss a') :
            null
        )
      }
      console.log(parsedResult)
      return parsedResult
    }).catch(error => {
      console.error(error)
    })
  }

  getMembers() {
    if (this.state.foundMember === null) {
      this.setState({
        foundMember: false
      })
    }

    return Promise.all(
      [...new Array(256).keys()].map(index => {
        return Promise.resolve(this.state.theCyberContract.methods.getMemberInformation(
          index
        ).call({
          from: this.state.memberAccount.address
        }).then(result => {
          let members = this.state.members
          const memberDetails = {
            memberId: index,
            isMember: result.memberSince !== '0',
            memberAddress: result.memberAddress,
            memberName: this.web3.utils.hexToUtf8(result.memberName),
            memberKey: result.memberKey,
            memberSince: (
              result.memberSince !== '0' ?
                moment.unix(result.memberSince).format('MM/DD/YY h:mm:ss a') :
                null
            ),
            inactiveSince: (
              result.inactiveSince !== '0' ?
                moment.unix(result.inactiveSince).format('MM/DD/YY h:mm:ss a') :
                null
            )
          }

          members[index] = memberDetails

          this.setState({
            members: members
          })

          return Promise.resolve(memberDetails)
        }).catch(error => {
          console.error(error)
          return Promise.reject(error)
        }))
      })
    )
  }

  getAccountMembershipStatus(accountIndex) {
    return this.state.theCyberContract.methods.getMembershipStatus(
      this.state.accounts[accountIndex].address
    ).call({
      from: this.state.accounts[accountIndex].address,
      gas: 299999
    }).then(result => {
      if (result.member === true && this.state.foundMember !== true) {
        console.log(`found member: index ${accountIndex}, #${
          result.memberId}, address ${this.state.accounts[accountIndex].address}`)
        this.setState({
          foundMember: true,
          memberAccount: this.state.accounts[accountIndex],
          memberId: parseInt(result.memberId, 10),
          memberAccountIndex: accountIndex
        }, () => {
          this.getMemberDetails()
        })

        return Promise.resolve(parseInt(result.memberId, 10))
      }

      return Promise.resolve(false)
    }).catch(error => {
      console.error(error)

      return Promise.reject(null)
    })
  }

  inactivateSelf() {
    if (this.state.inactivateSelfStatus.message === 'inactivate membership') {
      this.setState({
        inactivateSelfStatus: {
          color: 'sienna',
          message: 'Sign transaction to continue...'
        }
      })
      this.state.theCyberUtilContract.methods.inactivateSelf(
      ).send({
        from: this.state.memberAccount.address
      }).on('transactionHash', hash => {
        console.log('transaction sent. Hash:', hash)
        let txpool = this.state.txpool
        txpool[hash] = {
          eventType: 'SelfProclaimedInactive',
          confirmed: false,
          failed: false,
          submitted: moment().valueOf()
        }
        this.setState({
          txpool: txpool,
          inactivateSelfStatus: {
            color: 'darkBlue',
            message: 'Pending...'
          }
        })
      }).on('receipt', receipt => {
        console.log('transaction included in block. Receipt:', receipt)
        let txpool = this.state.txpool
        if (receipt.status === '0x0') {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
            txpool[receipt.transactionHash].failed = true
          }
          this.setState({
            txpool: txpool,
            inactivateSelfStatus: {
              color: 'darkRed',
              message: 'Could not inactivate membership.'
            }
          })
        } else {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
          }

          this.setState({
            txpool: txpool,
            inactivateSelfStatus: {
              color: 'darkGreen',
              message: 'Inactivated membership.'
            }
          })
        }
      }).on('confirmation', (confirmationNumber) => {
        console.log('transaction confirmations:', confirmationNumber)
      }).on('error', (error, receipt) => {
        let txpool = this.state.txpool
        if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
            this.state.txpool[receipt.transactionHash].confirmed === false) {
          txpool[receipt.transactionHash].failed = true
        }
        this.setState({
          txpool: txpool,
          inactivateSelfStatus: {
            color: 'darkRed',
            message: 'Could not inactivate membership.'
          }
        })
        console.error(error)
      })
    }
  }

  revokeSelf() {
    if (this.state.revokeSelfStatus.message === 'revoke membership') {
      this.setState({
        revokeSelfStatus: {
          color: 'sienna',
          message: 'Sign transaction to continue...'
        }
      })
      this.state.theCyberUtilContract.methods.revokeSelf(
      ).send({
        from: this.state.memberAccount.address
      }).on('transactionHash', hash => {
        console.log('transaction sent. Hash:', hash)
        let txpool = this.state.txpool
        txpool[hash] = {
          eventType: 'SelfRevoked',
          confirmed: false,
          failed: false,
          submitted: moment().valueOf()
        }
        this.setState({
          txpool: txpool,
          revokeSelfStatus: {
            color: 'darkBlue',
            message: 'Pending...'
          }
        })
      }).on('receipt', receipt => {
        console.log('transaction included in block. Receipt:', receipt)
        let txpool = this.state.txpool
        if (receipt.status === '0x0') {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
            txpool[receipt.transactionHash].failed = true
          }
          this.setState({
            txpool: txpool,
            revokeSelfStatus: {
              color: 'darkRed',
              message: 'Could not revoke membership.'
            }
          })
        } else {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
          }

          this.setState({
            txpool: txpool,
            revokeSelfStatus: {
              color: 'darkGreen',
              message: 'Revoked membership.'
            },
            isMember: false
          })

          // reload the view to invalidate current member (TODO: just modify state)
          setTimeout(window.location.reload, 5000)
        }
      }).on('confirmation', (confirmationNumber) => {
        console.log('transaction confirmations:', confirmationNumber)
      }).on('error', (error, receipt) => {
        let txpool = this.state.txpool
        if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
            this.state.txpool[receipt.transactionHash].confirmed === false) {
          txpool[receipt.transactionHash].failed = true
        }
        this.setState({
          txpool: txpool,
          revokeSelfStatus: {
            color: 'darkRed',
            message: 'Could not revoke membership.'
          }
        })
        console.error(error)
      })
    }
  }

  inactivateAll() {
    if (this.state.inactivateAllStatus.message === 'inactivate all') {
      this.setState({
        inactivateAllStatus: {
          color: 'sienna',
          message: 'Sign transaction to continue...'
        }
      })
      this.state.theCyberUtilContract.methods.proclaimAllInactive(
      ).send({
        from: this.state.memberAccount.address
      }).on('transactionHash', hash => {
        console.log('transaction sent. Hash:', hash)
        let txpool = this.state.txpool
        txpool[hash] = {
          eventType: 'ProclaimAllInactive',
          confirmed: false,
          failed: false,
          submitted: moment().valueOf()
        }
        this.setState({
          txpool: txpool,
          inactivateAllStatus: {
            color: 'darkBlue',
            message: 'Pending...'
          }
        })
      }).on('receipt', receipt => {
        console.log('transaction included in block. Receipt:', receipt)
        let txpool = this.state.txpool
        if (receipt.status === '0x0') {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
            txpool[receipt.transactionHash].failed = true
          }
          this.setState({
            txpool: txpool,
            inactivateAllStatus: {
              color: 'darkRed',
              message: 'Could not inactivate members.'
            }
          })
        } else {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
          }

          this.setState({
            txpool: txpool,
            inactivateAllStatus: {
              color: 'darkGreen',
              message: 'Inactivated members.'
            }
          })
        }
      }).on('confirmation', (confirmationNumber) => {
        console.log('transaction confirmations:', confirmationNumber)
      }).on('error', (error, receipt) => {
        let txpool = this.state.txpool
        if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
            this.state.txpool[receipt.transactionHash].confirmed === false) {
          txpool[receipt.transactionHash].failed = true
        }
        this.setState({
          txpool: txpool,
          inactivateAllStatus: {
            color: 'darkRed',
            message: 'Could not inactivate members.'
          }
        })
        console.error(error)
      })
    }
  }

  revokeAll() {
    if (this.state.revokeAllStatus.message === 'revoke all') {
      this.setState({
        revokeAllStatus: {
          color: 'sienna',
          message: 'Sign transaction to continue...'
        }
      })
      this.state.theCyberUtilContract.methods.revokeAllVulnerable(
      ).send({
        from: this.state.memberAccount.address
      }).on('transactionHash', hash => {
        console.log('transaction sent. Hash:', hash)
        let txpool = this.state.txpool
        txpool[hash] = {
          eventType: 'AllVulnerableRevoked',
          confirmed: false,
          failed: false,
          submitted: moment().valueOf()
        }
        this.setState({
          txpool: txpool,
          revokeAllStatus: {
            color: 'darkBlue',
            message: 'Pending...'
          }
        })
      }).on('receipt', receipt => {
        console.log('transaction included in block. Receipt:', receipt)
        let txpool = this.state.txpool
        if (receipt.status === '0x0') {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
            txpool[receipt.transactionHash].failed = true
          }
          this.setState({
            txpool: txpool,
            revokeAllStatus: {
              color: 'darkRed',
              message: 'Could not revoke members.'
            }
          })
        } else {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
          }

          this.setState({
            txpool: txpool,
            revokeAllStatus: {
              color: 'darkGreen',
              message: 'Revoked all vulnerable members.'
            }
          })
        }
      }).on('confirmation', (confirmationNumber) => {
        console.log('transaction confirmations:', confirmationNumber)
      }).on('error', (error, receipt) => {
        let txpool = this.state.txpool
        if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
            this.state.txpool[receipt.transactionHash].confirmed === false) {
          txpool[receipt.transactionHash].failed = true
        }
        this.setState({
          txpool: txpool,
          revokeAllStatus: {
            color: 'darkRed',
            message: 'Could not revoke members.'
          }
        })
        console.error(error)
      })
    }
  }

  heartbeatUtil() {
    if (this.state.heartbeatUtilStatus.message === 'heartbeat util') {
      this.setState({
        heartbeatUtilStatus: {
          color: 'sienna',
          message: 'Sign transaction to continue...'
        }
      })
      this.state.theCyberUtilContract.methods.heartbeat(
      ).send({
        from: this.state.memberAccount.address
      }).on('transactionHash', hash => {
        console.log('transaction sent. Hash:', hash)
        let txpool = this.state.txpool
        txpool[hash] = {
          eventType: 'UtilHeartbeated',
          confirmed: false,
          failed: false,
          submitted: moment().valueOf()
        }
        this.setState({
          txpool: txpool,
          heartbeatUtilStatus: {
            color: 'darkBlue',
            message: 'Pending...'
          }
        })
      }).on('receipt', receipt => {
        console.log('transaction included in block. Receipt:', receipt)
        let txpool = this.state.txpool
        if (receipt.status === '0x0') {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
            txpool[receipt.transactionHash].failed = true
          }
          this.setState({
            txpool: txpool,
            heartbeatUtilStatus: {
              color: 'darkRed',
              message: 'Could not heartbeat utility contract.'
            }
          })
        } else {
          if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
              this.state.txpool[receipt.transactionHash].confirmed === false) {
            txpool[receipt.transactionHash].confirmed = true
          }

          this.setState({
            txpool: txpool,
            heartbeatUtilStatus: {
              color: 'darkGreen',
              message: 'Set utility contract as active.'
            }
          })
        }
      }).on('confirmation', (confirmationNumber) => {
        console.log('transaction confirmations:', confirmationNumber)
      }).on('error', (error, receipt) => {
        let txpool = this.state.txpool
        if (Object.keys(this.state.txpool).includes(receipt.transactionHash) &&
            this.state.txpool[receipt.transactionHash].confirmed === false) {
          txpool[receipt.transactionHash].failed = true
        }
        this.setState({
          txpool: txpool,
          heartbeatUtilStatus: {
            color: 'darkRed',
            message: 'Could not heartbeat utility contract.'
          }
        })
        console.error(error)
      })
    }
  }

  getMemberDetails() {
    this.state.theCyberContract.methods.getMemberInformation(
      this.state.memberId
    ).call({
      from: this.state.memberAccount.address
    }).then(result => {
      let fingerprint = ''
      if (result.memberKey !== '') {
        const pubkey = openpgp.key.readArmored(result.memberKey).keys[0]
        fingerprint = (
          (pubkey && pubkey.primaryKey && pubkey.primaryKey.fingerprint) ?
            pubkey.primaryKey.fingerprint :
            '(unknown fingerprint)'
        )
      }

      this.setState({
        memberName: this.web3.utils.hexToUtf8(result.memberName),
        memberKey: result.memberKey,
        memberKeyFingerprint: fingerprint,
        memberSince: (
          result.memberSince !== '0' ?
            moment.unix(result.memberSince).format('MM/DD/YY h:mm:ss a') :
            null
        ),
        memberInactiveSince: (
          result.inactiveSince !== '0' ?
            moment.unix(result.inactiveSince).format('MM/DD/YY h:mm:ss a') :
            null
        )
      }, () => {
        console.log(
          `found member details - name: ${
            this.state.memberName === '' ? '<no name set>' : this.state.memberName
          }, key with fingerprint: ${
            fingerprint === '' ? '<no key set>' : fingerprint
          }, member since: ${
            this.state.memberSince
          }, inactive since: ${this.state.memberInactiveSince}`
        )
      })
    }).catch(error => {
      console.error(error)
    })
  }

  updateToLatestBlock() {
    return this.web3.eth.getBlockNumber()
      .then(blockNumber => {
        if (blockNumber && (blockNumber > this.state.block.number)) {
          if (!this.state.block.hash) {
            this.setState({
              block: {number: blockNumber}
            })
          }
          return Promise.all([
            this.setAccounts(),
            this.setBlockDetails(blockNumber)
          ]).then(() => {
            this.setState({
              loading: false
            })
          }).then(() => {
            return (
              setTimeout(this.getDonationAddress, 75),
              setTimeout(this.getMembers, 100)
            )
          })
        }
      }).catch(error => {
        console.error(error)
      })
  }

  setBlockDetails(blockNumber) {
    return this.web3.eth.getBlock(blockNumber)
      .then(block => {
        if (block) {
          this.setState({
            block: block
          }, () => {
            let details = document.getElementsByClassName('blockDetails')[0]
            if (typeof details !== 'undefined') {
              if (this.state.flashClear && details.classList.contains('flash')) {
                clearTimeout(this.state.flashClear)
                details.classList.remove('flash')
                setTimeout(() => {
                  details.classList.add('flash')
                }, 10)
              } else {
                details.classList.add('flash')
              }
              const flashClear = setTimeout(() => {
                details.classList.remove('flash')
              }, 5100)
              this.setState({
                flashClear: flashClear
              })
            }
          })
        }
      }).catch(error => {
        console.error(error)
      })
  }

  setAccounts() {
    return Promise.resolve(this.web3.eth.getAccounts()
      .then(addresses => {
        return Promise.resolve(this.setAccountInformation(addresses))
      }).catch(error => {
        const message = 'Could not get accounts, ensure that wallet is not inaccessible or locked.'
        console.error(message, error)
      }))
  }

  setBalanceState(balance, index) {
    let accounts = this.state.accounts
    accounts[index].balance = balance
    this.setState({
      accounts: accounts
    })
  }

  clearTransactionState() {
    this.setState({
      testTransactionStatus: {
        color: 'black',
        message: 'Send test transaction'
      },
      addMemberStatus: {
        color: 'black',
        message: 'set member'
      },
      markMemberInactiveStatus: {
        color: 'black',
        message: 'set inactive'
      },
      revokeMemberStatus: {
        color: 'black',
        message: 'set revoked'
      },
      setMemberNameStatus: {
        color: 'black',
        message: 'set name'
      },
      setMemberKeyStatus: {
        color: 'black',
        message: 'set key'
      },
      heartbeatStatus: {
        color: 'black',
        message: 'set active'
      },
      setMessageStatus: {
        color: 'black',
        message: 'broadcast message'
      },
      setDirectMessageStatus: {
        color: 'black',
        message: 'direct message'
      },
      transferMembershipStatus: {
        color: 'black',
        message: 'set transferred'
      },
      callExternalStatus: {
        color: 'black',
        message: 'external message'
      },
      donateFundsStatus: {
        color: 'black',
        message: 'donate ether'
      },
      donateTokensStatus: {
        color: 'black',
        message: 'donate ERC20'
      },
      inactivateSelfStatus: {
        color: 'black',
        message: 'inactivate membership'
      },
      revokeSelfStatus: {
        color: 'black',
        message: 'revoke membership'
      },
      inactivateAllStatus: {
        color: 'black',
        message: 'inactivate all'
      },
      revokeAllStatus: {
        color: 'black',
        message: 'revoke all'
      },
      heartbeatUtilStatus: {
        color: 'black',
        message: 'heartbeat util'
      }
    })
  }

  clearTransactionPool() {
    this.setState({
      txpool: {}
    })
  }

  setAccountInformation(addresses) {
    let accounts = this.state.accounts
    let foundMember = this.state.foundMember
    return Promise.all(addresses.map((address, index) => {
      if (!(index in accounts)) {
        accounts[index] = {address: address}
        if (foundMember === null) {
          Promise.resolve(this.getAccountMembershipStatus(index))
            .then(memberId => {
              if (memberId !== false) {
                foundMember = true
              }
            })
        }
      }

      Promise.resolve(
        this.web3.eth.getBalance(
          address,
          'latest',
          (error, balance) => {
            if (error) {
              console.error(error)
            }
            this.setBalanceState(balance, index)
          }
        )
      )
      this.setState({
        accounts: accounts
      })

      return Promise.resolve(accounts[index])
    }))
  }

  blinkCursor() {
    this.setState({
      showCursor: !this.state.showCursor
    })
  }

  filterAllEvents() {
    this.setState({
      filterType: 'all events',
      filterAllStatus: {
        color: 'orange',
        textColor: 'black'
      },
      filterPersonalStatus: {
        color: 'black',
        textColor: 'white'
      },
      filterMessagesStatus: {
        color: 'black',
        textColor: 'white'
      },
      filterMembershipChangeStatus: {
        color: 'black',
        textColor: 'white'
      }
    })
    this.filterEvents('all events')
  }

  filterPersonalEvents() {
    this.setState({
      filterType: 'personal',
      filterPersonalStatus: {
        color: 'orange',
        textColor: 'black'
      },
      filterAllStatus: {
        color: 'black',
        textColor: 'white'
      },
      filterMessagesStatus: {
        color: 'black',
        textColor: 'white'
      },
      filterMembershipChangeStatus: {
        color: 'black',
        textColor: 'white'
      }
    })
    this.filterEvents('personal')
  }

  filterMessagesEvents() {
    this.setState({
      filterType: 'messages',
      filterMessagesStatus: {
        color: 'orange',
        textColor: 'black'
      },
      filterAllStatus: {
        color: 'black',
        textColor: 'white'
      },
      filterPersonalStatus: {
        color: 'black',
        textColor: 'white'
      },
      filterMembershipChangeStatus: {
        color: 'black',
        textColor: 'white'
      }
    })
    this.filterEvents('messages')
  }

  filterMembershipChangeEvents() {
    this.setState({
      filterType: 'membership changes',
      filterMembershipChangeStatus: {
        color: 'orange',
        textColor: 'black'
      },
      filterAllStatus: {
        color: 'black',
        textColor: 'white'
      },
      filterPersonalStatus: {
        color: 'black',
        textColor: 'white'
      },
      filterMessagesStatus: {
        color: 'black',
        textColor: 'white'
      }
    })
    this.filterEvents('membership changes')
  }

  async getPassphrase() {
    const message = 'Enter the passphrase for your private key ' +
                    '(or leave empty for no passphrase):'
    let passphrase = prompt(message, '')

    if (passphrase !== null) {
      this.setState({
        passphrase: passphrase
      }, () => {
        return true
      })
    } else {
      return false
    }
  }

  decryptMessages() {
    const pgpHeader = '-----BEGIN PGP MESSAGE-----'
    Object.keys(this.state.events).forEach(event => {
      if (this.state.droppedMemberPrivateKey &&
          this.state.events[event].type === 'DirectMessage' &&
          this.state.events[event].event.returnValues.message.startsWith(pgpHeader) &&
          String(
            this.state.events[event].event.returnValues.toMemberId
          ) === String(this.state.memberId)) {
        this.decryptPrivateKey().then(result => {
          const privateKey = result[0]
          const decrypted = result[1]

          if (decrypted !== true) {
            throw new Error('could not decrypt the private key.')
          }
          openpgp.decrypt({
            message: openpgp.message.readArmored(
              this.state.events[event].event.returnValues.message
            ),
            privateKey: privateKey
          }).then(plaintext => {
            const messageContents = `decrypted message - ${plaintext.data}`
            const message = `direct message to member ${
              this.state.events[event].event.returnValues.toMemberId
            }: ${messageContents}`

            let events = this.state.events
            events[event] = {
              event: this.state.events[event].event,
              type: 'DirectMessage',
              block: this.state.events[event].block,
              member: this.state.events[event].member,
              timestamp: this.state.events[event].timestamp,
              message: message
            }
            this.setState({
              events: events
            }, () => {
              this.filterEvents(this.state.filterType)
            })
          }).catch(error => {
            console.error(error)
            const messageContents = '<error decrypting encrypted message>'
            const message = `direct message to member ${
              this.state.events[event].event.returnValues.toMemberId
            }: ${messageContents}`

            let events = this.state.events
            events[event] = {
              event: this.state.events[event].event,
              type: 'DirectMessage',
              block: this.state.events[event].block,
              member: this.state.events[event].member,
              timestamp: this.state.events[event].timestamp,
              message: message
            }
            this.setState({
              events: events
            }, () => {
              this.filterEvents(this.state.filterType)
            })
          })
        }).catch(error => {
          console.error(error)
        })
      }
    })

    this.filterEvents(this.state.filterType)
  }

  render() {
    if (this.state.loading || !this.state.block) {
      return (
        <div className='App'>
          <div>
            <br />
            <div>
              {'Loading...'}
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className='App'>
        {
          (this.state.hasWeb3 ?
            <div>
              <header className='App-header'>
                <h1 className='App-title'>
                  <MemberGreeting
                    networkId={this.state.networkId}
                    foundMember={this.state.foundMember}
                    memberName={this.state.memberName}
                    memberAccountIndex={this.state.memberAccountIndex}
                    messageBody={this.state.messageBody}
                    showCursor={this.state.showCursor}
                    style={this.style}
                  />
                </h1>
              </header>
              <Row
                style={{
                  ...this.style,
                  borderBottomStyle: 'solid',
                  borderBottomColor: 'grey',
                  borderBottomWidth: '2px'
                }}
              >
                <Col
                  xs={12}
                  sm={12}
                  md={6}
                  lg={6}
                  xl={6}
                  style={{
                    ...this.style,
                    borderRightStyle: 'solid',
                    borderRightColor: 'grey',
                    borderRightWidth: '2px',
                    borderTopStyle: 'solid',
                    borderTopColor: 'grey',
                    borderTopWidth: '2px'
                  }}
                >
                  <br />
                  <div>
                    <BlockSummary
                      block={this.state.block}
                      style={this.style}
                      isSyncing={this.state.isSyncing}
                    />
                    <br />
                    <div style={{...this.style, float: 'left', paddingLeft: '20px'}}>
                      <div style={{...this.style, float: 'left'}}>
                        {'Contract located at\u00a0'}
                      </div>
                      <div style={{...this.style, float: 'left', color: '#0f0'}}>
                        {this.state.cyberAddress}
                      </div>
                    </div>
                    <br />

                    {this.state.foundMember ? <div>
                      <div style={{...this.style, paddingLeft: '20px'}}>
                        <div style={{...this.style, float: 'left'}}>
                          {'Membership owned by\u00a0'}
                        </div>
                        <div style={{...this.style, float: 'left', color: 'dodgerBlue'}}>
                          {this.state.memberAccount.address}
                        </div>
                        <div style={{...this.style, clear: 'both', padding: '8x'}} />
                        <div style={{...this.style, float: 'left'}}>
                          {'\u00a0member # ==>\u00a0'}
                        </div>
                        <div style={{...this.style, float: 'left', color: 'dodgerBlue'}}>
                          {this.state.memberId}
                        </div>
                        <div style={{...this.style, clear: 'both', padding: '8x'}} />
                        <div style={{...this.style, float: 'left'}}>
                          {'\u00a0name ======>\u00a0'}
                        </div>
                        <div style={{...this.style, float: 'left'}}>
                          {this.state.memberName ?
                            this.state.memberName :
                            <span style={{color: 'red'}}>
                              {'<no name set>'}
                            </span>
                          }
                        </div>
                        <div style={{...this.style, clear: 'both', padding: '8x'}} />
                        <div style={{...this.style, float: 'left'}}>
                          {'\u00a0key =======>\u00a0'}
                        </div>
                        <div style={{...this.style, float: 'left'}}>
                          {this.state.memberKeyFingerprint ?
                            <span style={{color: 'white'}}>
                              {this.state.memberKeyFingerprint}
                            </span> :
                            <span style={{color: 'red'}}>
                              {'<no key set>'}
                            </span>}
                        </div>
                        <div style={{...this.style, clear: 'both', padding: '8x'}} />
                        <div style={{...this.style, float: 'left'}}>
                          {'\u00a0created ===>\u00a0'}
                        </div>
                        <div style={{...this.style, float: 'left'}}>
                          {<span style={{color: 'white'}}>{this.state.memberSince}</span>}
                        </div>
                        <div style={{...this.style, clear: 'both', padding: '8x'}} />
                        <div style={{...this.style, float: 'left'}}>
                          {'\u00a0status ====>\u00a0'}
                        </div>
                        <div style={{...this.style, float: 'left'}}>
                          {
                            !this.state.memberInactiveSince ?
                              <span style={{color: 'white'}}>
                                {'active'}
                              </span> :
                              <span style={{color: 'red'}}>
                                {`inactive since ${this.state.memberInactiveSince}`}
                              </span>
                          }
                        </div>
                        <br />
                      </div>
                      <br />
                      <div style={{...this.style, paddingLeft: '20px', paddingRight: '20px'}}>
                        <div style={{...this.style, clear: 'both', padding: '8x'}} />
                        <div style={{...this.style, textAlign: 'left'}}>
                          {'Broadcast message:\u00a0\u00a0\u00a0'}
                        </div>
                        <textarea
                          placeholder={'...'}
                          style={{...this.style}}
                          value={this.state.broadcastForm}
                          onChange={this.handleBroadcastFormChange}
                        />
                        <button
                          style={{
                            ...this.style,
                            float: 'none',
                            background: this.state.setMessageStatus.color
                          }}
                          onClick={() => this.broadcastMessage(this.state.broadcastForm)}
                        >
                          {this.state.setMessageStatus.message}
                        </button>
                        <div style={{...this.style, clear: 'both', padding: '8x'}} />
                        <br />

                        <div style={{...this.style, float: 'left'}}>
                          {'Direct message:\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0'}
                        </div>
                        <input
                          placeholder={'member #'}
                          style={{
                            ...this.style,
                            width: '70px',
                            color: 'white',
                            background: this.state.setDirectMessageStatus.color
                          }}
                          value={this.state.directIdForm}
                          onChange={this.handleDirectIdFormChange}
                        />
                        <div
                          style={{
                            ...this.style,
                            float: 'left',
                            padding: '9px',
                            borderStyle: 'solid',
                            borderColor: 'white',
                            borderWidth: '1px',
                            fontSize: '80%',
                            height: '6px'
                          }}
                        >
                          <div
                            style={{
                              ...this.style,
                              float: 'left',
                              position: 'relative',
                              top: '-7px'
                            }}
                          >
                            {'encrypt\u00a0'}
                          </div>
                          <div
                            style={{
                              ...this.style,
                              float: 'left',
                              position: 'relative',
                              top: '-7px'
                            }}
                          >
                            <span onClick={this.handleEncryptMessageCheckboxChange}>
                              <input
                                type='checkbox'
                                id='checkbox'
                                name='encrypt'
                                checked={this.state.willEncryptDirectMessage}
                              />
                              <span />
                            </span>
                          </div>
                        </div>
                        <textarea
                          placeholder={'...'}
                          style={{...this.style}}
                          value={this.state.directMessageForm}
                          onChange={this.handleDirectMessageFormChange}
                        />
                        <button
                          style={{
                            ...this.style,
                            float: 'none',
                            background: this.state.setDirectMessageStatus.color
                          }}
                          onClick={
                            () => this.directMessage(
                              this.state.directIdForm,
                              this.state.directMessageForm
                            )
                          }
                        >
                          {this.state.setDirectMessageStatus.message}
                        </button>
                        <div style={{...this.style, clear: 'both', padding: '8x'}} />
                        <br />

                        <div style={{...this.style, float: 'left'}}>
                          {'External message:\u00a0\u00a0\u00a0\u00a0'}
                        </div>
                        <input
                          placeholder={'address'}
                          style={{
                            ...this.style,
                            width: '300px',
                            color: 'white',
                            background: this.state.callExternalStatus.color
                          }}
                          value={this.state.externalAddressForm}
                          onChange={this.handleExternalAddressFormChange}
                        />
                        <textarea
                          placeholder={'...'}
                          style={{...this.style}}
                          value={this.state.externalMessageForm}
                          onChange={this.handleExternalMessageFormChange}
                        />
                        <button
                          style={{
                            ...this.style,
                            float: 'none',
                            background: this.state.callExternalStatus.color
                          }}
                          onClick={
                            () => this.callExternal(
                              this.state.externalAddressForm,
                              this.state.externalMessageForm
                            )
                          }
                        >
                          {this.state.callExternalStatus.message}
                        </button>
                        <div style={{...this.style, clear: 'both', padding: '8x'}} />
                        <br />

                        <div style={{...this.style, float: 'left'}}>
                          {'Set member name:\u00a0\u00a0\u00a0\u00a0\u00a0'}
                        </div>
                        <input
                          placeholder={'member name'}
                          style={{
                            ...this.style,
                            width: '240px',
                            color: 'white',
                            background: this.state.setMemberNameStatus.color
                          }}
                          value={this.state.nameForm}
                          onChange={this.handleNameFormChange}
                        />
                        <button
                          style={{...this.style, background: this.state.setMemberNameStatus.color}}
                          onClick={() => this.setMemberName(this.state.nameForm)}
                        >
                          {this.state.setMemberNameStatus.message}
                        </button>
                        <div style={{...this.style, clear: 'both', padding: '8x'}} />
                        <br />

                        <div style={{...this.style, float: 'left'}}>
                          {'Set member key:\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0'}
                        </div>
                        <div style={{...this.style, float: 'left'}}>
                          <Dropzone
                            className={'dropzone'}
                            onDrop={this.onDrop}
                            multiple={false}
                            style={{
                              ...this.style,
                              float: 'left',
                              padding: '9px',
                              borderStyle: 'solid',
                              borderColor: 'white',
                              borderWidth: '1px',
                              fontSize: '80%',
                              height: '6px',
                              width: '240px'
                            }}
                          >
                            <div style={{...this.style, position: 'relative', top: '-7px'}}>
                              {this.state.droppedMemberPublicKey === false ?
                                'click/drop to load public key.' :
                                '\u00a0\u00a0\u00a0\u00a0' +
                                '\u00a0\u00a0\u00a0got public key.' +
                                '\u00a0\u00a0\u00a0\u00a0\u00a0' +
                                '\u00a0\u00a0\u00a0'
                              }
                            </div>
                          </Dropzone>
                        </div>
                        <button
                          style={{...this.style, background: this.state.setMemberKeyStatus.color}}
                          onClick={() => this.setMemberKey(this.state.droppedMemberPublicKey)}
                        >
                          {this.state.setMemberKeyStatus.message}
                        </button>
                        <div style={{...this.style, clear: 'both', padding: '8x'}} />
                        <br />

                        <div style={{...this.style, float: 'left'}}>
                          {'Send heartbeat:\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0'}
                        </div>
                        <button
                          style={{...this.style, background: this.state.heartbeatStatus.color}}
                          onClick={this.sendMemberHeartbeat}
                        >
                          {this.state.heartbeatStatus.message}
                        </button>
                        <div style={{...this.style, clear: 'both', padding: '8x'}} />
                        <br />

                        <div style={{...this.style, float: 'left'}}>
                          {'Transfer membership:\u00a0'}
                        </div>
                        <input
                          placeholder={'member address'}
                          style={{
                            ...this.style,
                            width: '300px',
                            color: 'white',
                            background: this.state.transferMembershipStatus.color
                          }}
                          value={this.state.transferAddressForm}
                          onChange={this.handleTransferAddressFormChange}
                        />
                        <button
                          style={{
                            ...this.style,
                            background: this.state.transferMembershipStatus.color
                          }}
                          onClick={() => this.transferMembership(this.state.transferAddressForm)}
                        >
                          {this.state.transferMembershipStatus.message}
                        </button>
                        <div style={{...this.style, clear: 'both', padding: '8x'}} />
                        <br />

                        <div style={{...this.style, float: 'left'}}>
                          {'Add new member:\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0'}
                        </div>
                        <input
                          placeholder={'member #'}
                          style={{
                            ...this.style,
                            width: '70px',
                            color: 'white',
                            background: this.state.addMemberStatus.color
                          }}
                          value={this.state.newMemberIdForm}
                          onChange={this.handleNewMemberIdFormChange}
                        />
                        <input
                          placeholder={'member name'}
                          style={{
                            ...this.style,
                            width: '240px',
                            color: 'white',
                            background: this.state.addMemberStatus.color
                          }}
                          value={this.state.newMemberNameForm}
                          onChange={this.handleNewMemberNameFormChange}
                        />
                        <input
                          placeholder={'member address'}
                          style={{
                            ...this.style,
                            width: '300px',
                            color: 'white',
                            background: this.state.addMemberStatus.color
                          }}
                          value={this.state.newMemberAddressForm}
                          onChange={this.handleNewMemberAddressFormChange}
                        />
                        <button
                          style={{...this.style, background: this.state.addMemberStatus.color}}
                          onClick={
                            () => this.addMember(
                              this.state.newMemberIdForm,
                              this.state.newMemberNameForm,
                              this.state.newMemberAddressForm
                            )
                          }
                        >
                          {this.state.addMemberStatus.message}
                        </button>
                        <div style={{...this.style, clear: 'both', padding: '8x'}} />
                        <br />

                        <div style={{...this.style, float: 'left'}}>
                          {'Mark as inactive:\u00a0\u00a0\u00a0\u00a0'}
                        </div>
                        <input
                          placeholder={'member #'}
                          style={{
                            ...this.style,
                            width: '70px',
                            color: 'white',
                            background: this.state.markMemberInactiveStatus.color
                          }}
                          value={this.state.inactiveIdForm}
                          onChange={this.handleInactiveIdFormChange}
                        />
                        <button
                          style={{
                            ...this.style,
                            background: this.state.markMemberInactiveStatus.color
                          }}
                          onClick={() => this.markMemberInactive(this.state.inactiveIdForm)}
                        >
                          {this.state.markMemberInactiveStatus.message}
                        </button>
                        <div style={{...this.style, clear: 'both', padding: '8x'}} />
                        <br />

                        <div style={{...this.style, float: 'left'}}>
                          {'Revoke membership:\u00a0\u00a0\u00a0'}
                        </div>
                        <input
                          placeholder={'member #'}
                          style={{
                            ...this.style,
                            width: '70px',
                            color: 'white',
                            background: this.state.revokeMemberStatus.color
                          }}
                          value={this.state.revokedIdForm}
                          onChange={this.handleRevokedIdFormChange}
                        />
                        <button
                          style={{...this.style, background: this.state.revokeMemberStatus.color}}
                          onClick={() => this.revokeMember(this.state.revokedIdForm)}
                        >
                          {this.state.revokeMemberStatus.message}
                        </button>
                        <div style={{...this.style, clear: 'both', padding: '8x'}} />
                        <br />

                        <div style={{...this.style, float: 'left'}}>
                          {'Donate lost ether:\u00a0\u00a0\u00a0'}
                        </div>
                        <button
                          style={{...this.style, background: this.state.donateFundsStatus.color}}
                          onClick={this.donateFunds}
                        >
                          {this.state.donateFundsStatus.message}
                        </button>
                        <div style={{...this.style, clear: 'both', padding: '8x'}} />
                        <br />

                        <div style={{...this.style, float: 'left'}}>
                          {'Donate lost ERC20:\u00a0\u00a0\u00a0'}
                        </div>
                        <input
                          placeholder={'ERC20 address'}
                          style={{
                            ...this.style,
                            width: '300px',
                            color: 'white',
                            background: this.state.donateTokensStatus.color
                          }}
                          value={this.state.tokenAddressForm}
                          onChange={this.handleTokenAddressFormChange}
                        />
                        <button
                          style={{...this.style, background: this.state.donateTokensStatus.color}}
                          onClick={() => this.donateTokens(this.state.tokenAddressForm)}
                        >
                          {this.state.donateTokensStatus.message}
                        </button>
                        <div style={{...this.style, clear: 'both', padding: '8x'}} />
                        <br />

                        <div style={{...this.style, float: 'left'}}>
                          {'Utility functions:\u00a0\u00a0\u00a0'}
                        </div>
                        <button
                          style={{...this.style, background: this.state.inactivateSelfStatus.color}}
                          onClick={this.inactivateSelf}
                        >
                          {this.state.inactivateSelfStatus.message}
                        </button>
                        <button
                          style={{...this.style, background: this.state.revokeSelfStatus.color}}
                          onClick={this.revokeSelf}
                        >
                          {this.state.revokeSelfStatus.message}
                        </button>
                        <button
                          style={{...this.style, background: this.state.inactivateAllStatus.color}}
                          onClick={this.inactivateAll}
                        >
                          {this.state.inactivateAllStatus.message}
                        </button>
                        <button
                          style={{...this.style, background: this.state.revokeAllStatus.color}}
                          onClick={this.revokeAll}
                        >
                          {this.state.revokeAllStatus.message}
                        </button>
                        <button
                          style={{...this.style, background: this.state.heartbeatUtilStatus.color}}
                          onClick={this.heartbeatUtil}
                        >
                          {this.state.heartbeatUtilStatus.message}
                        </button>
                        <div style={{...this.style, clear: 'both', padding: '8x'}} />
                        <br />

                        <div style={{...this.style, float: 'left'}}>
                          {'Keypair management:\u00a0\u00a0'}
                        </div>
                        <div style={{...this.style, float: 'left'}}>
                          <Dropzone
                            className={'dropzone'}
                            onDrop={this.onDropPrivate}
                            multiple={false}
                            style={{
                              ...this.style,
                              float: 'left',
                              padding: '9px',
                              borderStyle: 'solid',
                              borderColor: 'white',
                              borderWidth: '1px',
                              fontSize: '80%',
                              height: '6px'
                            }}
                          >
                            <div style={{...this.style, position: 'relative', top: '-7px'}}>
                              {this.state.droppedMemberPrivateKey === false ?
                               'click/drop to load private key.' : (
                                  this.state.keyDecrypted !== false ?
                                  '\u00a0\u00a0\u00a0\u00a0' +
                                  '\u00a0got private keyfile.' +
                                  '\u00a0\u00a0\u00a0' +
                                  '\u00a0\u00a0\u00a0' :
                                  'failure decrypting private key.'
                                )
                               }
                            </div>
                          </Dropzone>
                        </div>
                        <button
                          onClick={() => this.generateKeypair(4096)}
                        >
                          {this.state.generatingKeypair ?
                            'generating keypair...\u00a0' :
                            'generate a new keypair'
                          }
                        </button>
                        <button
                          onClick={() => this.downloadKeypair()}
                        >
                          {'download keys'}
                        </button>
                        <button
                          onClick={() => this.wipeKeysAndPassphrase()}
                        >
                          {'wipe keys & passphrase'}
                        </button>
                        <div style={{...this.style, clear: 'both', padding: '8x'}} />
                        <br />

                        <div style={{...this.style, float: 'left'}}>
                          {'Personal functions:\u00a0\u00a0'}
                        </div>
                        <button
                          onClick={() => this.getMemberInfo(this.state.memberId)}
                        >
                          {'log member details'}
                        </button>
                        <button
                          onClick={this.clearTransactionState}
                        >
                          {'clear transaction state'}
                        </button>
                        <div style={{...this.style, clear: 'both', padding: '8x'}} />
                        <br />

                      </div> </div> : <div>
                      <div
                        style={{
                          ...this.style,
                          paddingLeft: '20px',
                          float: 'left',
                          color: 'red',
                          textAlign: 'left'
                        }}
                      >
                        {'No membership found, using view-only mode.'}
                      </div>
                      <div style={{...this.style, clear: 'both', padding: '8x'}} />
                    </div>

                    }
                    {
                      (Object.keys(this.state.accounts).length !== 0) ?
                        <div>
                          <div
                            style={{
                              ...this.style,
                              display: 'block',
                              textAlign: 'left',
                              paddingLeft: '20px'
                            }}
                          >
                            <div>
                              {'Personal accounts:'}
                            </div>
                          </div>
                          <AddressSummary
                            accounts={this.state.accounts}
                            networkId={this.state.networkId}
                            style={this.style}
                          />
                          <br />
                        </div>
                        :
                        <div />
                    }

                    <div style={{...this.style, float: 'left', paddingLeft: '20px'}}>
                      {'Membership roster:'}
                    </div>
                    <br />

                    <MembersList
                      members={Array.from(this.state.members)}
                      networkId={this.state.networkId}
                      style={this.style}
                    />
                  </div>
                  <br />

                </Col>
                <Col
                  xs={12}
                  sm={12}
                  md={6}
                  lg={6}
                  xl={6}
                  style={{
                    ...this.style,
                    borderTopStyle: 'solid',
                    borderTopColor: 'grey',
                    borderTopWidth: '2px',
                    boxShadow: '-2px 0 0 grey'
                  }}
                >
                  { this.state.foundMember ?
                    <div>
                      <br />
                      <div style={{...this.style, float: 'left', paddingLeft: '20px'}}>
                        {'Transactions:\u00a0\u00a0'}
                      </div>
                      <button
                        onClick={this.clearTransactionPool}
                      >
                        {'clear tx pool'}
                      </button>
                      <div style={{...this.style, clear: 'both', padding: '8x'}} />
                      <TransactionPoolList
                        transactionPool={this.state.txpool}
                        networkId={this.state.networkId}
                      />
                      <div style={{...this.style, clear: 'both', padding: '8x'}} />
                    </div> :
                    <div />
                  }

                  <br />
                  <div style={{...this.style, float: 'left', paddingLeft: '20px'}}>
                    {'Events:\u00a0\u00a0'}
                  </div>
                  <button
                    style={{
                      ...this.style,
                      color: this.state.filterAllStatus.textColor,
                      background: this.state.filterAllStatus.color
                    }}
                    onClick={this.filterAllEvents}
                  >
                    {'all'}
                  </button>
                  <button
                    style={{
                      ...this.style,
                      color: this.state.filterPersonalStatus.textColor,
                      background: this.state.filterPersonalStatus.color
                    }}
                    onClick={this.filterPersonalEvents}
                  >
                    {'personal'}
                  </button>
                  <button
                    style={{
                      ...this.style,
                      color: this.state.filterMessagesStatus.textColor,
                      background: this.state.filterMessagesStatus.color
                    }}
                    onClick={this.filterMessagesEvents}
                  >
                    {'messages'}
                  </button>
                  <button
                    style={{
                      ...this.style,
                      color: this.state.filterMembershipChangeStatus.textColor,
                      background: this.state.filterMembershipChangeStatus.color
                    }}
                    onClick={this.filterMembershipChangeEvents}
                  >
                    {'memberships'}
                  </button>
                  <div style={{...this.style, clear: 'both', padding: '8x'}} />
                  {this.state.filterType ?
                    <div style={{...this.style, textAlign: 'left'}}>
                      <EventsList
                        events={this.state.events !== null ? this.state.filteredEvents : {}}
                        isMember={this.state.foundMember}
                        filterType={this.state.filterType}
                      />
                    </div> :
                    <div style={{
                      ...this.style,
                      textAlign: 'left',
                      paddingLeft: '30px',
                      paddingTop: '8px'}}
                    >
                      {'Select an event filter...'}
                    </div>
                  }
                  <br />

                </Col>
              </Row>
            </div> :
            <div>
              <header className='App-header' style={{...this.style, color: 'white'}}>
                <h1 className='App-title'>
                  Cannot find a Web3 provider! (Try using&nbsp;
                  <a
                    style={{...this.style, color: 'cyan'}}
                    href='https://metamask.io'
                  >
                    MetaMask
                  </a> on desktop or&nbsp;
                  <a
                    style={{...this.style, color: 'cyan'}}
                    href='https://www.cipherbrowser.com'
                  >
                    Cipher Browser
                  </a>
                  &nbsp;on mobile.)
                </h1>
              </header>
            </div>
          )
        }
      </div>
    )
  }
}

export default class App extends Component {
  constructor(props) {
    super(props)

    // set the custom endpoint form value to match a provided flag.
    const customEndpoint = (
      process.env.REACT_APP_WEB3_PROVIDER ?
        process.env.REACT_APP_WEB3_PROVIDER :
        ''
    )

    this.hasSelected = this.hasSelected.bind(this)
    this.chooseOne = this.chooseOne.bind(this)
    this.chooseTwo = this.chooseTwo.bind(this)
    this.chooseThree = this.chooseThree.bind(this)
    this.chooseFour = this.chooseFour.bind(this)
    this.handleRpcUrlFormChange = this.handleRpcUrlFormChange.bind(this)

    this.state = {
      connnectionType: null,
      currentChoice: 'view',
      rpcUrlForm: customEndpoint,
      choiceOne: {
        textColor: 'black',
        color: 'orange'
      },
      choiceTwo: {
        textColor: 'white',
        color: 'black'
      },
      choiceThree: {
        textColor: 'white',
        color: 'black'
      },
      choiceFour: {
        textColor: 'white',
        color: 'black'
      }
    }
  }

  chooseOne() {
    this.setState({
      currentChoice: 'view',
      choiceOne: {
        textColor: 'black',
        color: 'orange'
      },
      choiceTwo: {
        textColor: 'white',
        color: 'black'
      },
      choiceThree: {
        textColor: 'white',
        color: 'black'
      },
      choiceFour: {
        textColor: 'white',
        color: 'black'
      }
    })
  }

  chooseTwo() {
    this.setState({
      currentChoice: 'inject',
      choiceOne: {
        textColor: 'white',
        color: 'black'
      },
      choiceTwo: {
        textColor: 'black',
        color: 'orange'
      },
      choiceThree: {
        textColor: 'white',
        color: 'black'
      },
      choiceFour: {
        textColor: 'white',
        color: 'black'
      }
    })
  }

  chooseThree() {
    this.setState({
      currentChoice: 'custom',
      choiceOne: {
        textColor: 'white',
        color: 'black'
      },
      choiceTwo: {
        textColor: 'white',
        color: 'black'
      },
      choiceThree: {
        textColor: 'black',
        color: 'orange'
      },
      choiceFour: {
        textColor: 'white',
        color: 'black'
      }
    })
  }

  chooseFour() {
    this.setState({
      currentChoice: 'ledger',
      choiceOne: {
        textColor: 'white',
        color: 'black'
      },
      choiceTwo: {
        textColor: 'white',
        color: 'black'
      },
      choiceThree: {
        textColor: 'white',
        color: 'black'
      },
      choiceFour: {
        textColor: 'black',
        color: 'orange'
      }
    })
  }

  handleRpcUrlFormChange(event) {
    this.setState({
      rpcUrlForm: event.target.value
    })
  }

  hasSelected() {
    this.setState({
      connectionType: this.state.currentChoice
    })
  }

  render() {
    if (this.state.connectionType !== null &&
        typeof this.state.connectionType !== 'undefined') {
      return (
        <Main
          connectionType={this.state.connectionType}
          rpcUrl={this.state.rpcUrlForm}
        />
      )
    }
    return (
      <ConnectionOptions
        currentChoice={this.state.currentChoice}
        choiceOne={this.state.choiceOne}
        choiceTwo={this.state.choiceTwo}
        choiceThree={this.state.choiceThree}
        choiceFour={this.state.choiceFour}
        rpcUrl={this.state.rpcUrlForm}
        onChoiceOne={this.chooseOne}
        onChoiceTwo={this.chooseTwo}
        onChoiceThree={this.chooseThree}
        onChoiceFour={this.chooseFour}
        onChangeRpcUrl={this.handleRpcUrlFormChange}
        onSelect={this.hasSelected}
      />
    )
  }
}
