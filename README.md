#  CryptaLot Smart Contract

CryptaLot is an Ethereum-based smart contract that allows for a completely auditable and decentralized lottery.  This lottery smart contract utilizes true randomness through Oraclize, a service that allows for secure access to a RNG.  The functions used to initialize and maintain the smart contract include:

* buyTicket
* pause
* unpause
* canceLottery
* finishLottery
* processWinnings
* renounceAdmin
* renounceOwnership
* restartLottery
* transferAdmin
* transferOwnership

A sample contract deployed on mainnet can be seen here:

https://oneclickdapp.com/jacob-iris/ (will require you to login with Metamask to view in a browser)

And a sample deployed contract can be found here with prior transactions:

https://etherscan.io/address/0x5a0b071e99d6987a73ec9317601f85ee077488f6


Utilizing this dapp, we can access certain variables to display in an application (as can any user with skill to do it):

* Admin
* endingTime
* Fee
* lotteryEnded
* Owner
* ownerTicketCount
* Paused
* ticketAmount
* ticketPrice
* ticketsPerPerson
* ticketsSold
* uniqueOwners
* uniqueTicketOwners
* Winner
* winnerAddress

These variables allow anyone to publicly view the current status of the lottery, as well as to develop any interface i.e. website, mobile application, etc…


