pragma solidity ^0.4.24;

import "./Ownable.sol";

contract Lottery is Ownable {

    uint ticketPrice;
    uint endingTime;
    uint ticketsSold;
    uint ticketAmount;
    uint ticketsPerPerson;
    uint fee;

    event LotteryCreated(uint ticketPrice);
    event LotteryCanceled();
    event LotteryFinished(address winner, uint ticketsSold); 
    event TicketPurchased(uint buyer, uint ticketPrice);

    address[] uniqueTicketOwners;
    mapping (uint => address) ticketToOwner;
    mapping (address => uint) ownerTicketCount;

    /**
    * @dev For an unlimited amount of tickets in the lottery for its duration, set ticketAmount = 1.
    */
    constructor(uint _ticketPrice, uint _ticketsPerPerson, uint _fee, uint _endingTime, uint _ticketAmount) public {
        require(msg.sender == owner, "Not owner");
        ticketPrice = _ticketPrice;
        ticketsPerPerson = _ticketsPerPerson;
        fee = _fee;
        endingTime = _endingTime;
        ticketAmount = _ticketAmount;
    }

    function buyTicket() public payable {
        require(!_lotteryEnded(), "Lottery has finished.");
        require(ownerTicketCount[msg.sender] < ticketsPerPerson, "You already have the maximum amount of tickets.");
        require(msg.value == ticketPrice, "Incorrect sum paid");
        ticketToOwner[ticketsSold++] = msg.sender;
        ownerTicketCount[msg.sender]++;
        if(ownerTicketCount[msg.sender] == 1) {
            uniqueTicketOwners.push(msg.sender);
        }
    } 

    /**
    * @dev Cancels the lottery by setting the ending time to the current time, then returns ticket sales
    */
    function cancelLottery() public onlyOwner {
        endingTime = block.timestamp;
        for(uint i = 0; i < uniqueTicketOwners.length; i++) {
            uniqueTicketOwners[i].transfer(ownerTicketCount[uniqueTicketOwners[i]] * ticketPrice);
        }
    }

    /**
    * @dev If ticketAmount is greater than 1, compare number to ticketsSold. 
    *      Check if timestamp >= endingTime either way. 
    *      If either condition is true, the lottery is ended.
    */
    function _lotteryEnded() private view returns (bool) {
        return (ticketAmount > 1) ? (ticketAmount == ticketsSold || block.timestamp >= endingTime) : block.timestamp >= endingTime;
    }

    /**
    * @dev Send lotteryWinner their reward
    */
    function finishLottery() public onlyOwner {
        require(_lotteryEnded(), "Lottery is still ongoing.");
        address lotteryWinner = ticketToOwner[ticketSelect()];
        lotteryWinner.transfer(ticketsSold * ticketPrice);
    }

    /* @return a pseudorandom number based off of ending time, tickets sold, fees */
    function ticketSelect() public view returns (uint) {
        require(_lotteryEnded(), "Lottery is still ongoing.");
        return uint(keccak256(abi.encodePacked(endingTime, ticketsSold, fee))) % ticketsSold;
    }
}
